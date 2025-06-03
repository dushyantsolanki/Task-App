import { Server } from 'socket.io';
import { verifyToken } from './middlewares/verifyToken.middleware.js';
import {
  addActiveUser,
  getActiveUsers,
  removeActiveUser,
  serializeMapOfSets,
} from './utils/trackUser.utils.js';
import logger from '../configs/pino.config.js';

let io;
export const initSocketIO = (server) => {
  io = new Server(server, {
    cors: {
      //   origin: process.env.CLIENT_URL,
      origin: '*',
      methods: ['GET', 'POST'],
      // credentials: true,
    },
  });

  io.use(verifyToken);

  io.on('connection', (socket) => {
    const userId = socket.user?._id?.toString();
    const email = socket.user?.email;

    if (!userId) return socket.disconnect(true);

    addActiveUser(userId, socket.id);

    logger.info({
      function: 'initSocketIO',
      activeUsers: serializeMapOfSets(getActiveUsers()),
      message: 'Active Users',
    });

    socket.on('disconnect', () => {
      removeActiveUser(userId, socket.id);
      socket.disconnect(true);
      logger.info({
        function: 'initSocketIO',
        message: `User ${email + ' --- ' + userId} disconnected socket ${socket.id}`,
      });
    });
  });
};

export { io };
