import pino from 'pino';
import { join } from 'path';
import fs from 'fs';

// const isDevelopment = process.env.NODE_ENV !== 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

const logFilePath = join(process.cwd(), 'logs', 'app.log');

if (!fs.existsSync(logFilePath)) {
  fs.mkdirSync('logs', { recursive: true }); // ensure logs folder exists other wise recursive will create it
}

const transport = pino.transport({
  targets: [
    {
      target: 'pino-pretty',
      level: 'info',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: true,
      },
    },
    // {
    //   target: 'pino/file', // built-in file transport
    //   level: 'info',
    //   options: {
    //     colorize: false,
    //     translateTime: 'SYS:standard',
    //     ignore: 'pid,hostname',
    //     singleLine: true,
    //     destination: logFilePath,
    //   },
    // },
  ],
});

const logger = pino(isDevelopment ? transport : pino.destination(logFilePath));

export default logger;
