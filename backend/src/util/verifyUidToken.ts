import type { Uid } from '../types/Uid';
import type { UserToken } from '../types/UserToken';
import { firebaseAdmin } from '../admin';

export async function verifyUidToken(token: UserToken, uid: Uid): Promise<void> {
  const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
  if (decodedToken.uid !== uid) throw new Error(`Token doesn't match UID`);
}
