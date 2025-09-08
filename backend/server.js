import dotenv from 'dotenv';
dotenv.config();
import os from 'os';
import cookieParser from 'cookie-parser';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import connectDB from './configs/db.config.js';
import indexRoute from './routes/index.js';
import logger from './configs/pino.config.js';
import { initSocketIO } from './sockets/index.js';
import './configs/firebase.config.js';
import './crons/calendar.jobs.js';
import Notification from './models/notification.model.js';
import path from 'path';
import { runGroqSearchQA } from './configs/langchai.config.js';
import { Task, Template } from './models/index.js';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import { chromium } from 'playwright';
// import { emailQueue } from './queue/queue.js';
// import emailWorker from './queue/worker/email.worker.js';
// passport configurations
// configurePassport();

const app = express();
const server = createServer(app);

initSocketIO(server);

app.use(cookieParser());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://taskmate.dushyantportfolio.store',
      'https://portfolio-dev-dushyant.vercel.app',
    ],
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
// app.use(express.static(path.join(__dirname, '/frontend/dist')));
// app.get('/', (req, res) => {
//   res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
// });

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

// scrape full page
async function scrapeFullPage(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle' });

    // full text
    const content = await page.evaluate(() => document.body.innerText);

    // images
    const imageUrls = await page.evaluate(() => {
      const urls = [];
      document.querySelectorAll('img').forEach((img) => {
        const src = img.src;
        const alt = img.alt;
        const width = parseInt(img.width || '0', 10);
        const height = parseInt(img.height || '0', 10);

        if (
          !src ||
          src.startsWith('data:') ||
          !src.startsWith('http') ||
          width < 50 ||
          height < 50 ||
          /(sprite|logo|icon|arrow|ads|blank|pixel)/i.test(src) ||
          (alt && /(icon|logo|arrow|social)/i.test(alt))
        )
          return;

        urls.push(src);
      });
      return urls;
    });

    // videos
    const videoUrls = await page.evaluate(() => {
      const urls = [];
      document.querySelectorAll('video, video source, iframe').forEach((el) => {
        const src = el.src || el.getAttribute('src');
        if (!src) return;

        if (el.tagName === 'IFRAME') {
          if (
            src.includes('youtube.com/embed') ||
            src.includes('player.vimeo.com') ||
            src.includes('dailymotion.com/embed')
          ) {
            urls.push(src);
          }
        } else if (src.startsWith('http')) {
          urls.push(src);
        }
      });
      return urls;
    });

    return { success: true, content, images: imageUrls, videos: videoUrls };
  } catch (err) {
    console.error(`Failed to scrape ${url}:`, err.message);
    return { success: false, content: '', images: [], videos: [] };
  }
}

// main scrap function
async function scrap(query) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
  });
  const page = await context.newPage();

  try {
    // search Bing
    await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('#b_results', { state: 'attached' });
    await page.waitForSelector('#b_results', { state: 'visible', timeout: 60000 });
    await page.waitForSelector('#b_results > li', { state: 'visible' });

    // get results
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

    if (!results.length) return { error: 'No search results' };

    // try first 3 results
    for (let i = 0; i < Math.min(3, results.length); i++) {
      const site = results[i];
      const scraped = await scrapeFullPage(page, site.link);

      if (scraped.success && scraped.content.trim().length > 100) {
        return { site: results, ...scraped };
      }
    }

    return { error: 'Failed to scrape first 3 results' };
  } finally {
    await browser.close();
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
      sources: data.site,
      media: { images: data.images, videos: data.videos },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// await emailQueue.add(
//   'sendEmail',
//   { to: 'dushyantsolanki.2002@gmail.com', subject: 'Demo', body: 'Good Morning\nDemo text body' },
//   {
//     // delay: delay + randomDelay, // spread jobs
//     removeOnComplete: true,
//     attempts: 3, // retry if fail
//   },
// );

server.listen(PORT, async () => {
  await connectDB();
  console.log(
    `Server is running........... \nLocal Network : http://localhost:${PORT} \n${
      HOST ? 'Your Network : ' + '' + 'http://' + getIPAdress() + ':' + PORT : ''
    }`,
  );
});
