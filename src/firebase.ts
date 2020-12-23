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

async function loadFirebaseAuth() {
  await import(/* webpackChunkName: "firebase-auth" */ 'firebase/auth');

  return firebase.auth();
}

async function loadFirebaseDatabase() {
  await import(/* webpackChunkName: "firebase-database" */ 'firebase/database');

  return firebase.database();
}

async function loadFirebaseStorage() {
  await import(/* webpackChunkName: "firebase-storage" */ 'firebase/storage');

  return firebase.storage();
}

async function loadFirebaseAnalytics() {
  await import(/* webpackChunkName: "firebase-analytics" */ 'firebase/analytics');
  firebase.analytics();

  return firebase.analytics();
}

async function loadFirebasePerformance() {
  await import(/* webpackChunkName: "firebase-performance" */ 'firebase/performance');
  firebase.performance();

  return firebase.performance();
}

export {
  loadFirebaseAuth,
  loadFirebaseDatabase,
  loadFirebaseStorage,
  loadFirebaseAnalytics,
  loadFirebasePerformance,
};
