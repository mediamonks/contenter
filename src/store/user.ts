import { reactive } from 'vue';
import firebase from 'firebase/app';
import {
  loadFirebaseAnalytics,
  loadFirebaseAuth,
  loadFirebaseDatabase,
  loadFirebasePerformance,
} from '@/firebase';
import { ProjectId, projectsState } from '@/store/projects';
import { Brand } from '@/types/Brand';
import { URI } from '@/types/URI';
import { Email } from '@/types/Email';

export type UserId = Brand<'UserId', string>;
export type Role = 'editor' | 'developer' | 'admin';

export interface User {
  uid: UserId;
  displayName: string;
  email: Email;
  photoUrl: URI;
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

export async function createNewUser(properties: User) {
  await (await loadFirebaseDatabase())
    .ref(`users/${properties.uid}`)
    .set({
      ...properties,
      role: 'editor',
    } as User);
}

export async function parseUser(authUser: firebase.User, isNewUser = false) {
  const perfTrace = (await loadFirebasePerformance()).trace('parseUser');
  perfTrace.start();

  const {
    displayName,
    email,
    photoURL,
    uid,
  } = authUser;

  if (!displayName || !email || !photoURL) {
    await (await loadFirebaseAuth()).signOut();
    throw new Error('Some user information is missing');
  }

  const userData: User = {
    displayName,
    email: email as Email,
    photoUrl: photoURL as URI,
    uid: uid as UserId,
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

export async function signIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  const authUser = await (await loadFirebaseAuth())
    .signInWithPopup(provider);
  if (!authUser.user || !authUser.additionalUserInfo) throw new Error('No user defined');

  return parseUser(authUser.user, authUser.additionalUserInfo.isNewUser);
}

export async function signOut() {
  const auth = await loadFirebaseAuth();
  if (!auth.currentUser) throw new Error('No user defined');
  await auth.signOut();

  const database = await loadFirebaseDatabase();
  database.ref(`users/${userState.currentUser?.uid}`).off();

  userState.currentUser = null;
  projectsState.userProjects = [];
}

export async function checkIfUserIsSignedIn() {
  const auth = await loadFirebaseAuth();
  return new Promise<User>(((resolve, reject) => {
    auth.onAuthStateChanged((state) => {
      if (state) {
        if (!userState.currentUser) {
          parseUser(state)
            .then((result) => resolve(result))
            .catch((err) => reject(err));
        } else {
          resolve(userState.currentUser);
        }
      } else {
        reject(new Error('Not allowed: not signed in'));
      }
    });
  }));
}

export async function updateUser(user: User) {
  await (await loadFirebaseDatabase())
    .ref(`users/${user.uid}`)
    .update(user);
  if (userState.currentUser && userState.currentUser.uid === user.uid) {
    await setUser(user);
  }

  return user;
}

export async function fetchAllUsers(): Promise<Array<User>> {
  const snapshot = await (await loadFirebaseDatabase())
    .ref('users')
    .once('value');

  if (!snapshot.val()) {
    return [];
  }

  const data: Record<string, User> = snapshot.val();
  const users: Array<User> = Object.values(data);

  userState.users = users;
  return users;
}
