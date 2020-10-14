import { reactive } from 'vue';
import {
  userState,
  User,
  fetchAllUsers,
  updateUser,
} from '@/store/user';
import { loadFirebaseDatabase } from '@/firebase';
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
  content?: any[] | {
    [key: string]: any;
  };
}

interface ProjectState {
  userProjects: ProjectMetadata[];
  currentProject: Project | null;
  projectIds: string[];
}

const projectsState = reactive<ProjectState>({
  userProjects: [],
  currentProject: null,
  projectIds: [],
});

const getRawUserProjects = async (ids: string[]): Promise<ProjectData[]> => {
  const database = await loadFirebaseDatabase();

  const projectRefs = ids.map((projectId) => database.ref(`projectMetadata/${projectId}`).once('value'));
  const projectsDataPromise = Promise.all<firebase.database.DataSnapshot>(projectRefs);
  const projectsDataSnapshots = await projectsDataPromise;

  return [...projectsDataSnapshots.map(
    (projectSnapshot) => projectSnapshot.val(),
  )];
};

const getFormattedProjects = async (ids: string[]): Promise<ProjectMetadata[]> => {
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
};

const getAllProjectIds = async (): Promise<string[]> => {
  const database = await loadFirebaseDatabase();
  const snapshot = await database.ref('projectIds').once('value');
  const val = snapshot.val();

  if (!val) {
    return [];
  }

  return val;
};

const syncProjects = async (): Promise<ProjectMetadata[]> => {
  if (!userState.currentUser) throw new Error('No user defined');
  projectsState.projectIds = await getAllProjectIds();

  if (!userState.currentUser.projects) return [];
  const formattedProjects = await getFormattedProjects(userState.currentUser.projects);
  projectsState.userProjects = formattedProjects;

  return formattedProjects;
};

const createNewProject = async (name: string, id: string, uid: string, users: User[] = []) => {
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
      user: [uid, ...userIds],
    }),
    database.ref(`projectIds/${projectsState.projectIds.length}`).set(id),
    syncProjects(),
    updateUser({
      ...userState.currentUser,
      projects: [...currentUserProjects, id],
    }),
    ...userUpdatePromises,
  ]);
};

const syncCurrentProject = async (id: string) => {
  const database = await loadFirebaseDatabase();
  const projectRef = database.ref(`projects/${id}`);

  const projectMetadata = await getFormattedProjects([id]);

  projectRef.on('value', (snapshot) => {
    const data: null | {
      schemaURL?: string;
      content?: any[] | {
        [key: string]: any;
      };
    } = snapshot.val();

    projectsState.currentProject = {
      metadata: projectMetadata[0],
      ...data,
    };
  });
};

const resetCurrentProject = async () => {
  if (!projectsState.currentProject) return;
  if (!projectsState.currentProject.metadata) return;
  const { id } = projectsState.currentProject.metadata;

  const database = await loadFirebaseDatabase();
  const projectRef = database.ref(`projects/${id}`);
  projectRef.off('value');
};

export {
  projectsState,
  syncProjects,
  createNewProject,
  syncCurrentProject,
  resetCurrentProject,
};
