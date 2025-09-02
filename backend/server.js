import dotenv from 'dotenv';
dotenv.config();
import os from 'os';
import cookieParser from 'cookie-parser';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
// import passport from 'passport';
import connectDB from './configs/db.config.js';
// import configurePassport from './configs/passport.config.js';
import indexRoute from './routes/index.js';
import logger from './configs/pino.config.js';
import { initSocketIO } from './sockets/index.js';
import './configs/firebase.config.js';
import './crons/calendar.jobs.js';
import Notification from './models/notification.model.js';
import path from 'path';
// import { ai } from './configs/genkit.config.js';
import { Builder, By, until } from 'selenium-webdriver';
import { runGroqSearchQA } from './configs/langchai.config.js';
import chrome from 'selenium-webdriver/chrome.js';
import { Task, Template } from './models/index.js';
import { faker } from '@faker-js/faker';
import fs from 'fs';
// passport configurations
// configurePassport();

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
      'https://taskmate.dushyantportfolio.store',
      'https://portfolio-dev-dushyant.vercel.app',
    ],
    // origin: ['*'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(passport.initialize());

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
app.use('/upload', express.static(process.cwd() + 'medias'));

app.get('/medias/:folder/:filename', (req, res) => {
  const { folder, filename } = req.params;

  const filePath = path.join(__dirname, 'medias', folder, filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('File not found');
    }
    res.sendFile(filePath);
  });
});
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
    taskId: faker.number.int({ min: 10, max: 10000 }),
    title: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    label: faker.hacker.noun(),
    status: faker.helpers.arrayElement(statuses),
    priority: faker.helpers.arrayElement(priorities),
    createdBy: '68ad521d790753c2dd5ab757',
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

export const generateFakeTemplates = async (count = 10, userId = null) => {
  try {
    const fakeTemplates = [];

    for (let i = 0; i < count; i++) {
      fakeTemplates.push({
        name: faker.lorem.words(3), // template name
        subject: faker.lorem.sentence(), // fake subject
        body: faker.lorem.paragraphs(2), // fake email body
        createdBy: userId || null, // pass a userId if you want to associate
        isDeleted: false,
      });
    }

    const inserted = await Template.insertMany(fakeTemplates);
    console.log(`✅ Inserted ${inserted.length} fake templates`);
    return inserted;
  } catch (err) {
    console.error('❌ Error generating fake templates:', err);
    throw err;
  }
};

// generateFakeTemplates(100, '68ad521d790753c2dd5ab757');
function getRandomUserAgent() {
  const agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/118 Safari/537.36',
  ];
  return agents[Math.floor(Math.random() * agents.length)];
}

// scrape full page
async function scrapeFullPage(driver, url) {
  try {
    await driver.get(url);
    await driver.sleep(1000);

    const body = await driver.findElement(By.tagName('body'));
    const content = await body.getText();

    // images
    const imageUrls = [];
    const imageElements = await driver.findElements(By.css('img'));
    for (const img of imageElements) {
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      const width = parseInt((await img.getAttribute('width')) || '0', 10);
      const height = parseInt((await img.getAttribute('height')) || '0', 10);

      if (
        !src ||
        src.startsWith('data:') ||
        !src.startsWith('http') ||
        width < 50 ||
        height < 50 ||
        /(sprite|logo|icon|arrow|ads|blank|pixel)/i.test(src) ||
        (alt && /(icon|logo|arrow|social)/i.test(alt))
      ) {
        continue;
      }
      imageUrls.push(src);
    }

    // videos
    const videoUrls = [];
    const videoElements = await driver.findElements(By.css('video source, video'));
    for (const vid of videoElements) {
      const src = await vid.getAttribute('src');
      if (src && src.startsWith('http')) videoUrls.push(src);
    }

    const iframeElements = await driver.findElements(By.css('iframe'));
    for (const iframe of iframeElements) {
      const src = await iframe.getAttribute('src');
      if (
        src &&
        (src.includes('youtube.com/embed') ||
          src.includes('player.vimeo.com') ||
          src.includes('dailymotion.com/embed'))
      ) {
        videoUrls.push(src);
      }
    }

    return { success: true, content, images: imageUrls, videos: videoUrls };
  } catch (err) {
    console.error(`Failed to scrape ${url}:`, err.message);
    return { success: false, content: '', images: [], videos: [] };
  }
}

const options = new chrome.Options();
options.addArguments(
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  `--user-agent=${getRandomUserAgent()}`,
);

let driver = null;

// main scrap function
async function scrap(query) {
  driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  try {
    // open bing
    await driver.get(`https://www.bing.com/search?q=${encodeURIComponent(query)}`);
    await driver.wait(until.elementLocated(By.css('#b_results')), 200000);

    // get results directly
    const results = await driver.executeScript(() => {
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

    if (!results.length) return { error: 'No search results' };

    // try first 3 results
    for (let i = 0; i < Math.min(3, results.length); i++) {
      const site = results[i];
      const scraped = await scrapeFullPage(driver, site.link);

      if (scraped.success && scraped.content.trim().length > 100) {
        return { site, ...scraped };
      }
    }

    return { error: 'Failed to scrape first 3 results' };
  } finally {
    await driver.quit();
  }
}

// api endpoint
app.get('/api/overview', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query is required' });

  try {
    const data = await scrap(q);
    if (data.error) return res.status(500).json(data);

    const summary = await runGroqSearchQA(data.content, q);

    res.json({
      summary,
      source: data.site,
      media: { images: data.images, videos: data.videos },
    });
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
