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
import { sendNotification } from './sockets/events/notification.event.js';
import { sendFirebaseNotification } from './firebase/notification.firebase.js';
// import { encryptResponse } from './middlewares/encryption.middleware.js';
// import { emailQueue } from './queue/queue.js';
// import emailWorker from './queue/worker/email.worker.js';
// passport configurations
// configurePassport();
import { PubSub } from '@google-cloud/pubsub';
import { google } from 'googleapis';
import { authorize } from './configs/googlecloud.config.js';

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST;
const __dirname = path.resolve();

initSocketIO(server);

app.use(cookieParser());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
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

const pubsub = new PubSub({
  projectId: 'taskmate-pubsub',
  keyFilename: './service.json',
});

async function testPubSub() {
  const [topics] = await pubsub.getTopics();
  console.log(
    'Topics:',
    topics.map((t) => t.name),
  );
}
testPubSub().catch(console.error);

app.get('/geo-region', (req, res) => {
  const ip = req.clientIp; // Provides IP behind proxies/CDNs too
  var geo = geoip.lookup(ip);
  console.log(geo);
  res.send({ ...geo, ip });
});

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
  const ip = req.clientIp;
  let geo = await geoip.lookup(ip);

  if (mailId) {
    const coldMail = await ColdMail.findById(mailId).populate({
      path: 'leadId',
      select: 'createdBy',
    });

    if (coldMail) {
      // Ignore if too soon after creation (anti-false positive)
      const timeSinceCreate = Date.now() - coldMail.createdAt.getTime();
      if (timeSinceCreate < 5000) {
        // <5 seconds, likely prefetch/send artifact
      } else if (coldMail.status === 'sent') {
        coldMail.status = 'opened';
        coldMail.openedAt = new Date(); // Add field for first open time
        await coldMail.save();
        await sendNotification({
          senderId: coldMail?.leadId?.createdBy?.toString(),
          userIds: coldMail?.leadId?.createdBy?.toString(),
          type: 'Mail Status',
          path: 'ai-automation/lead',
          title: `${coldMail.recipients} opened your mail.`,
          body: `${coldMail.recipients} opened your mail.`,
          eventType: 'notification',
        });
        await sendFirebaseNotification({
          mode: 'creator',
          creatorId: coldMail?.leadId?.createdBy?.toString(),
          title: `Your mail opened by ${coldMail?.recipients}`,
          body: `Your mail opened at ${coldMail?.openedAt?.toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
          })}`,
          imageUrl: 'https://i.ibb.co/7xbdLrHb/cold-mail-notification.png',
          pageLink: 'ai-automation/lead',
        });
      } else {
        // Track multiple opens (add openCount and opens array to model)
        coldMail.openCount = (coldMail.openCount || 0) + 1;
        coldMail.opens = coldMail.opens || [];
        coldMail.opens.push({ timestamp: new Date(), ip: ip, country: geo?.name });
        await coldMail.save();
      }
    }
  }

  const svg = `
<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M54.767 49.4545V50.3068H51.375V49.4545H54.767ZM52.3636 47.8864H53.3693V54.125C53.3693 54.4091 53.4105 54.6222 53.4929 54.7642C53.5781 54.9034 53.6861 54.9972 53.8168 55.0455C53.9503 55.0909 54.0909 55.1136 54.2386 55.1136C54.3494 55.1136 54.4403 55.108 54.5114 55.0966C54.5824 55.0824 54.6392 55.071 54.6818 55.0625L54.8864 55.9659C54.8182 55.9915 54.723 56.017 54.6009 56.0426C54.4787 56.071 54.3239 56.0852 54.1364 56.0852C53.8523 56.0852 53.5739 56.0241 53.3011 55.902C53.0313 55.7798 52.8068 55.5938 52.6278 55.3438C52.4517 55.0938 52.3636 54.7784 52.3636 54.3977V47.8864ZM56.2798 56V49.4545H57.2514V50.4773H57.3366C57.473 50.1278 57.6932 49.8565 57.9972 49.6634C58.3011 49.4673 58.6662 49.3693 59.0923 49.3693C59.5241 49.3693 59.8835 49.4673 60.1705 49.6634C60.4602 49.8565 60.6861 50.1278 60.848 50.4773H60.9162C61.0838 50.1392 61.3352 49.8707 61.6705 49.6719C62.0057 49.4702 62.4077 49.3693 62.8764 49.3693C63.4616 49.3693 63.9403 49.5526 64.3125 49.919C64.6847 50.2827 64.8707 50.8494 64.8707 51.6193V56H63.8651V51.6193C63.8651 51.1364 63.733 50.7912 63.4688 50.5838C63.2045 50.3764 62.8935 50.2727 62.5355 50.2727C62.0753 50.2727 61.7188 50.4119 61.4659 50.6903C61.2131 50.9659 61.0866 51.3153 61.0866 51.7386V56H60.0639V51.517C60.0639 51.1449 59.9432 50.8452 59.7017 50.6179C59.4602 50.3878 59.1491 50.2727 58.7685 50.2727C58.5071 50.2727 58.2628 50.3423 58.0355 50.4815C57.8111 50.6207 57.6293 50.8139 57.4901 51.0611C57.3537 51.3054 57.2855 51.5881 57.2855 51.9091V56H56.2798Z" fill="black" fill-opacity="0.01"/>
</svg>
`;

  const svgBase64 = Buffer.from(svg).toString('base64');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.setHeader('Content-Type', 'image/png');
  const pixel = Buffer.from(svgBase64, 'base64');
  res.end(pixel);
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
    startDate: faker.date.between({
      from: new Date('2024-01-01T00:00:00.000Z'),
      to: new Date('2025-06-16T23:59:59.999Z'),
    }),
    endDate: faker.date.between({
      from: new Date('2024-01-01T00:00:00.000Z'),
      to: new Date('2025-06-16T23:59:59.999Z'),
    }),
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

