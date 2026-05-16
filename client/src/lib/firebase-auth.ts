import type { User as FirebaseUser } from "firebase/auth";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  setPersistence,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { firebaseAuth, firebaseDb, googleAuthProvider, hasRequiredFirebaseConfig } from "@/lib/firebase";

// Helper to check if Firebase is configured
const ensureFirebaseConfigured = () => {
  if (!hasRequiredFirebaseConfig || !firebaseAuth || !firebaseDb || !googleAuthProvider) {
    console.warn("Firebase is not configured. Authentication features will be disabled.");
    return false;
  }
  return true;
};

export interface AppUser {
  id: string;
  uid: string;
  email: string | null;
  user_metadata: {
    name?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
    picture?: string | null;
    email?: string | null;
  };
}

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  class?: string;
  school?: string;
  city?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  targetYear?: string;
  role?: string;
  is_admin?: boolean;
  onboardingCompleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FirebasePurchase {
  id: string;
  amount: number;
  pdfTitle: string;
  status: string;
  timestamp?: string;
  userId: string;
}

export interface FirebasePaidContent {
  id: string;
  title: string;
  cost?: number;
  desc?: string;
  img?: string;
  info1?: string;
  info2?: string;
  info3?: string;
  pdfName?: string;
  pdfUrl?: string;
}

export interface RedirectDebugState {
  stage: string;
  message?: string;
}

const waitForFirebaseUser = async (timeoutMs = 4000): Promise<FirebaseUser | null> => {
  if (!ensureFirebaseReady()) return null;

  const currentUser = firebaseAuth!.currentUser;
  if (currentUser) return currentUser;

  return await new Promise<FirebaseUser | null>((resolve) => {
    let settled = false;

    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      unsubscribe();
      resolve(firebaseAuth!.currentUser);
    }, timeoutMs);

    const unsubscribe = onAuthStateChanged(firebaseAuth!, (user) => {
      if (settled || !user) return;
      settled = true;
      window.clearTimeout(timeoutId);
      unsubscribe();
      resolve(user);
    });
  });
};

const ensureFirebaseReady = () => {
  if (!ensureFirebaseConfigured()) {
    return false;
  }
  if (!firebaseAuth || !firebaseDb || !googleAuthProvider) {
    console.warn("Firebase is not configured for authentication.");
    return false;
  }
  return true;
};

const normalizeTimestamp = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return value;

  if (typeof value === "object" && value !== null) {
    const candidate = value as { toDate?: () => Date };
    if (typeof candidate.toDate === "function") {
      return candidate.toDate().toISOString();
    }
  }

  return undefined;
};

export const mapFirebaseUser = (firebaseUser: FirebaseUser): AppUser => ({
  id: firebaseUser.uid,
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  user_metadata: {
    name: firebaseUser.displayName,
    full_name: firebaseUser.displayName,
    avatar_url: firebaseUser.photoURL,
    picture: firebaseUser.photoURL,
    email: firebaseUser.email,
  },
});

const buildDefaultUserProfile = (firebaseUser: FirebaseUser): UserProfile => ({
  id: firebaseUser.uid,
  uid: firebaseUser.uid,
  email: firebaseUser.email || "",
  name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
  avatar_url: firebaseUser.photoURL,
  created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!ensureFirebaseReady()) return null;

  const snapshot = await getDoc(doc(firebaseDb!, "users", userId));
  if (!snapshot.exists()) return null;

  const data = snapshot.data() as DocumentData;

  return {
    id: snapshot.id,
    uid: data.uid || snapshot.id,
    email: data.email || "",
    name: data.name || "User",
    avatar_url: data.avatar_url || data.photoURL || null,
    class: data.class || data.userClass || "",
    school: data.school || "",
    city: data.city || "",
    phone: data.phone || "",
    gender: data.gender || "",
    dateOfBirth: data.dateOfBirth || "",
    targetYear: data.targetYear || "",
    role: data.role || "",
    is_admin: Boolean(data.is_admin || data.isAdmin || data.role === "admin"),
    onboardingCompleted: Boolean(data.onboardingCompleted),
    created_at: data.created_at || data.date || undefined,
    updated_at: data.updated_at || undefined,
  };
};

