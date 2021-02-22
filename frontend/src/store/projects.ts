import { reactive } from 'vue';
// TODO: Fix this
// eslint-disable-next-line import/no-cycle
import { fetchAllUsers, User, userState } from '@/store/user';
import {
  loadFirebaseAnalytics,
  loadFirebaseDatabase,
  loadFirebasePerformance,
  loadFirebaseStorage,
} from '@/firebase';
import firebase from 'firebase/app';
import { downloadFile } from '@/util';
import { Byte } from '@/types/Byte';
import { Uri } from '@/types/Uri';
import { Json } from '@/types/Json';
import { JsonSchema } from '@/types/JsonSchema';
import { Brand } from '@/types/Brand';
import { Uid } from '@/types/Uid';
import { api, getUserToken } from '@/api';

export type ProjectId = Brand<'ProjectId', string>;
export type LocaleCode = Brand<'LocaleCode', string>;

export interface Locale {
  name: string;
  code: LocaleCode;
}

export interface ProjectMetadata<T extends Uid | User> {
  name: string;
  id: ProjectId;
  locales?: Array<Locale>;
  users: Array<T>;
  userRoles: Record<string, 'owner' | 'editor'>;
  relativeBasePath: Uri;
}

export interface Asset {
  name: string;
  remoteUrl: Uri;
  type: string;
  size: Byte;
  dimensions?: {
    width: string;
    height: string;
  };
  thumbnail?: Uri;
}

export interface FirebaseStorageMetadata {
  bucket: string;
  contentDisposition: string;
  contentType: string;
  fullPath: string;
  generation: string;
  metageneration: string;
  name: string;
  size: number;
  timeCreated: string;
  type: string;
  updated: string;
  ref: firebase.storage.Reference;
}

export interface ProjectLocale {
  name: string;
  content?: Json;
}

export interface Project {
  metadata?: ProjectMetadata<User>;
  schemaUrl?: string;
  locales?: Record<string, ProjectLocale>;
  assets: Array<Asset>;
}

export interface ProjectState {
  userProjects: Array<ProjectMetadata<User>>;
  currentProject: Project | null;
  projectIds: Array<ProjectId>;
  currentProjectSchema: JsonSchema | null;
}

export const projectsState = reactive<ProjectState>({
  userProjects: [],
  currentProject: null,
  projectIds: [],
  currentProjectSchema: null,
});

const projectEventElement = document.createElement('div');

export async function getProjects(
  projectIds?: ReadonlyArray<ProjectId>,
): Promise<Array<ProjectMetadata<User>>> {
  if (!userState.currentUser) throw new Error('No user defined');
  const response = await api.get<{
    data: {
      projects: ReadonlyArray<ProjectMetadata<Uid>>;
    };
  }>('/projects', {
    params: {
      uid: userState.currentUser.uid,
      userToken: await getUserToken(),
      projectIds,
    },
  });
  const allUsers = await fetchAllUsers();
  const projects = response.data.data.projects.map((project) => {
    const users = Object.keys(project.userRoles).map(
      (uid) => allUsers.filter((item) => item.uid === uid)[0],
    );

    return {
      ...project,
      users,
    };
  });

  if (projectIds) {
    return projects.filter((project) => projectIds.includes(project.id));
  }
  return projects;
}

export async function getAllProjectIds(): Promise<Array<ProjectId>> {
  const snapshot = await (await loadFirebaseDatabase()).ref('projectIds').once('value');
  const value = snapshot.val();

  if (!value) {
    return [];
  }

  return value;
}

export async function syncProjectsMetadata(): Promise<Array<ProjectMetadata<User>>> {
  if (!userState.currentUser) throw new Error('No user defined');
  projectsState.projectIds = await getAllProjectIds();
  if (!userState.currentUser.projectIds) return [];
  const perfTrace = (await loadFirebasePerformance()).trace('syncAllProjects');
  perfTrace.start();

  const formattedProjects = await getProjects();
  projectsState.userProjects = formattedProjects;

  perfTrace.stop();
  return formattedProjects;
}

export async function createNewProject(
  name: string,
  id: ProjectId,
  user: User,
  users: Array<User> = [],
): Promise<void> {
  const perfTrace = (await loadFirebasePerformance()).trace('createProject');
  perfTrace.start();
  const userToken = await getUserToken();

  await api.put('/project' as Uri, {
    name,
    id,
    uid: user.uid,
    userToken,
    users,
    currentUserProjectIds: user.projectIds ?? [],
    user,
  });

  await Promise.all([fetchAllUsers(), syncProjectsMetadata()]);

  (await loadFirebaseAnalytics()).logEvent('create_project', {
    userAmount: users.length + 1,
  });

  perfTrace.stop();
}

export async function fetchJsonSchema(url: string): Promise<JsonSchema> {
  const performance = await loadFirebasePerformance();
  const perfTrace = performance.trace('fetchJsonSchema');
  perfTrace.start();

  const result = await fetch(url);
  const json = await result.json();

  perfTrace.stop();

  return json;
}

export function handleProjectUpdate(): void {
  const event = new Event('updateProject');

  projectEventElement.dispatchEvent(event);
}

export async function setCurrentProject(id: ProjectId): Promise<void> {
  const projectRef = (await loadFirebaseDatabase()).ref(`projects/${id}`);

  projectRef.on('value', async (snapshot) => {
    const data: null | {
      schemaUrl?: string;
      locales?: Record<string, ProjectLocale>;
    } = snapshot.val();

    const [projectMetadata] = await getProjects([id]);
    const oldSchemaUrl = projectsState.currentProject?.schemaUrl;
    if (oldSchemaUrl !== data?.schemaUrl && data?.schemaUrl) {
      projectsState.currentProjectSchema = await fetchJsonSchema(data?.schemaUrl);
    }

    projectsState.currentProject = {
      metadata: projectMetadata,
      ...data,
      assets: [],
    };

    handleProjectUpdate();
  });
}

