import type { Request, Response } from 'express';
import type { ProjectMetadata } from '../../types/ProjectMetadata';
import { firebaseAdmin } from '../../admin';
import type { UserToken } from '../../types/UserToken';
import type { ProjectId } from '../../types/ProjectId';
import type { User } from '../../types/User';
import { verifyUidToken } from '../../util/verifyUidToken';
import type { Uid } from '../../types/Uid';
import { verifyProjectAccess } from '../../util/verifyProjectAccess';

interface GetProjectParams {
  uid: string;
  userToken: UserToken;
  projectIds: Array<ProjectId>;
}

interface ProjectLocale {
  code: string;
  name: string;
}

interface ProjectMetadataResponse {
  id: ProjectId;
  locales?: Record<string, ProjectLocale> | Array<ProjectLocale>;
  name: string;
  relativeBasePath: string;
  userRoles: Record<string, 'owner' | 'editor'>;
  /**
   * @deprecated
   * */
  users?: Record<string, Uid>;
}

export async function getProjects(request: Request, response: Response): Promise<void> {
  const { uid, userToken, projectIds } = request.query as Partial<GetProjectParams>;

  if (!uid || !userToken) {
    response.status(400).send({
      error: {
        code: 'error.missing_params',
        message: 'Not all params are present',
      },
    });
    return;
  }

  const projectsMetadata = await firebaseAdmin
    .database()
    .ref('/projectMetadata')
    .get()
    .then((data) => data.toJSON() as Record<string, ProjectMetadataResponse>);

  let projects = [...Object.values(projectsMetadata)];

  projects = projects.filter((project) => {
    const userIds = Object.keys(project.userRoles) as Array<Uid>;

    if (projectIds?.find((id) => id !== project.id)) return false;
    if (!userIds.find((id) => id === uid)) return false;

    let locales: Array<ProjectLocale> = [];
    if (project.locales) {
      locales = Object.values(project.locales);
    }

    const parsedProject = project;
    parsedProject.locales = locales;
    delete parsedProject.users;

    return parsedProject;
  });

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
  }: Partial<CreateProjectParams> = request.body;

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
  const params: Partial<UpdateProjectMetadataParams> = request.body;

  if (
    !params.name ||
    !params.id ||
    !params.users ||
    !params.relativeBasePath ||
    !params.uid ||
    !params.userToken
  ) {
    response.status(400).send({
      error: {
        code: 'error.missing_params',
        message: 'Not all params are present',
      },
    });
    return;
  }

  try {
    await verifyUidToken(params.userToken, params.uid);
    await verifyProjectAccess(params.uid, params.id);
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

    await firebaseAdmin.database().ref(`projectMetadata/${params.id}`).update(metadata);
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
