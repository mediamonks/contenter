// import * as functions from 'firebase-functions';
import type { Request, Response } from 'express';
import { firebaseAdmin } from '../../admin';
import { UserToken } from '../../types/UserToken';
import { Uid } from '../../types/Uid';
import { ProjectId } from '../../types/ProjectId';
import { User } from '../../types/User';

export interface CreateProjectParams {
  name?: string;
  id?: ProjectId;
  uid?: Uid;
  userToken?: UserToken;
  users?: Array<User>;
  currentUserProjectIds?: Array<ProjectId>;
}

export async function createProject(request: Request, response: Response): Promise<void> {
  const { name, id, uid, userToken, users, currentUserProjectIds } = JSON.parse(
    request.body
  ) as CreateProjectParams;

  if (
    !name ||
    !id ||
    !uid ||
    !userToken ||
    users === undefined ||
    currentUserProjectIds === undefined
  ) {
    response.status(400).send({
      message: 'Not all params are present',
      success: false,
    });
    return;
  }

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(userToken);
    if (decodedToken.uid !== uid) {
      response.status(403).send({
        success: false,
        message: `Token doesn't match UID`,
      });
      return;
    }
  } catch (error) {
    response.status(403).send({
      success: false,
      message: error.message,
    });
    return;
  }

  const database = firebaseAdmin.database();

  try {
    const projectIds: Array<ProjectId> = (await database.ref('projectIds').get()).val();

    await Promise.all<void>([
      database.ref(`projectMetadata/${id}`).set({
        name,
        id,
        users: [uid, users],
        relativeBasePath: '/',
      }),
      database.ref(`projectIds/${projectIds.length}`).set(id),
      database.ref(`users/${uid}/projectIds`).set([...currentUserProjectIds, id]),
      ...users.map((user) => {
        const currentProjectIds = user.projectIds ?? [];

        return database.ref(`users/${user.uid}`).set({
          ...user,
          projectIds: [...currentProjectIds, id],
        });
      }),
    ]);

    response.send({
      succes: true,
      message: `Created new project – ${name} – successfully`,
    });
  } catch (error) {
    response.status(400).send(error);
  }
}
