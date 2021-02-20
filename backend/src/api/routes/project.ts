import type { Request, Response } from 'express';
import { firebaseAdmin } from '../../admin';
import { UserToken } from '../../types/UserToken';
import { ProjectId } from '../../types/ProjectId';
import { User } from '../../types/User';
import { verifyUidToken } from '../../util/verifyUidToken';
import { Uid } from '../../types/Uid';

interface CreateProjectParams {
  name: string;
  id: ProjectId;
  uid: Uid;
  userToken: UserToken;
  currentUserProjectIds: Array<ProjectId>;
  users: Array<User>;
}

export async function createProject(request: Request, response: Response): Promise<void> {
  const {
    name,
    id,
    uid,
    userToken,
    users,
    currentUserProjectIds,
  }: Partial<CreateProjectParams> = JSON.parse(request.body);

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
    await verifyUidToken(userToken, uid);
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
    const userRoles: Record<string, 'owner' | 'editor'> = {
      [uid]: 'owner',
    };

    users.forEach((user) => {
      userRoles[user.uid] = 'editor';
    });

    await Promise.all<void>([
      database.ref(`projectMetadata/${id}`).set({
        name,
        id,
        users: [uid, users],
        userRoles,
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
