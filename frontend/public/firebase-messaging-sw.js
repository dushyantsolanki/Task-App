// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker

const defaultConfig = {
  apiKey: true,
  projectId: true,
  messagingSenderId: true,
  appId: true,
};
const firebaseConfig = {
  apiKey: 'AIzaSyB3gHx6FXAvqLx28MHZavCBUAjjwihULpM',
  authDomain: 'taskmate-cb773.firebaseapp.com',
  projectId: 'taskmate-cb773',
  storageBucket: 'taskmate-cb773.firebasestorage.app',
  messagingSenderId: '682821712421',
  appId: '1:682821712421:web:4ffc1cbd26a3fa78f25dcc',
};
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
    tag: 'notification-1',
    webpush: {
      fcm_options: {
        // link: 'https://firebase-messaging-five.vercel.app/',
        link: 'http://localhost:5173',
        // link: 'http://192.168.83.111:5173',
      },
    },
  };

  // self.registration.showNotification(notificationTitle, notificationOptions);
});
