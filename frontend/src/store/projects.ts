import { reactive } from 'vue';
import {
  fetchAllUsers,
  updateUser,
  User,
  userState,
} from '@/store/user';
import { loadFirebaseDatabase, loadFirebaseStorage } from '@/firebase';
import firebase from 'firebase/app';

interface ProjectData {
  name: string;
  id: string;
  users: string[];
}

interface ProjectMetadata {
  name: string;
  id: string;
  users: User[];
}

interface Project {
  metadata?: ProjectMetadata;
  schemaURL?: string;
  content?: any[] | Record<any, any>;
}

interface ProjectState {
  userProjects: ProjectMetadata[];
  currentProject: Project | null;
  projectIds: string[];
  currentProjectSchema: Record<any, any> | null;
}

const projectsState = reactive<ProjectState>({
  userProjects: [],
  currentProject: null,
  projectIds: [],
  currentProjectSchema: null,
});

async function getRawUserProjects(ids: string[]): Promise<ProjectData[]> {
  const database = await loadFirebaseDatabase();

  const projectRefs = ids.map((projectId) => database.ref(`projectMetadata/${projectId}`).once('value'));
  const projectsDataPromise = Promise.all<firebase.database.DataSnapshot>(projectRefs);
  const projectsDataSnapshots = await projectsDataPromise;

  return [...projectsDataSnapshots.map(
    (projectSnapshot) => projectSnapshot.val(),
  )];
}

async function getFormattedProjects(ids: string[]): Promise<ProjectMetadata[]> {
  const rawProjects = await getRawUserProjects(ids);
  const users = await fetchAllUsers();

  return rawProjects.map((rawProject) => {
    const projectsUsers = rawProject.users.map((id) => users.filter(
      (usr) => usr.uid === id,
    )[0]);

    return {
      name: rawProject.name,
      id: rawProject.id,
      users: projectsUsers,
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

async function syncProjects(): Promise<ProjectMetadata[]> {
  if (!userState.currentUser) throw new Error('No user defined');
  projectsState.projectIds = await getAllProjectIds();

  if (!userState.currentUser.projects) return [];
  const formattedProjects = await getFormattedProjects(userState.currentUser.projects);
  projectsState.userProjects = formattedProjects;

  return formattedProjects;
}

async function createNewProject(name: string, id: string, uid: string, users: User[] = []) {
  if (!userState.currentUser) throw new Error('User is not defined');
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
    } as ProjectData),
    database.ref(`projectIds/${projectsState.projectIds.length}`).set(id),
    syncProjects(),
    updateUser({
      ...userState.currentUser,
      projects: [...currentUserProjects, id],
    }),
    ...userUpdatePromises,
  ]);
}

const fetchJSONSchema = async (url: string) => {
  const result = await fetch(url);
  const json = await result.json();

  return json;
};

async function syncCurrentProject(id: string) {
  const database = await loadFirebaseDatabase();
  const projectRef = database.ref(`projects/${id}`);

  const projectMetadata = await getFormattedProjects([id]);

  projectRef.on('value', async (snapshot) => {
    const data: null | {
      schemaURL?: string;
      content?: any[] | {
        [key: string]: any;
      };
    } = snapshot.val();

    const oldSchemaURL = projectsState.currentProject?.schemaURL;
    if (oldSchemaURL !== data?.schemaURL && data?.schemaURL) {
      projectsState.currentProjectSchema = await fetchJSONSchema(data?.schemaURL);
    }

    projectsState.currentProject = {
      metadata: projectMetadata[0],
      ...data,
    };
  });
}

async function resetCurrentProject() {
  if (!projectsState.currentProject) return;
  if (!projectsState.currentProject.metadata) return;
  const { id } = projectsState.currentProject.metadata;

  projectsState.currentProject = null;
  projectsState.currentProjectSchema = null;

  const database = await loadFirebaseDatabase();
  const projectRef = database.ref(`projects/${id}`);
  projectRef.off('value');
}

const updateProject = async (projectId: string, newData: Project) => {
  const database = await loadFirebaseDatabase();
  const ref = database.ref(`projects/${projectId}`);

  await ref.update(newData);
};

async function uploadSchema(schemaFile: File, project: Project) {
  if (!project.metadata) throw new Error('Project has no metadata');
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

  return jsonSchema;
}

export {
  projectsState,
  syncProjects,
  createNewProject,
  syncCurrentProject,
  resetCurrentProject,
  uploadSchema,
  fetchJSONSchema,
  updateProject,
};
