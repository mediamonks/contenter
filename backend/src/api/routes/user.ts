import type { Request, Response } from 'express';
import * as functions from 'firebase-functions';
import { firebaseAdmin } from '../../admin';
import type { UserToken } from '../../types/UserToken';
import type { User } from '../../types/User';
import { verifyUidToken } from '../../util/verifyUidToken';

interface CreateUserParams extends User {
  userToken: UserToken;
}

export async function createUser(request: Request, response: Response): Promise<void> {
  functions.logger.log('Start user creation');
  functions.logger.log(request.body);
  const keys: ReadonlyArray<keyof CreateUserParams> = [
    'displayName',
    'email',
    'uid',
    'userToken',
    'photoUrl',
  ];

  const params: Partial<CreateUserParams> = JSON.parse(request.body);
  const { displayName, email, uid, userToken, photoUrl } = params;

  if (!displayName || !email || !uid || !userToken || !photoUrl) {
    response.status(400).send({
      error: {
        code: 'error.missing_params',
        message: `The following params are missing: ${keys
          .filter((key) => !params[key])
          .join(', ')}`,
      },
    });
    return;
  }

  try {
    await verifyUidToken(userToken, uid);
  } catch (error) {
    response.status(403).send({
      error: {
        code: 'error.auth',
        message: `Token is doesn't match provided UID`,
      },
    });
    return;
  }

  await firebaseAdmin.database().ref(`users/${uid}`).set({
    displayName,
    email,
    uid,
    photoUrl,
  });

  response.send({
    data: {
      user: {
        displayName,
        email,
        uid,
        photoUrl,
      },
    },
  });
}
