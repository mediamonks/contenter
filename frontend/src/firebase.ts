import firebase from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyBzUQlDoNldhv3wHyNAAAREsNxty6KQhQM',
  authDomain: 'mm-content-manager.firebaseapp.com',
  databaseURL: 'https://mm-content-manager.firebaseio.com',
  projectId: 'mm-content-manager',
  storageBucket: 'mm-content-manager.appspot.com',
  messagingSenderId: '169876474748',
  appId: '1:169876474748:web:181b67ddedbe1d27f832f9',
  measurementId: 'G-CL0VZEJ0FT',
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

export default firebaseApp;

const loadFirebaseAuth = async () => {
  await import(/* webpackChunkName: "firebase-auth" */'firebase/auth');

  return firebaseApp.auth();
};

const loadFirebaseDatabase = async () => {
  await import(/* webpackChunkName: "firebase-database" */'firebase/database');

  return firebaseApp.database();
};

export {
  loadFirebaseAuth,
  loadFirebaseDatabase,
};
