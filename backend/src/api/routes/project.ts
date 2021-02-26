import type { Request, Response } from 'express';
import * as functions from 'firebase-functions';
import type { ProjectMetadata } from '../../types/ProjectMetadata';
import { firebaseAdmin } from '../../admin';
import type { UserToken } from '../../types/UserToken';
import type { ProjectId } from '../../types/ProjectId';
import type { User } from '../../types/User';
import { verifyUidToken } from '../../util/verifyUidToken';
import type { Uid } from '../../types/Uid';
import { verifyProjectAccess } from '../../util/verifyProjectAccess';

interface GetProjectParams {
  uid: Uid;
  userToken: UserToken;
  projectIds: ReadonlyArray<ProjectId>;
}

interface ProjectLocale {
  code: string;
  name: string;
}

interface ProjectMetadataResponse {
  id: ProjectId;
  locales?: Record<string, ProjectLocale> | ReadonlyArray<ProjectLocale>;
  name: string;
  relativeBasePath: string;
  userRoles: Record<string, 'owner' | 'editor'>;
  /**
   * @deprecated
   * */
  users?: Record<string, Uid>;
}

export async function getProjects(request: Request, response: Response): Promise<void> {
  const keys: ReadonlyArray<keyof GetProjectParams> = ['uid', 'userToken', 'projectIds'];
  const params = request.query as Partial<GetProjectParams>;
  const { uid, userToken, projectIds } = params;

  if (!uid || !userToken) {
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

  const projectsMetadata = await firebaseAdmin
    .database()
    .ref('/projectMetadata')
    .get()
    .then((data) => data.val() as Record<string, ProjectMetadataResponse>);

  const projects: ReadonlyArray<ProjectMetadataResponse> = Object.values(projectsMetadata).filter(
    (project) => {
      const userIds = (Object.keys(
        project.userRoles
      ) as ReadonlyArray<string>) as ReadonlyArray<Uid>;

      if (projectIds?.find((id) => id !== project.id)) return false;
      if (!userIds.find((id) => id === uid)) return false;

      return project;
    }
  );

  response.send({
    data: {
      projects,
    },
  });
}

interface CreateProjectParams {
  name: string;
  id: ProjectId;
  uid: Uid;
  userToken: UserToken;
  currentUserProjectIds: ReadonlyArray<ProjectId>;
  users: ReadonlyArray<User>;
}
export async function createProject(request: Request, response: Response): Promise<void> {
  const keys: ReadonlyArray<keyof CreateProjectParams> = [
    'name',
    'id',
    'uid',
    'userToken',
    'users',
    'currentUserProjectIds',
  ];
  const params: Partial<CreateProjectParams> = request.body;

  const { name, id, uid, userToken, users, currentUserProjectIds } = params;

  if (
    !name ||
    !id ||
    !uid ||
    !userToken ||
    users === undefined ||
    currentUserProjectIds === undefined
  ) {
    response.status(400).send({
      message: `The following params are missing: ${keys.filter((key) => !params[key]).join(', ')}`,
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
    const projectIds: ReadonlyArray<ProjectId> = (await database.ref('projectIds').get()).val();
    const userRoles: Record<string, 'owner' | 'editor'> = users.reduce(
      (accumulator: Record<string, 'owner' | 'editor'>, user) => ({
        ...accumulator,
        [user.uid]: 'editor',
      }),
      {
        [uid]: 'owner',
      }
    );

    functions.logger.log({ userRoles });

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
      success: true,
      message: `Created new project – ${name} – successfully`,
    });
  } catch (error) {
    response.status(400).send(error);
  }
}

interface UpdateProjectMetadataParams extends ProjectMetadata<Uid> {
  userToken: UserToken;
  uid: Uid;
}

export async function updateProjectMetadata(request: Request, response: Response): Promise<void> {
  const keys: ReadonlyArray<keyof UpdateProjectMetadataParams> = [
    'name',
    'id',
    'users',
    'relativeBasePath',
    'uid',
    'userToken',
  ];
  const params: Partial<UpdateProjectMetadataParams> = request.body;
  const { name, id, users, relativeBasePath, uid, userToken } = params;

  if (!name || !id || !users || !relativeBasePath || !uid || !userToken) {
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
    await verifyProjectAccess(uid, id);
  } catch (error) {
    response.status(403).send({
      success: false,
      message: error.message,
    });
    return;
  }

  try {
    const metadata = params;
    delete metadata.userToken;

    await firebaseAdmin.database().ref(`projectMetadata/${id}`).update(metadata);
  } catch (error) {
    response.status(400).send({
      success: false,
      message: error.message,
    });
    return;
  }

  response.send({
    data: {
      params,
    },
  });
}