export async function resetCurrentProjectState(): Promise<void> {
  if (!projectsState.currentProject?.metadata) return;
  const { id } = projectsState.currentProject.metadata;

  projectsState.currentProject = null;
  projectsState.currentProjectSchema = null;

  const database = await loadFirebaseDatabase();
  const projectRef = database.ref(`projects/${id}`);
  projectRef.off('value');
}

export async function updateProject(projectId: string, newData: Project): Promise<void> {
  const perfTrace = (await loadFirebasePerformance()).trace('updateProject');
  perfTrace.start();

  await (await loadFirebaseDatabase()).ref(`projects/${projectId}`).update(newData);
  await syncProjectsMetadata();

  perfTrace.stop();
}

export async function uploadSchema(schemaFile: File, project: Project): Promise<JsonSchema> {
  if (!project.metadata) throw new Error('Project has no metadata');
  const perfTrace = (await loadFirebasePerformance()).trace('uploadSchema');
  perfTrace.start();

  const ref = (await loadFirebaseStorage()).ref(`${project.metadata?.id}/schema.json`);
  const snapshot = await ref.put(schemaFile);
  const downloadUrl = await snapshot.ref.getDownloadURL();
  const jsonSchema = await fetchJsonSchema(downloadUrl);

  const newData = {
    ...project,
    schemaUrl: downloadUrl,
  };

  delete newData.metadata;
  await updateProject(project.metadata.id, newData);

  projectsState.currentProjectSchema = jsonSchema;

  perfTrace.stop();
  return jsonSchema;
}

export async function updateProjectsMetadata(
  newMetadata: ProjectMetadata<User>,
): Promise<ProjectMetadata<User>> {
  if (!projectsState.currentProject) throw new Error('No current project defined');
  if (!userState.currentUser) throw new Error('No current project defined');
  const perfTrace = (await loadFirebasePerformance()).trace('updateProjectMetadata');
  perfTrace.start();

  const userIds = newMetadata.users.map((user) => user.uid);
  const metadata = {
    ...newMetadata,
    users: [...new Set(userIds)],
  };

  await api.patch('/project' as Uri, {
    ...metadata,
    userToken: await getUserToken(),
    uid: userState.currentUser.uid,
  });

  projectsState.currentProject.metadata = newMetadata;
  perfTrace.stop();

  return newMetadata;
}

export async function createNewLocale(
  code: LocaleCode,
  name: string,
  content?: Json,
): Promise<void> {
  if (!projectsState.currentProject?.metadata) throw new Error('No current project defined');
  const perfTrace = (await loadFirebasePerformance()).trace('createNewLocale');
  perfTrace.start();

  const { metadata } = projectsState.currentProject;

  const newProjectMetadata: ProjectMetadata<User> = {
    ...metadata,
    locales: [...new Set([...(metadata.locales || []), { code, name }])],
  };
  await updateProjectsMetadata(newProjectMetadata);

  const newProjectData: Project = {
    ...projectsState.currentProject,
    locales: {
      ...projectsState.currentProject.locales,
      [code]: {
        name,
      },
    },
  };
  delete newProjectData.metadata;

  if (content && newProjectData.locales) {
    newProjectData.locales[code].content = content;
  }

  await updateProject(newProjectMetadata.id, newProjectData);

  perfTrace.stop();
}

export function getCurrentProjectContent(code: LocaleCode): Json | undefined {
  return projectsState.currentProject?.locales?.[code].content;
}

export function downloadData(data: Json, name = 'content'): void {
  const dataString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
  downloadFile(dataString, `${name}.json`);
}

export function onProjectUpdate(callback: () => void): void {
  projectEventElement.addEventListener('updateProject', () => {
    callback();
  });
}

export async function getProjectAssets(): Promise<Array<Asset>> {
  if (!projectsState.currentProject) throw new Error('No current project defined');

  const projectId = projectsState.currentProject.metadata?.id;
  if (!projectId) throw new Error('Project has no ID');

  const perfTrace = (await loadFirebasePerformance()).trace('getProjectAsset');
  perfTrace.start();

  const storageRef = (await loadFirebaseStorage()).ref(`${projectId}/assets`);
  const assetItems = (await storageRef.listAll()).items;

  const [metadataList, downloadUrlList] = await Promise.all([
    Promise.all<FirebaseStorageMetadata>(assetItems.map((item) => item.getMetadata())),
    Promise.all<Uri>(assetItems.map((item) => item.getDownloadURL())),
  ]);

  const assets = metadataList.map((item, index) => {
    const data: Asset = {
      name: item.name,
      remoteUrl: downloadUrlList[index],
      type: item.contentType,
      size: item.size as Byte,
    };

    if (item.contentType === 'image/png' || item.contentType === 'image/jpeg') {
      data.thumbnail = downloadUrlList[index];
    }

    return data;
  });

  projectsState.currentProject.assets = assets;
  perfTrace.stop();
  return assets;
}

export async function uploadAsset(file: File, projectId: string): Promise<void> {
  const perfTrace = (await loadFirebasePerformance()).trace('uploadAsset');
  perfTrace.start();

  const storageRef = (await loadFirebaseStorage()).ref(`${projectId}/assets/${file.name}`);
  await storageRef.put(file);
  await getProjectAssets();

  perfTrace.stop();
}