export const upsertUserProfile = async (firebaseUser: FirebaseUser): Promise<UserProfile> => {
  if (!ensureFirebaseReady()) {
    return buildDefaultUserProfile(firebaseUser);
  }

  const userRef = doc(firebaseDb!, "users", firebaseUser.uid);
  const existing = await getDoc(userRef);

  if (!existing.exists()) {
    const defaultProfile = buildDefaultUserProfile(firebaseUser);
    await setDoc(userRef, {
      ...defaultProfile,
      date: defaultProfile.created_at,
      onboardingCompleted: false,
    });
    return defaultProfile;
  }

  const existingData = existing.data();
  await setDoc(
    userRef,
    {
      uid: existingData.uid || firebaseUser.uid,
      email: existingData.email || firebaseUser.email || "",
      name:
        existingData.name ||
        firebaseUser.displayName ||
        firebaseUser.email?.split("@")[0] ||
        "User",
      avatar_url: existingData.avatar_url || firebaseUser.photoURL || null,
      updated_at: new Date().toISOString(),
    },
    { merge: true },
  );

  return (await getUserProfile(firebaseUser.uid)) || buildDefaultUserProfile(firebaseUser);
};

export const syncUserProfileSafely = async (
  firebaseUser: FirebaseUser,
): Promise<UserProfile | null> => {
  try {
    return await upsertUserProfile(firebaseUser);
  } catch (error) {
    console.warn("Firebase profile sync skipped:", error);
    return null;
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>,
): Promise<void> => {
  if (!ensureFirebaseReady()) return;

  await updateDoc(doc(firebaseDb!, "users", userId), {
    ...updates,
    userClass: updates.class,
    updated_at: new Date().toISOString(),
  });
};

export const signInWithGoogle = async (): Promise<void> => {
  if (!ensureFirebaseReady()) {
    console.warn("Cannot sign in: Firebase is not configured");
    return;
  }

  await setPersistence(firebaseAuth!, browserLocalPersistence);
  googleAuthProvider!.setCustomParameters({
    prompt: "select_account",
  });

  try {
    const result = await signInWithPopup(firebaseAuth!, googleAuthProvider!);
    await syncUserProfileSafely(result.user);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("neetpeak_auth_redirect");
    }
    return;
  } catch (error) {
    const firebaseError = error as { code?: string };
    const shouldFallbackToRedirect =
      firebaseError.code === "auth/popup-blocked" ||
      firebaseError.code === "auth/popup-closed-by-user" ||
      firebaseError.code === "auth/cancelled-popup-request" ||
      firebaseError.code === "auth/operation-not-supported-in-this-environment";

    if (!shouldFallbackToRedirect) {
      throw error;
    }
  }

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem("neetpeak_auth_redirect", "google");
  }

  await signInWithRedirect(firebaseAuth!, googleAuthProvider!);
};

