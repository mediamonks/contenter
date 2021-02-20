import type { Request, Response } from 'express';
import { firebaseAdmin } from '../../admin';
import type { UserToken } from '../../types/UserToken';
import type { User } from '../../types/User';
import { verifyUidToken } from '../../util/verifyUidToken';

interface CreateUserParams extends User {
  userToken: UserToken;
}

export async function createUser(request: Request, response: Response): Promise<void> {
  const { displayName, email, uid, userToken, photoUrl }: Partial<CreateUserParams> = JSON.parse(
    request.body
  );
  if (!displayName || !email || !uid || !userToken || !photoUrl) {
    response.status(400).send({
      message: 'Not all params are present',
      success: false,
    });
    return;
  }

  try {
    await verifyUidToken(userToken, uid);
  } catch (error) {
    response.status(403).send({
      message: `Token is doesn't match provided UID`,
      success: false,
    });
    return;
  }

  firebaseAdmin.database().ref(`users/${uid}`).set({
    displayName,
    email,
    uid,
    photoUrl,
  });

  response.send({
    succes: true,
    message: 'ok',
  });
}
