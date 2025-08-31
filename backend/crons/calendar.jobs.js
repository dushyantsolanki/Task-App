import cron from 'node-cron';
import { Calendar } from '../models/index.js';
import { sendFirebaseNotification } from '../firebase/notification.firebase.js';
import { sendNotification } from '../sockets/events/notification.event.js';
import logger from '../configs/pino.config.js';

// ---------------------------------------------------------------------------------------------------------------------

console.log(
  '------------------------------------ 1. Calendar Event Reminder Cron Job Start -------------------------------------',
);

// ---------------------------------------------------------------------------------------------------------------------

cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const fiveMinLater = new Date(now.getTime() + 5 * 60 * 1000);

    const upcomingEvents = await Calendar.find({
      start: {
        $gte: now,
        $lte: fiveMinLater,
      },
      reminderSent: false,
      isDeleted: false,
    });

    for (const event of upcomingEvents) {
      /* ------------- Send notification via Firebase Cloud Messaging ----------------------------------------------*/

      await sendFirebaseNotification({
        mode: 'creator',
        creatorId: event.createdBy?.toString(),
        title: 'Event Reminder',
        body: `Your event "${event.title}" starts at ${event.start.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
        })}`,
        imageUrl: 'https://i.ibb.co/wFTKB6gw/Calendar-and-Bell-Icons-Lit-Vibrantly.png',
        pageLink: '/dashboard',
      });

      /* 

    1. all users

      await sendFirebaseNotification({
        mode: 'all',
        title: 'Announcement',
        body: 'We launched a new feature!',
      });

    2. For a Selected userIds

      await sendFirebaseNotification({
        mode: 'selected',
        selectedUserIds: ['6657fa9ce9039b6fb0a8423c', '6657fa9ce9039b6fb0a8888'],
        title: 'New Task Assigned',
        body: 'You have been assigned a new task!',
      });

    3. Send your notification (Socket.IO, email, etc.)
        sendNotification({
          title: 'Event Reminder',
          body: `Your event "${event.title}" starts at ${event.start.toLocaleTimeString()}`,
          // You can add userId or other data here if needed
        });

        */

      /*  -------------- Send notification via socket-io ---------------------- */

      await sendNotification({
        senderId: event.createdBy,
        // userIds: 'userId' | ['user1Id , user2Id]
        userIds: event.createdBy?.toString(),
        type: 'reminder',
        path: '/dashboard',
        title: `${event.title}`,
        body: `${event.description}`,
        eventType: 'notification',
      });

      event.reminderSent = true; // mark as a reminder sent
      await event.save();
    }

    if (upcomingEvents.length > 0) {
      logger.info({
        function: 'Calendar-Cron-Job',
        message: `[${new Date().toISOString()}] Sent reminders for ${
          upcomingEvents.length
        } events.`,
      });
    }
  } catch (err) {
    logger.error(err, 'Error in Calendar-Cron-Job');
  }
});
