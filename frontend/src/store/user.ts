import { reactive } from 'vue';
import firebase from 'firebase/app';
import {
  loadFirebaseAnalytics,
  loadFirebaseAuth,
  loadFirebaseDatabase,
  loadFirebasePerformance,
} from '@/firebase';
import { api, getUserToken } from '@/api';
// TODO: Fix this
// eslint-disable-next-line import/no-cycle
import { ProjectId, projectsState } from '@/store/projects';
import { Uid } from '@/types/Uid';
import { Uri } from '@/types/Uri';
import { Email } from '@/types/Email';

export type Role = 'editor' | 'developer' | 'admin';

export interface User {
  uid: Uid;
  displayName: string;
  email: Email;
  photoUrl: Uri;
  /**
   * @deprecated Project IDs are stored on the project, not on the user object
   */
  projectIds?: Array<ProjectId>;
  role?: 'editor' | 'developer' | 'admin';
}

export interface UserState {
  currentUser: User | null;
  users: Array<User>;
}

export const userState = reactive<UserState>({
  currentUser: null,
  users: [],
});

export async function setUser(properties: User): Promise<User> {
  const snapshot = await (await loadFirebaseDatabase())
    .ref(`users/${properties.uid}`)
    .once('value');

  userState.currentUser = snapshot.val() as User;

  return snapshot.val();
}

export async function createNewUser(properties: User): Promise<void> {
  const userToken = await getUserToken();

  const response = await api.post<{
    success: boolean;
    message: string;
    data: User;
  }>(
    'user/create',
    JSON.stringify({
      ...properties,
      userToken,
    }),
  );

  userState.currentUser = response.data.data;
}

export async function parseUser(authUser: firebase.User, isNewUser = false): Promise<User> {
  const perfTrace = (await loadFirebasePerformance()).trace('parseUser');
  perfTrace.start();

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { displayName, email, photoURL, uid } = authUser;

  if (!displayName || !email || !photoURL) {
    await (await loadFirebaseAuth()).signOut();
    throw new Error('Some user information is missing');
  }

  const userData: User = {
    displayName,
    email: email as Email,
    photoUrl: photoURL as Uri,
    uid: uid as Uid,
  };

  if (isNewUser) {
    await createNewUser(userData);
  }

  const user = await setUser(userData);

  const analytics = await loadFirebaseAnalytics();
  analytics.setUserId(authUser.uid);
  analytics.logEvent('login', {
    method: 'Google',
  });
  analytics.setUserProperties(user);

  perfTrace.stop();
  return user;
}

export async function signIn(): Promise<User> {
  const provider = new firebase.auth.GoogleAuthProvider();
  const authUser = await (await loadFirebaseAuth()).signInWithPopup(provider);
  if (!authUser.user || !authUser.additionalUserInfo) throw new Error('No user defined');

  return parseUser(authUser.user, authUser.additionalUserInfo.isNewUser);
}

export async function signOut(): Promise<void> {
  const auth = await loadFirebaseAuth();
  if (!auth.currentUser) throw new Error('No user defined');
  await auth.signOut();

  const database = await loadFirebaseDatabase();
  database.ref(`users/${userState.currentUser?.uid}`).off();

  userState.currentUser = null;
  projectsState.userProjects = [];
}

export async function checkIfUserIsSignedIn(): Promise<User> {
  const auth = await loadFirebaseAuth();
  return new Promise<User>((resolve, reject) => {
    auth.onAuthStateChanged((state) => {
      if (state) {
        if (!userState.currentUser) {
          parseUser(state)
            .then((result) => resolve(result))
            .catch((error) => reject(error));
        } else {
          resolve(userState.currentUser);
        }
      } else {
        reject(new Error('Not allowed: not signed in'));
      }
    });
  });
}

export async function updateUser(user: User): Promise<User> {
  await (await loadFirebaseDatabase()).ref(`users/${user.uid}`).update(user);
  if (userState.currentUser && userState.currentUser.uid === user.uid) {
    await setUser(user);
  }

  return user;
}

export async function fetchAllUsers(): Promise<Array<User>> {
  const snapshot = await (await loadFirebaseDatabase()).ref('users').once('value');

  if (!snapshot.val()) {
    return [];
  }

  const data: Record<string, User> = snapshot.val();
  const users: Array<User> = Object.values(data);

  userState.users = users;
  [userState.currentUser] = users.filter((user) => user.uid === userState.currentUser?.uid);

  return users;
}
