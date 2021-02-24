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
      error: {
        code: 'error.missing_params',
        message: 'Not all params are present',
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
