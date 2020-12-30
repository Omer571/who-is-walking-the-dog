import * as firebase from 'firebase';
import '@firebase/auth';
import '@firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAfbytKCarqMJ5AAbGF9DaLCLiNsVRBTJM ',
  authDomain: 'who-is-walking-the-dog.firebaseapp.com',
  databaseURL: 'https://who-is-walking-the-dog.firebaseio.com',
  projectId: 'who-is-walking-the-dog',
  storageBucket: 'who-is-walking-the-dog.appspot.com',
  messagingSenderId: '780292948851',
  appId: '1:780292948851:ios:0e6e43b8554a7835fc3b06',
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export { firebase };
