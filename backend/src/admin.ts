import * as admin from 'firebase-admin';
import type { AppOptions } from 'firebase-admin';

export const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  databaseURL: 'https://mm-content-manager.firebaseio.com',
} as AppOptions);