async function listenForMessages() {
  const subscription = pubsub.subscription('gmail-sub');

  subscription.on('message', async (message) => {
    try {
      const auth = await authorize();
      const gmail = google.gmail({ version: 'v1', auth });

      const res = await gmail.users.messages.list({
        userId: 'me',
        labelIds: ['INBOX'],
        maxResults: 1,
      });

      for (const msg of res.data.messages || []) {
        const fullMsg = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full',
        });

        const threadId = fullMsg.data.threadId;
        const messageId = fullMsg.data.id;
        const headers = fullMsg.data.payload.headers;
        const inReplyTo = headers.find((h) => h.name === 'In-Reply-To')?.value;
        const subject = headers.find((h) => h.name === 'Subject')?.value;
        const from = headers.find((h) => h.name === 'From')?.value;

        function getBody(payload) {
          let body = '';
          if (payload.parts) {
            for (const part of payload.parts) {
              if (part.mimeType === 'text/plain' && part.body?.data) {
                body += Buffer.from(part.body.data, 'base64').toString('utf-8');
              } else if (part.parts) {
                body += getBody(part);
              }
            }
          } else if (payload.body?.data) {
            body += Buffer.from(payload.body.data, 'base64').toString('utf-8');
          }
          return body;
        }

        const replyText = getBody(fullMsg.data.payload);

        function findAttachments(parts = []) {
          const attachments = [];
          for (const part of parts) {
            if (part.filename && part.body?.attachmentId) {
              attachments.push({
                filename: part.filename,
                mimeType: part.mimeType,
                size: part.body.size,
                attachmentId: part.body.attachmentId,
              });
            }
            if (part.parts) {
              attachments.push(...findAttachments(part.parts));
            }
          }
          return attachments;
        }

        const attachments = findAttachments(fullMsg.data.payload.parts || []);
        const savedAttachments = [];

        for (const att of attachments) {
          const attachment = await gmail.users.messages.attachments.get({
            userId: 'me',
            messageId: msg.id,
            id: att.attachmentId,
          });

          const buffer = Buffer.from(attachment.data.data, 'base64');

          const filePath = path.join('medias', 'mail', att.filename);
          fs.writeFileSync(filePath, buffer);

          savedAttachments.push({ ...att, path: filePath });
        }

        if (inReplyTo) {
          let coldMail = await ColdMail.findOne({
            $or: [{ messageId: inReplyTo }, { threadId }],
          }).populate({ path: 'leadId', select: 'title createdBy' });

          if (coldMail) {
            coldMail.status = 'replied';
            coldMail.threadId = coldMail.threadId || threadId;

            coldMail.replies.push({
              from,
              subject,
              body: replyText || fullMsg.data.snippet,
              receivedAt: new Date(),
              messageId,
              threadId,
              attachments: savedAttachments,
            });

            await coldMail.save();
            message.ack();

            await sendNotification({
              senderId: coldMail?.leadId?.createdBy?.toString(),
              userIds: coldMail?.leadId?.createdBy?.toString(),
              type: 'Mail Reply',
              path: 'ai-automation/lead',
              title: `${coldMail.recipients} replied regarding lead: ${
                coldMail?.leadId?.title || 'Unknown Lead'
              }`,
              body: replyText?.split('On')[0]?.slice(0, 50) || 'You received a reply.',
              eventType: 'notification',
            });

            await sendFirebaseNotification({
              mode: 'creator',
              creatorId: coldMail?.leadId?.createdBy?.toString(),
              title: `Reply from ${coldMail?.recipients} on ${coldMail?.leadId?.title || 'Lead'}`,
              body: replyText
                ? replyText.substring(0, 100) + (replyText.length > 100 ? '…' : '')
                : 'Check the reply in your lead.',
              imageUrl: 'https://i.ibb.co/7xbdLrHb/cold-mail-notification.png',
              pageLink: 'ai-automation/lead',
            });

            console.log('✅ Reply saved to ColdMail:', coldMail._id);
          } else {
            console.log('⚠️ No matching ColdMail found for', inReplyTo);
          }
        }
      }
    } catch (err) {
      console.error('❌ Error processing message:', err);
      message.nack();
    }
  });
}

await listenForMessages();

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
