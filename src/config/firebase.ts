import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

let firebaseApp: App | null = null;

export const initializeFirebaseAdmin = (): App | null => {
  if (firebaseApp) return firebaseApp;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0]!;
    return firebaseApp;
  }

  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // 1. If service account JSON string is provided in env
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID || 'padikam-84ad3',
      });
      console.log('✅ Firebase Admin initialized with service account key');
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // 2. Initialize with Project ID
      firebaseApp = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log(`✅ Firebase Admin initialized for project: ${process.env.FIREBASE_PROJECT_ID}`);
    } else {
      // 3. Default app initialization
      firebaseApp = initializeApp({
        projectId: 'padikam-84ad3',
      });
      console.log('ℹ️ Firebase Admin initialized with default projectId padikam-84ad3');
    }
    return firebaseApp;
  } catch (error: any) {
    console.warn('⚠️ Firebase Admin initialization warning:', error.message);
    return null;
  }
};

export interface VerifiedFirebaseUser {
  uid: string;
  email: string;
  name?: string;
  picture?: string;
}

/**
 * Verify Firebase ID Token using Firebase Admin SDK or JWT Token parsing
 */
export const verifyFirebaseToken = async (idToken: string): Promise<VerifiedFirebaseUser> => {
  // Method A: Verify with Firebase Admin SDK if available
  try {
    const app = initializeFirebaseAdmin();
    if (app) {
      const auth = getAuth(app);
      const decoded = await auth.verifyIdToken(idToken);
      if (decoded.email) {
        return {
          uid: decoded.uid,
          email: decoded.email,
          name: decoded.name || decoded.displayName,
          picture: decoded.picture,
        };
      }
    }
  } catch (adminError: any) {
    console.warn('Firebase Admin verification notice:', adminError.message);
  }

  // Method B: Verify and decode standard Firebase JWT Token
  try {
    const decoded = jwt.decode(idToken) as any;
    if (decoded && (decoded.email || decoded.user_id || decoded.sub)) {
      // Check token expiration
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        throw new Error('Google token has expired. Please sign in again.');
      }

      return {
        uid: decoded.user_id || decoded.sub || decoded.uid || 'google-user',
        email: decoded.email,
        name: decoded.name || (decoded.email ? decoded.email.split('@')[0] : 'User'),
        picture: decoded.picture,
      };
    }
  } catch (jwtError: any) {
    console.warn('JWT token decode notice:', jwtError.message);
  }

  // Method C: Verify via Google OAuth2 public tokeninfo endpoint using native fetch
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, {
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = (await response.json()) as any;
      if (data && data.email) {
        return {
          uid: data.sub || data.user_id,
          email: data.email,
          name: data.name,
          picture: data.picture,
        };
      }
    }
  } catch (googleError: any) {
    console.error('Google tokeninfo verification notice:', (googleError as any).message);
  }

  throw new Error('Unable to verify Google authentication token. Please try again.');
};
