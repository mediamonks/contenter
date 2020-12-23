import { reactive } from 'vue';
import { fetchAllUsers, updateUser, User, UserId, userState } from '@/store/user';
import {
  loadFirebaseAnalytics,
  loadFirebaseDatabase,
  loadFirebasePerformance,
  loadFirebaseStorage,
} from '@/firebase';
import firebase from 'firebase/app';
import { downloadFile } from '@/util';
import { Byte } from '@/types/Byte';
import { URI } from '@/types/URI';

export type ProjectId = string;
export type LocaleCode = string;

export interface Locale {
  name: string;
  code: LocaleCode;
}

export interface ProjectMetadata<T extends UserId | User> {
  name: string;
  id: ProjectId;
  locales?: Array<Locale>;
  users: Array<T>;
  relativeBasePath?: URI;
}

export interface Asset {
  name: string;
  remoteUrl: URI;
  type: string;
  size: Byte;
  dimensions?: {
    width: string;
    height: string;
  };
  thumbnail?: URI;
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
  content?: Array<any> | Record<string, any>;
}

export interface Project {
  metadata?: ProjectMetadata<User>;
  schemaURL?: string;
  locales?: Record<string, ProjectLocale>;
  assets: Array<Asset>;
}

export interface ProjectState {
  userProjects: Array<ProjectMetadata<User>>;
  currentProject: Project | null;
  projectIds: Array<ProjectId>;
  currentProjectSchema: Record<string, unknown> | null;
}

export const projectsState = reactive<ProjectState>({
  userProjects: [],
  currentProject: null,
  projectIds: [],
  currentProjectSchema: null,
});

const projectEventElement = document.createElement('div');

export async function getRawUserProjects(
  ids: Array<string>,
): Promise<Array<ProjectMetadata<UserId>>> {
  const database = await loadFirebaseDatabase();

  const projectsDataSnapshots = await Promise.all<firebase.database.DataSnapshot>(
    ids.map((projectId) => database.ref(`projectMetadata/${projectId}`).once('value')),
  );

  return [...projectsDataSnapshots.map((projectSnapshot) => projectSnapshot.val())];
}

export async function getFormattedProjects(
  ids: Array<string>,
): Promise<Array<ProjectMetadata<User>>> {
  const rawProjects = await getRawUserProjects(ids);
  const users = await fetchAllUsers();

  return rawProjects.map((rawProject) => {
    if (!rawProject) throw new Error("Project doesn't exists");
    const projectsUsers = rawProject.users.map((id) => users.filter((usr) => usr.uid === id)[0]);

    return {
      name: rawProject.name,
      id: rawProject.id,
      users: projectsUsers,
      locales: rawProject.locales || [],
      relativeBasePath: rawProject.relativeBasePath,
    };
  });
}

export async function getAllProjectIds(): Promise<Array<string>> {
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

  const formattedProjects = await getFormattedProjects(userState.currentUser.projectIds);
  projectsState.userProjects = formattedProjects;

  perfTrace.stop();
  return formattedProjects;
}

export async function createNewProject(
  name: string,
  id: string,
  uid: string,
  users: Array<User> = [],
) {
  if (!userState.currentUser) throw new Error('User is not defined');
  const perfTrace = (await loadFirebasePerformance()).trace('createProject');
  perfTrace.start();

  const projectRef = (await loadFirebaseDatabase()).ref(`projectMetadata/${id}`);
  let currentUserProjects: Array<string> = [];
  if (userState.currentUser.projectIds) {
    currentUserProjects = userState.currentUser.projectIds;
  }

  const userIds = users.map((user) => user.uid);

  await Promise.all<void>([
    projectRef.set({
      name,
      id,
      users: [uid, ...userIds],
    } as ProjectMetadata<UserId>),
    (await loadFirebaseDatabase()).ref(`projectIds/${projectsState.projectIds.length}`).set(id),
    syncProjectsMetadata(),
    updateUser({
      ...userState.currentUser,
      projectIds: [...currentUserProjects, id],
    }),
    ...users.map((user) => {
      let currentProjects = user.projectIds;
      if (!currentProjects) {
        currentProjects = [];
      }

      return updateUser({
        ...user,
        projectIds: [...currentProjects, id],
      });
    }),
  ]);

  (await loadFirebaseAnalytics()).logEvent('create_project', {
    userAmount: userIds.length + 1,
  });

  perfTrace.stop();
}

export async function fetchJSONSchema(url: string) {
  const performance = await loadFirebasePerformance();
  const perfTrace = performance.trace('fetchJSONSchema');
  perfTrace.start();

  const result = await fetch(url);
  const json = await result.json();

  perfTrace.stop();

  return json;
}

