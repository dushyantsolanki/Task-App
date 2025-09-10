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
import { ColdMail, Task, Template } from './models/index.js';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import requestIp from 'request-ip';
import geoip from 'geoip-country';
// import { encryptResponse } from './middlewares/encryption.middleware.js';
// import { emailQueue } from './queue/queue.js';
// import emailWorker from './queue/worker/email.worker.js';
// passport configurations
// configurePassport();

// import './test.js';

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
app.use(requestIp.mw());
// app.use(passport.initialize());
// app.use(encryptResponse);
chromium.use(stealth());

app.get('/geo-region', (req, res) => {
  const ip = req.clientIp; // Provides IP behind proxies/CDNs too
  var geo = geoip.lookup(ip);
  console.log(geo);
  res.send({ ...geo, ip });
});

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

// Endpoint for tracking cold email
app.get('/track/open', async (req, res) => {
  const { mailId } = req.query;
  console.log('MailID :::: ', mailId);

  if (mailId) {
    const coldMail = await ColdMail.findById(mailId);

    if (coldMail) {
      // Ignore if too soon after creation (anti-false positive)
      const timeSinceCreate = Date.now() - coldMail.createdAt.getTime();
      if (timeSinceCreate < 5000) {
        // <5 seconds, likely prefetch/send artifact
        console.log(mailId, 'Ignored early hit');
      } else if (coldMail.status !== 'opened') {
        coldMail.status = 'opened';
        coldMail.openedAt = new Date(); // Add field for first open time
        await coldMail.save();
        console.log(mailId, 'Mail Opened.....');
      } else {
        // Track multiple opens (add openCount and opens array to model)
        coldMail.openCount = (coldMail.openCount || 0) + 1;
        coldMail.opens = coldMail.opens || [];
        coldMail.opens.push({ timestamp: new Date(), ip: req.ip }); // Log IP (though proxied)
        await coldMail.save();
        console.log(mailId, 'Mail Re-Opened.....');
      }
    }
  }

  // No-cache headers to encourage re-fetches on multiple opens
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1" height="1">
      <rect width="1" height="1" fill="transparent"/>
    </svg>
  `);
});

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

async function scrapeFullPage(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle' });

    // Full text content

    const content = await page.evaluate(() => document.body.innerText);

    // Images: only keep absolute HTTP(S) URLs that look like real images
    const imageUrls = await page.evaluate(() => {
      const urls = [];
      document.querySelectorAll('img').forEach((img) => {
        let src = img.src;
        const alt = img.alt || '';
        const width = parseInt(img.width || img.clientWidth || '0', 10);
        const height = parseInt(img.height || img.clientHeight || '0', 10);

        // Skip if no src, data URL, or not absolute HTTP/HTTPS
        if (!src || src.startsWith('data:') || !/^https?:\/\//i.test(src)) return;

        // Skip if too small
        if (width < 50 || height < 50) return;

        // Skip if likely decorative/icon/ad
        if (
          /(sprite|logo|icon|arrow|ads|blank|pixel|tracking|spacer)/i.test(src) ||
          /(icon|logo|arrow|social|button|decorative)/i.test(alt)
        )
          return;

        // Optional: ensure it ends with common image extensions (optional but safer)
        if (!/\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(src.split('?')[0])) return;

        urls.push(src);
      });
      return [...new Set(urls)]; // dedupe
    });

    // Videos: get playable video sources and known embeds
    const videoUrls = await page.evaluate(() => {
      const urls = [];

      // Handle <video> elements and their <source> children
      document.querySelectorAll('video').forEach((video) => {
        // Check video's own src
        let src = video.src;
        if (src && /^https?:\/\//i.test(src) && /\.(mp4|webm|ogg)$/i.test(src.split('?')[0])) {
          urls.push(src);
        }

        // Check <source> children
        video.querySelectorAll('source').forEach((source) => {
          src = source.src || source.getAttribute('src');
          if (
            src &&
            /^https?:\/\//i.test(src) &&
            /\.(mp4|mov|avi|mkv|wmv|flv|mpeg|mpg|3gp|ogv|mxf|m4v|asf|ts|vob|rmvb)$/i.test(
              src.split('?')[0],
            )
          ) {
            urls.push(src);
          }
        });
      });

      // Handle iframe embeds (YouTube, Vimeo, Dailymotion, etc.)
      document.querySelectorAll('iframe').forEach((iframe) => {
        const src = iframe.src || iframe.getAttribute('src');
        if (!src || !/^https?:\/\//i.test(src)) return;

        if (
          src.includes('youtube.com/embed') ||
          src.includes('youtu.be') ||
          src.includes('player.vimeo.com') ||
          src.includes('dailymotion.com/embed') ||
          src.includes('facebook.com/plugins/video.php') ||
          src.includes('instagram.com/p/') ||
          src.includes('tiktok.com/embed')
        ) {
          urls.push(src);
        }
      });

      return [...new Set(urls)]; // dedupe
    });

    return {
      success: true,
      content,
      images: imageUrls,
      videos: videoUrls,
    };
  } catch (err) {
    console.error(`Failed to scrape ${url}:`, err.message);
    return { success: false, content: '', images: [], videos: [] };
  }
}

// main scrap function
async function scrap(query) {
  const browser = await chromium.launch({
    headless: process.env.ISDEVELOPMENT === 'development' ? false : true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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

      if (scraped.success && scraped.content.trim().length > 50) {
        return { site: results, ...scraped };
      }
    }

    return { error: 'Failed to scrape first 3 results' };
  } finally {
    await browser.close();
  }
}

// api endpoint
app.get('/api/v1/overview', async (req, res) => {
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

server.listen(PORT, async () => {
  await connectDB();
  console.log(
    `Server is running........... \nLocal Network : http://localhost:${PORT} \n${
      HOST ? 'Your Network : ' + '' + 'http://' + getIPAdress() + ':' + PORT : ''
    }`,
  );
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
