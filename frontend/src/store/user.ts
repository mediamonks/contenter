import { reactive } from 'vue';
import firebase from 'firebase/app';
import { loadFirebaseAuth, loadFirebaseDatabase } from '@/firebase';
import { projectsState } from '@/store/projects';

interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  projects?: string[];
  role?: 'editor' | 'developer' | 'admin';
}

interface UserState {
  currentUser: User | null;
}

const userState = reactive<UserState>({
  currentUser: null,
});

const setUser = async (properties: User): Promise<User> => {
  const database = await loadFirebaseDatabase();
  const snapshot = await database
    .ref(`users/${properties.uid}`)
    .once('value');

  userState.currentUser = snapshot.val() as User;

  return snapshot.val();
};

const createNewUser = async (properties: User) => {
  const database = await loadFirebaseDatabase();
  await database
    .ref(`users/${properties.uid}`)
    .set({
      ...properties,
      role: 'editor',
    } as User);
};

const parseUser = async (authUser: firebase.User, isNewUser = false) => {
  const {
    displayName,
    email,
    photoURL,
    uid,
  } = authUser;

  if (!displayName || !email || !photoURL) {
    const auth = await loadFirebaseAuth();
    await auth.signOut();
    throw new Error('Some user information is missing');
  }

  const userData: User = {
    displayName,
    email,
    photoURL,
    uid,
  };

  if (isNewUser) {
    await createNewUser(userData);
  }

  return setUser(userData);
};

const signIn = async () => {
  const auth = await loadFirebaseAuth();
  const provider = new firebase.auth.GoogleAuthProvider();
  const authUser = await auth.signInWithPopup(provider);
  if (!authUser.user) throw new Error('No user defined');

  return parseUser(authUser.user);
};

const signOut = async () => {
  const auth = await loadFirebaseAuth();
  if (!auth.currentUser) throw new Error('No user defined');
  await auth.signOut();

  const database = await loadFirebaseDatabase();
  database.ref(`users/${userState.currentUser?.uid}`).off();

  userState.currentUser = null;
  projectsState.value = [];
};

const fetchUser = async (uid: string): Promise<User> => {
  const database = await loadFirebaseDatabase();

  const snapshot = await database.ref(`users/${uid}`).once('value');

  return snapshot.val();
};

const checkIfUserIsSignedIn = async () => {
  const auth = await loadFirebaseAuth();
  return new Promise<User>(((resolve, reject) => {
    auth.onAuthStateChanged((state) => {
      if (state) {
        if (!userState.currentUser) {
          parseUser(state)
            .then((result) => resolve(result))
            .catch((err) => reject(err));
          return;
        }
        resolve(userState.currentUser);
      } else {
        reject(new Error('Not allowed: not signed in'));
      }
    });
  }));
};

const updateUser = async (properties: User) => {
  const database = await loadFirebaseDatabase();

  await database.ref(`users/${properties.uid}`).update(properties);
  await setUser(properties);

  return properties;
};

export {
  userState,
  signOut,
  signIn,
  fetchUser,
  checkIfUserIsSignedIn,
  updateUser,
  User,
  UserState,
};
