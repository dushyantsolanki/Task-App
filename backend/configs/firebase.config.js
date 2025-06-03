// import admin from 'firebase-admin';
// import serviceAccount from '../taskmate-cb773-firebase-adminsdk-fbsvc-768bbd6177.json' assert { type: 'json' };
// // import fs from 'fs';
// // import path from 'path';
// // import dotenv from 'dotenv';

// // dotenv.config();

// // Build absolute path to JSON
// // const serviceAccountPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
// // const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// export default admin;

import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.GOOGLE_PROJECT_ID,
      privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
      privateKeyId: process.env.GOOGLE_PRIVATE_KEY_ID,
      clientId: process.env.GOOGLE_CLIENT_ID,
      authUri: process.env.GOOGLE_AUTH_URI,
      tokenUri: process.env.GOOGLE_TOKEN_URI,
      authProviderX509CertUrl: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
      clientC509CertUrl: process.env.GOOGLE_CLIENT_CERT_URL,
      universeDomain: process.env.GOOGLE_UNIVERSE_DOMAIN,
    }),
  });
}

export default admin;
