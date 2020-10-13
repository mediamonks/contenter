import { ref } from 'vue';
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
  user: string[];
}

interface Project {
  name: string;
  id: string;
  users: User[];
}

const projectsState = ref<Project[]>([]);

const projectIds = ref<string[]>([]);

const getRawUserProjects = async (ids: string[]): Promise<ProjectData[]> => {
  const database = await loadFirebaseDatabase();

  const projectRefs = ids.map((projectId) => database.ref(`projects/${projectId}`).once('value'));
  const projectsDataPromise = Promise.all<firebase.database.DataSnapshot>(projectRefs);
  const projectsDataSnapshots = await projectsDataPromise;

  return [...projectsDataSnapshots.map(
    (projectSnapshot) => projectSnapshot.val(),
  )];
};

const getFormattedProjects = async (ids: string[]): Promise<Project[]> => {
  const rawProjects = await getRawUserProjects(ids);
  const users = await fetchAllUsers();

  return rawProjects.map((rawProject) => {
    const projectsUsers = rawProject.user.map((id) => users.filter(
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

  return snapshot.val();
};

const syncProjects = async (): Promise<Project[]> => {
  if (!userState.currentUser) throw new Error('No user defined');
  projectIds.value = await getAllProjectIds();

  if (!userState.currentUser.projects) return [];
  const formattedProjects = await getFormattedProjects(userState.currentUser.projects);
  projectsState.value = formattedProjects;

  return formattedProjects;
};

const createNewProject = async (name: string, id: string, uid: string, users: User[] = []) => {
  if (!userState.currentUser) throw new Error('User is not defined');
  const database = await loadFirebaseDatabase();

  const projectRef = database.ref(`projects/${id}`);

  let newUserProjects: string[] = [];
  if (userState.currentUser.projects) {
    newUserProjects = userState.currentUser.projects;
  }

  const userIds = users.map((user) => user.uid);

  await Promise.all<void>([
    projectRef.set({
      name,
      id,
      user: [uid, ...userIds],
    }),
    database.ref(`projectIds/${projectIds.value.length}`).set(id),
    syncProjects(),
    updateUser({
      ...userState.currentUser,
      projects: [...newUserProjects, id],
    }),
  ]);
};

export {
  projectsState,
  projectIds,
  syncProjects,
  createNewProject,
};
