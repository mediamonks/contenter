import { reactive } from 'vue';
import {
  fetchAllUsers,
  updateUser,
  User,
  userState,
} from '@/store/user';
import {
  loadFirebaseAnalytics,
  loadFirebaseDatabase,
  loadFirebasePerformance,
  loadFirebaseStorage,
} from '@/firebase';
import firebase from 'firebase/app';
import { downloadFile } from '@/util';
import { assets } from '@/store/assets';

interface ProjectMetadata<T>{
  name: string;
  id: string;
  locales?: Array<{
    name: string;
    code: string;
  }>;
  users: T[];
}

interface ProjectLocale {
  name: string;
  content?: any[] | Record<string, any>;
}

interface Project {
  metadata?: ProjectMetadata<User>;
  schemaURL?: string;
  locales?: Record<string, ProjectLocale>;
}

interface ProjectState {
  userProjects: ProjectMetadata<User>[];
  currentProject: Project | null;
  projectIds: string[];
  currentProjectSchema: Record<string, unknown> | null;
}

const projectsState = reactive<ProjectState>({
  userProjects: [],
  currentProject: null,
  projectIds: [],
  currentProjectSchema: null,
});

const projectEventElement = document.createElement('div');

async function getRawUserProjects(ids: string[]): Promise<ProjectMetadata<string>[]> {
  const database = await loadFirebaseDatabase();

  const projectRefs = ids.map((projectId) => database.ref(`projectMetadata/${projectId}`).once('value'));
  const projectsDataPromise = Promise.all<firebase.database.DataSnapshot>(projectRefs);
  const projectsDataSnapshots = await projectsDataPromise;

  return [...projectsDataSnapshots.map(
    (projectSnapshot) => projectSnapshot.val(),
  )];
}

async function getFormattedProjects(ids: string[]): Promise<ProjectMetadata<User>[]> {
  const rawProjects = await getRawUserProjects(ids);
  const users = await fetchAllUsers();

  return rawProjects.map((rawProject) => {
    if (!rawProject) throw new Error('Project doesn\'t exists');
    const projectsUsers = rawProject.users.map((id) => users.filter(
      (usr) => usr.uid === id,
    )[0]);

    return {
      name: rawProject.name,
      id: rawProject.id,
      users: projectsUsers,
      locales: rawProject.locales || [],
    };
  });
}

async function getAllProjectIds(): Promise<string[]> {
  const database = await loadFirebaseDatabase();
  const snapshot = await database.ref('projectIds').once('value');
  const val = snapshot.val();

  if (!val) {
    return [];
  }

  return val;
}

async function syncProjectsMetadata(): Promise<ProjectMetadata<User>[]> {
  if (!userState.currentUser) throw new Error('No user defined');
  projectsState.projectIds = await getAllProjectIds();

  if (!userState.currentUser.projects) return [];
  const performance = await loadFirebasePerformance();
  const perfTrace = performance.trace('syncAllProjects');
  perfTrace.start();

  const formattedProjects = await getFormattedProjects(userState.currentUser.projects);
  projectsState.userProjects = formattedProjects;

  perfTrace.stop();
  return formattedProjects;
}

async function createNewProject(name: string, id: string, uid: string, users: User[] = []) {
  if (!userState.currentUser) throw new Error('User is not defined');
  const performance = await loadFirebasePerformance();
  const perfTrace = performance.trace('createProject');
  perfTrace.start();

  const database = await loadFirebaseDatabase();

  const projectRef = database.ref(`projectMetadata/${id}`);

  let currentUserProjects: string[] = [];
  if (userState.currentUser.projects) {
    currentUserProjects = userState.currentUser.projects;
  }

  const userIds = users.map((user) => user.uid);

  const userUpdatePromises = users.map((user) => {
    let currentProjects = user.projects;
    if (!currentProjects) {
      currentProjects = [];
    }

    return updateUser({
      ...user,
      projects: [...currentProjects, id],
    });
  });

  await Promise.all<void>([
    projectRef.set({
      name,
      id,
      users: [uid, ...userIds],
    } as ProjectMetadata<string>),
    database.ref(`projectIds/${projectsState.projectIds.length}`).set(id),
    syncProjectsMetadata(),
    updateUser({
      ...userState.currentUser,
      projects: [...currentUserProjects, id],
    }),
    ...userUpdatePromises,
  ]);

  const analytics = await loadFirebaseAnalytics();
  analytics.logEvent('create_project', {
    userAmount: userIds.length + 1,
  });

  perfTrace.stop();
}