// Email/Password Authentication
export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string
): Promise<AppUser> => {
  if (!ensureFirebaseReady()) {
    throw new Error("Firebase is not configured");
  }

  await setPersistence(firebaseAuth!, browserLocalPersistence);
  
  const userCredential = await createUserWithEmailAndPassword(firebaseAuth!, email, password);
  
  // Update display name
  await updateProfile(userCredential.user, { displayName: name });
  
  // Create user profile in Firestore
  await upsertUserProfile(userCredential.user);
  
  return mapFirebaseUser(userCredential.user);
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AppUser> => {
  if (!ensureFirebaseReady()) {
    throw new Error("Firebase is not configured");
  }

  await setPersistence(firebaseAuth!, browserLocalPersistence);
  
  const userCredential = await signInWithEmailAndPassword(firebaseAuth!, email, password);
  
  // Sync user profile
  await syncUserProfileSafely(userCredential.user);
  
  return mapFirebaseUser(userCredential.user);
};

export const completeRedirectSignIn = async (): Promise<{
  user: AppUser | null;
  profile: UserProfile | null;
  debug: RedirectDebugState;
}> => {
  if (!ensureFirebaseReady()) {
    return {
      user: null,
      profile: null,
      debug: { stage: "firebase-not-configured", message: "Firebase is not configured" },
    };
  }

  const redirectFlag =
    typeof window !== "undefined"
      ? window.sessionStorage.getItem("neetpeak_auth_redirect")
      : null;

  const result = await getRedirectResult(firebaseAuth!);

  if (typeof window !== "undefined" && redirectFlag) {
    window.sessionStorage.removeItem("neetpeak_auth_redirect");
  }

  const resolvedUser = result?.user || (redirectFlag ? await waitForFirebaseUser() : null);

  if (!resolvedUser) {
    return {
      user: null,
      profile: null,
      debug: {
        stage: redirectFlag ? "redirect-returned-no-user" : "no-redirect-result",
      },
    };
  }

  const profile = await syncUserProfileSafely(resolvedUser);
  return {
    user: mapFirebaseUser(resolvedUser),
    profile,
    debug: {
      stage: result?.user ? "redirect-user-restored" : "redirect-user-restored-from-auth-state",
      message: resolvedUser.email || resolvedUser.uid,
    },
  };
};

export const signOut = async (): Promise<void> => {
  if (!ensureFirebaseReady()) return;
  await firebaseSignOut(firebaseAuth!);
};

export const subscribeToAuthState = (
  callback: (user: AppUser | null, profile: UserProfile | null) => Promise<void> | void,
): (() => void) => {
  if (!ensureFirebaseReady()) {
    return () => {}; // Return empty unsubscribe function
  }

  return onAuthStateChanged(firebaseAuth!, async (firebaseUser) => {
    if (!firebaseUser) {
      await callback(null, null);
      return;
    }

    const profile = await syncUserProfileSafely(firebaseUser);
    await callback(mapFirebaseUser(firebaseUser), profile);
  });
};

export const getCurrentAuthUser = (): AppUser | null => {
  if (!ensureFirebaseReady()) return null;

  const currentUser = firebaseAuth!.currentUser;
  return currentUser ? mapFirebaseUser(currentUser) : null;
};

export const fetchUserPayments = async (userId: string): Promise<FirebasePurchase[]> => {
  if (!ensureFirebaseReady()) return [];

  const paymentsQuery = query(collection(firebaseDb!, "payments"), where("userId", "==", userId));
  const snapshot = await getDocs(paymentsQuery);

  return snapshot.docs
    .map((paymentDoc) => {
      const data = paymentDoc.data();
      return {
        id: paymentDoc.id,
        amount: Number(data.amount || 0),
        pdfTitle: String(data.pdfTitle || ""),
        status: String(data.status || ""),
        timestamp: normalizeTimestamp(data.timestamp),
        userId: String(data.userId || ""),
      };
    })
    .filter((payment) => payment.status.toLowerCase() === "captured");
};

export const fetchPaidContent = async (): Promise<FirebasePaidContent[]> => {
  if (!ensureFirebaseReady()) return [];

  const snapshot = await getDocs(collection(firebaseDb!, "paidContent"));
  return snapshot.docs.map((contentDoc) => {
    const data = contentDoc.data();
    return {
      id: String(data.id || contentDoc.id),
      title: String(data.id || contentDoc.id),
      cost: Number(data.cost || 0),
      desc: typeof data.desc === "string" ? data.desc : "",
      img: typeof data.img === "string" ? data.img : "",
      info1: typeof data.info1 === "string" ? data.info1 : "",
      info2: typeof data.info2 === "string" ? data.info2 : "",
      info3: typeof data.info3 === "string" ? data.info3 : "",
      pdfName: typeof data.pdfName === "string" ? data.pdfName : "",
      pdfUrl: typeof data.pdfUrl === "string" ? data.pdfUrl : "",
    };
  });
};