export function handleProjectUpdate() {
  const event = new Event('updateProject');

  projectEventElement.dispatchEvent(event);
}

export async function setCurrentProject(id: string) {
  const projectRef = (await loadFirebaseDatabase()).ref(`projects/${id}`);

  projectRef.on('value', async (snapshot) => {
    const data: null | {
      schemaURL?: string;
      locales?: Record<string, ProjectLocale>;
    } = snapshot.val();

    const projectMetadata = await getFormattedProjects([id]);

    const oldSchemaURL = projectsState.currentProject?.schemaURL;
    if (oldSchemaURL !== data?.schemaURL && data?.schemaURL) {
      projectsState.currentProjectSchema = await fetchJSONSchema(data?.schemaURL);
    }

    projectsState.currentProject = {
      metadata: projectMetadata[0],
      ...data,
      assets: [],
    };

    handleProjectUpdate();
  });
}

export async function resetCurrentProjectState() {
  if (!projectsState.currentProject?.metadata) return;
  const { id } = projectsState.currentProject.metadata;

  projectsState.currentProject = null;
  projectsState.currentProjectSchema = null;

  const database = await loadFirebaseDatabase();
  const projectRef = database.ref(`projects/${id}`);
  projectRef.off('value');
}

export async function updateProject(projectId: string, newData: Project) {
  const perfTrace = (await loadFirebasePerformance()).trace('updateProject');
  perfTrace.start();

  await (await loadFirebaseDatabase()).ref(`projects/${projectId}`).update(newData);
  await syncProjectsMetadata();

  perfTrace.stop();
}

export async function uploadSchema(schemaFile: File, project: Project) {
  if (!project.metadata) throw new Error('Project has no metadata');
  const perfTrace = (await loadFirebasePerformance()).trace('uploadSchema');
  perfTrace.start();

  const ref = (await loadFirebaseStorage()).ref(`${project.metadata?.id}/schema.json`);
  const snapshot = await ref.put(schemaFile);
  const downloadUrl = await snapshot.ref.getDownloadURL();
  const jsonSchema = await fetchJSONSchema(downloadUrl);

  const newData = {
    ...project,
    schemaURL: downloadUrl,
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
  const perfTrace = (await loadFirebasePerformance()).trace('updateProjectMetadata');
  perfTrace.start();

  const userIds = newMetadata.users.map((user) => user.uid);
  const metadata = {
    ...newMetadata,
    users: [...new Set(userIds)],
  };

  const database = await loadFirebaseDatabase();
  const ref = database.ref(`projectMetadata/${newMetadata.id}`);
  await ref.update(metadata);

  projectsState.currentProject.metadata = newMetadata;

  perfTrace.stop();

  return newMetadata;
}

export async function createNewLocale(code: string, name: string, content?: object | Array<any>) {
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

export function getCurrentProjectContent(code: string): object | Array<any> | undefined {
  return projectsState.currentProject?.locales?.[code].content;
}

export function downloadData(data: object | Array<any>, name = 'content') {
  const dataString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
  downloadFile(dataString, `${name}.json`);
}

export function onProjectUpdate(callback: Function) {
  projectEventElement.addEventListener('updateProject', () => {
    callback();
  });
}

export async function getProjectAssets() {
  if (!projectsState.currentProject) throw new Error('No current project defined');

  const projectId = projectsState.currentProject.metadata?.id;
  if (!projectId) throw new Error('Project has no ID');

  const perfTrace = (await loadFirebasePerformance()).trace('getProjectAsset');
  perfTrace.start();

  const storageRef = (await loadFirebaseStorage()).ref(`${projectId}/assets`);
  const assetItems = (await storageRef.listAll()).items;

  const [metadataList, downloadURLList] = await Promise.all([
    Promise.all<FirebaseStorageMetadata>(assetItems.map((item) => item.getMetadata())),
    Promise.all<URI>(assetItems.map((item) => item.getDownloadURL())),
  ]);

  const assets = metadataList.map((item, index) => {
    const data: Asset = {
      name: item.name,
      remoteUrl: downloadURLList[index],
      type: item.contentType,
      size: item.size as Byte,
    };

    if (item.contentType === 'image/png' || item.contentType === 'image/jpeg') {
      data.thumbnail = downloadURLList[index];
    }

    return data;
  });

  projectsState.currentProject.assets = assets;
  perfTrace.stop();
  return assets;
}

export async function uploadAsset(file: File, projectId: string) {
  const perfTrace = (await loadFirebasePerformance()).trace('uploadAsset');
  perfTrace.start();

  const storageRef = (await loadFirebaseStorage()).ref(`${projectId}/assets/${file.name}`);
  await storageRef.put(file);
  await getProjectAssets();

  perfTrace.stop();
}
