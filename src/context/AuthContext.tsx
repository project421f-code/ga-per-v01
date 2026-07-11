import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// -------------------- Firebase Configuration --------------------
const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:xxxxxxxxxxxxxx",
};

// -------------------- Module-level Firebase State --------------------
// This is initialized once when the module loads, before any component renders.
// If Firebase is not configured/installed, these remain null and the app runs in Demo mode.
let firebaseInstance: any = null; // initialized Firebase app
let firebaseAuth: any = null;    // the "firebase/auth" module

async function ensureFirebase(): Promise<boolean> {
  if (firebaseAuth) return true;

  const isConfigured =
    FIREBASE_CONFIG.apiKey !== "YOUR_FIREBASE_API_KEY" &&
    FIREBASE_CONFIG.apiKey !== "";

  if (!isConfigured) return false;

  try {
    const app = await import("firebase/app");
    const auth = await import("firebase/auth");

    if (!app.getApps().length) {
      firebaseInstance = app.initializeApp(FIREBASE_CONFIG);
    } else {
      firebaseInstance = app.getApp();
    }
    firebaseAuth = auth;
    return true;
  } catch (e) {
    console.warn("Firebase SDK tidak tersedia. Jalankan: npm install firebase");
    return false;
  }
}

// Kick off initialization immediately so it's ready by the time user tries to login
const initPromise = ensureFirebase();

// -------------------- User Type --------------------
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// -------------------- Auth Context --------------------
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  loginWithGoogle: () => Promise<string | null>;
  register: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isConfigured: false,
  login: async () => null,
  loginWithGoogle: async () => null,
  register: async () => null,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const isConfigured =
    FIREBASE_CONFIG.apiKey !== "YOUR_FIREBASE_API_KEY" &&
    FIREBASE_CONFIG.apiKey !== "";

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      await initPromise; // wait for module-level init
      setReady(!!firebaseAuth);

      if (firebaseAuth && firebaseInstance) {
        const auth = firebaseAuth.getAuth(firebaseInstance);
        unsubscribe = firebaseAuth.onAuthStateChanged(auth, (firebaseUser: any) => {
          if (firebaseUser) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const getAuth = useCallback(() => {
    if (!firebaseAuth || !firebaseInstance) return null;
    return firebaseAuth.getAuth(firebaseInstance);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      if (!firebaseAuth) return "Firebase belum dikonfigurasi. Isi .env terlebih dahulu.";
      const auth = getAuth();
      if (!auth) return "Firebase Auth belum siap.";

      try {
        await firebaseAuth.signInWithEmailAndPassword(auth, email, password);
        return null;
      } catch (err: any) {
        return err.message || "Login gagal.";
      }
    },
    [getAuth]
  );

  const loginWithGoogle = useCallback(async (): Promise<string | null> => {
    if (!firebaseAuth) return "Firebase belum dikonfigurasi. Isi .env terlebih dahulu.";
    const auth = getAuth();
    if (!auth) return "Firebase Auth belum siap.";

    try {
      const provider = new firebaseAuth.GoogleAuthProvider();
      await firebaseAuth.signInWithPopup(auth, provider);
      return null;
    } catch (err: any) {
      return err.message || "Google login gagal.";
    }
  }, [getAuth]);

  const register = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      if (!firebaseAuth) return "Firebase belum dikonfigurasi. Isi .env terlebih dahulu.";
      const auth = getAuth();
      if (!auth) return "Firebase Auth belum siap.";

      try {
        await firebaseAuth.createUserWithEmailAndPassword(auth, email, password);
        return null;
      } catch (err: any) {
        return err.message || "Registrasi gagal.";
      }
    },
    [getAuth]
  );

  const logout = useCallback(async () => {
    const auth = getAuth();
    if (auth && firebaseAuth) {
      await firebaseAuth.signOut(auth);
    }
  }, [getAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured,
        login,
        loginWithGoogle,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
