import dotenv from 'dotenv';
dotenv.config();
import os from 'os';
import cookieParser from 'cookie-parser';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import passport from 'passport';
import connectDB from './configs/db.config.js';
import configurePassport from './configs/passport.config.js';
import indexRoute from './routes/index.js';
import logger from './configs/pino.config.js';
import { initSocketIO } from './sockets/index.js';
import './configs/firebase.config.js';
import './crons/calendar.jobs.js';
import Notification from './models/notification.model.js';
import path from 'path';
// import { ai } from './configs/genkit.config.js';
import puppeteer, { executablePath } from 'puppeteer';
// import { Builder, By } from 'selenium-webdriver';
import { runGroqSearchQA } from './configs/langchai.config.js';
// import chrome from 'selenium-webdriver/chrome.js';
import { Task } from './models/index.js';
import { faker } from '@faker-js/faker';
// passport configurations
configurePassport();

const app = express();
const server = createServer(app);

initSocketIO(server);

// middlewares setup
app.use(cookieParser());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://192.168.0.133:5173',
      'http://localhost:4173',
      'http://192.168.83.111:5173',
      'http://localhost:3000',
      'https://portfolio-dev-dushyant.vercel.app',
    ],
    // origin: ['*'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST;
const __dirname = path.resolve();

// function to get the IP address of the machine
const getIPAdress = () => {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return '127.0.0.1';
};

app.use((req, res, next) => {
  logger.info(
    {
      url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      method: req.method,
      status: res.statusCode,
      IP: req.ip,
    },
    '---- Request made ----',
  );

  next();
});

app.use('/api/v1', indexRoute);

//  Frontend files serving via a backend
app.use(express.static(path.join(__dirname, '/frontend/dist')));
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
});

const notification_migration = async (data) => {
  try {
    await Notification.insertMany(data);
  } catch (err) {
    logger.error(err, 'Error in createNotification');
  }
};

const notification_data = [
  {
    recipient: '6834220327b8045d109b7865',
    sender: '6834220327b8045d109b7865',
    type: 'comment',
    path: '/projects/123/tasks/456',
    title: 'New Comment on Task',
    body: "John commented on the task 'Fix login bug'.",
    read: false,
    isDeleted: false,
  },
  {
    recipient: '6834220327b8045d109b7865',
    sender: '6834220327b8045d109b7865',
    type: 'mention',
    path: '/projects/123/tasks/789',
    title: 'You were mentioned',
    body: 'Jane mentioned you in a task comment.',
    read: false,
    isDeleted: false,
  },
  {
    recipient: '6834220327b8045d109b7865',
    sender: '6834220327b8045d109b7865',
    type: 'assignment',
    path: '/projects/123/tasks/321',
    title: 'Task Assigned',
    body: "You have been assigned a new task: 'Update documentation'.",
    read: true,
    isDeleted: false,
  },
  {
    recipient: '6658fa5c3d394e0b5d45e104',
    sender: '6834220327b8045d109b7865',
    type: 'project-invite',
    path: '/projects/999',
    title: 'Project Invitation',
    body: "You’ve been invited to join the project 'Marketing Website'.",
    read: false,
    isDeleted: false,
  },
];

const statuses = ['pending', 'processing', 'success', 'failed'];
const priorities = ['low', 'medium', 'high'];

/**
 * Generate a single fake task
 */

const generateFakeTask = () => {
  return {
    title: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    label: faker.hacker.noun(),
    status: faker.helpers.arrayElement(statuses),
    priority: faker.helpers.arrayElement(priorities),
    createdBy: '684832c80652542b2dcc5302',
    isDeleted: false,
    createdAt: faker.date.between({
      from: new Date('2024-01-01T00:00:00.000Z'),
      to: new Date('2025-06-16T23:59:59.999Z'),
    }),
    updatedAt: new Date(),
  };
};

const migrateTasks = async () => {
  try {
    const fakeTasks = Array.from({ length: 100 }, generateFakeTask);

    await Task.insertMany(fakeTasks);
    console.log(`Inserted ${fakeTasks.length} fake tasks`);

    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};
// migrateTasks();
// notification_migration(notification_data);

// Web scraping example using a pupeeter and selinium

// Step 1: User-agent pool
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Mobile/15E148 Safari/604.1',
];

// Step 2: Get random user-agent
function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Scrape full page content, images, and videos from a URL
async function scrapeFullPage(url) {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

  const content = await page.evaluate(() => document.body.innerText);

  // Extract images
  const images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img'))
      .map((img) => ({
        src: img.src,
        alt: img.alt,
        width: img.width,
        height: img.height,
      }))
      .filter(
        (img) =>
          img.src &&
          img.src.startsWith('http') &&
          img.width > 50 &&
          img.height > 50 &&
          !/sprite|icon|logo|arrow|ads|pixel|blank/i.test(img.src) &&
          !/icon|logo|social/i.test(img.alt),
      )
      .map((img) => img.src);
  });

  // Extract videos
  const videos = await page.evaluate(() => {
    const videoSources = Array.from(document.querySelectorAll('video source, video'))
      .map((v) => v.src)
      .filter(Boolean);
    const iframeVideos = Array.from(document.querySelectorAll('iframe'))
      .map((i) => i.src)
      .filter(
        (src) =>
          src.includes('youtube.com/embed') ||
          src.includes('player.vimeo.com') ||
          src.includes('dailymotion.com/embed'),
      );
    return [...videoSources, ...iframeVideos];
  });

  await browser.close();
  return { content, images, videos };
}

// Scrape Bing search results
async function scrapeBing(query) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  );
  await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });

  const results = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('li.b_algo').forEach((el) => {
      const h2 = el.querySelector('h2');
      const link = h2?.querySelector('a')?.href;
      const title = h2?.innerText || '';
      const snippet = el.querySelector('p')?.innerText || '';
      if (link && title) {
        const domain = new URL(link).hostname.replace('www.', '');
        const favicon = `https://www.google.com/s2/favicons?sz=64&domain_url=${link}`;
        items.push({ title, link, snippet, source: domain, favicon });
      }
    });
    return items;
  });

  await browser.close();
  return results;
}

app.get('/api/overview', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query is required' });

  try {
    const sources = await scrapeBing(q);

    if (!sources.length) {
      return res.status(404).json({ error: 'No search results found' });
    }

    // Run 3 scrapes in parallel, take the first one that finishes
    const scrapePromises = sources.slice(0, 3).map((s) => scrapeFullPage(s.link));
    const { content, images, videos } = await Promise.any(scrapePromises);

    const summary = await runGroqSearchQA(content, q);

    res.json({ summary, sources, media: { images, videos } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

server.listen(PORT, async () => {
  await connectDB();
  console.log(
    `Server is running........... \nLocal Network : http://localhost:${PORT} \n${
      HOST ? 'Your Network : ' + '' + 'http://' + getIPAdress() + ':' + PORT : ''
    }`,
  );
});