async function fetchJSONSchema(url: string) {
  const performance = await loadFirebasePerformance();
  const perfTrace = performance.trace('fetchJSONSchema');
  perfTrace.start();

  const result = await fetch(url);
  const json = await result.json();

  perfTrace.stop();

  return json;
}

function handleProjectUpdate() {
  const event = new Event('updateProject');

  projectEventElement.dispatchEvent(event);
}

async function syncCurrentProject(id: string) {
  const database = await loadFirebaseDatabase();
  const projectRef = database.ref(`projects/${id}`);

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
    };

    handleProjectUpdate();
  });
}

async function resetCurrentProjectState() {
  if (!projectsState.currentProject?.metadata) return;
  const { id } = projectsState.currentProject.metadata;

  projectsState.currentProject = null;
  projectsState.currentProjectSchema = null;

  const database = await loadFirebaseDatabase();
  const projectRef = database.ref(`projects/${id}`);
  projectRef.off('value');

  assets.value = [];
}

const updateProject = async (projectId: string, newData: Project) => {
  const performance = await loadFirebasePerformance();
  const perfTrace = performance.trace('updateProject');
  perfTrace.start();

  const database = await loadFirebaseDatabase();
  const ref = database.ref(`projects/${projectId}`);

  await ref.update(newData);

  await syncProjectsMetadata();

  perfTrace.stop();
};

async function uploadSchema(schemaFile: File, project: Project) {
  if (!project.metadata) throw new Error('Project has no metadata');
  const performance = await loadFirebasePerformance();
  const perfTrace = performance.trace('uploadSchema');
  perfTrace.start();

  const storage = await loadFirebaseStorage();
  const ref = storage.ref(`${project.metadata?.id}/schema.json`);

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

async function updateProjectsMetadata(newMetadata: ProjectMetadata<User>):
  Promise<ProjectMetadata<User>> {
  if (!projectsState.currentProject) throw new Error('No current project defined');
  const performance = await loadFirebasePerformance();
  const perfTrace = performance.trace('updateProjectMetadata');
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

async function createNewLocale(code: string, name: string, content?: object | any[]) {
  if (!projectsState.currentProject?.metadata) throw new Error('No current project defined');
  const performance = await loadFirebasePerformance();
  const perfTrace = performance.trace('createNewLocale');
  perfTrace.start();

  const { metadata } = projectsState.currentProject;

  const newProjectMetadata: ProjectMetadata<User> = {
    ...metadata,
    locales: [...new Set([...metadata.locales || [], { code, name }])],
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

function getCurrentProjectContent(code: string): object | any[] | undefined {
  return projectsState.currentProject?.locales?.[code].content;
}

function downloadData(data: object | any[], name = 'content') {
  const dataString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
  downloadFile(dataString, `${name}.json`);
}

function onProjectUpdate(callback: Function) {
  projectEventElement.addEventListener('updateProject', () => { callback(); });
}

export {
  projectsState,
  syncProjectsMetadata,
  createNewProject,
  syncCurrentProject,
  resetCurrentProjectState,
  uploadSchema,
  fetchJSONSchema,
  updateProject,
  updateProjectsMetadata,
  createNewLocale,
  getCurrentProjectContent,
  downloadData,
  onProjectUpdate,
  Project,
  ProjectMetadata,
};
