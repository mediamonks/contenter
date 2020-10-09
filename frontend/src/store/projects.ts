import { ref } from 'vue';
import { userState, User, fetchUser } from '@/store/user';
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

const getRawUserProjects = async (ids: string[]): Promise<ProjectData[]> => {
  const database = await loadFirebaseDatabase();

  const projectRefs = ids.map((projectId) => database.ref(`projects/${projectId}`).once('value'));
  const projectsDataPromise = Promise.all<firebase.database.DataSnapshot>(projectRefs);
  const projectsDataSnapshots = await projectsDataPromise;

  return [...projectsDataSnapshots.map(
    (projectSnapshot) => projectSnapshot.val(),
  )];
};

const getFormattedProjects = async (projectIds: string[]): Promise<Project[]> => {
  const rawProjects = await getRawUserProjects(projectIds);
  const userIds: string[] = rawProjects.map((rawProject) => rawProject.user).flat();

  const userPromises: Promise<User>[] = userIds.map((uid) => fetchUser(uid));
  const users: User[] = await Promise.all<User>(userPromises);

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

const syncProjects = async (): Promise<Project[]> => {
  if (!userState.currentUser) throw new Error('No user defined');
  if (!userState.currentUser.projects) return [];

  const formattedProjects = await getFormattedProjects(userState.currentUser.projects);
  projectsState.value = formattedProjects;

  return formattedProjects;
};

export { projectsState, syncProjects };
