import * as admin from "firebase-admin";
import * as firebaseConfig from '../register-quickly-firebase-adminsdk-bas9v-071c3eaa3e.json';

admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: "https://register-quickly.firebaseio.com"
});

export {admin};
export const db = admin.firestore();

export const FirestorePath = {
    root: 'mode',
    environment: 'production',
    users: 'users',
    locals: 'locals'
};

// export const db = function () {
//     return firestore
//         .collection(FirestorePath.root)
//         .doc(FirestorePath.environment);
// };
