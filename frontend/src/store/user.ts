import { reactive } from 'vue';
import firebase from 'firebase/app';
import { loadFirebaseAuth, loadFirebaseDatabase } from '@/firebase';

interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  projects?: string[];
}

interface UserState {
  currentUser: User | null;
}

const user = reactive<UserState>({
  currentUser: null,
});

const setUser = async (properties: User) => {
  user.currentUser = properties;
  const database = await loadFirebaseDatabase();
  database
    .ref(`users/${properties.uid}`)
    .on('value', (snapshot) => {
      user.currentUser = snapshot.val() as User;
    });
};

const createNewUser = async (properties: User) => {
  const database = await loadFirebaseDatabase();
  await database
    .ref(`users/${properties.uid}`)
    .set(properties);
};

const signIn = async () => {
  const auth = await loadFirebaseAuth();
  const provider = new firebase.auth.GoogleAuthProvider();
  const authUser = await auth.signInWithPopup(provider);

  if (!authUser.user) throw new Error('No user is defined');
  const {
    displayName,
    email,
    photoURL,
    uid,
  } = authUser.user;

  if (!displayName || !email || !photoURL) {
    await auth.signOut();
    throw new Error('Some user information is missing');
  }

  const userData: User = {
    displayName,
    email,
    photoURL,
    uid,
  };

  if (authUser.additionalUserInfo?.isNewUser) {
    await createNewUser(userData);
  }

  await setUser(userData);
};

const signOut = async () => {
  const auth = await loadFirebaseAuth();
  if (!auth.currentUser) throw new Error('No user defined');
  await auth.signOut();

  const database = firebase.database();
  database.ref(`users/${user.currentUser?.uid}`).off();

  user.currentUser = null;
};

export {
  user,
  signOut,
  signIn,
  User,
  UserState,
};
