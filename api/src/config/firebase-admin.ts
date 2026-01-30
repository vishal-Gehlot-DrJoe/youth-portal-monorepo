import * as admin from 'firebase-admin';

let initialized = false;

export function initializeFirebaseAdmin(): admin.app.App {
    if (initialized) {
        return admin.app();
    }

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            'Missing Firebase Admin SDK credentials. Required: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY'
        );
    }

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });

    initialized = true;
    console.log('Firebase Admin SDK initialized');
    return admin.app();
}

export function getFirebaseAdmin(): typeof admin {
    if (!initialized) {
        initializeFirebaseAdmin();
    }
    return admin;
}
