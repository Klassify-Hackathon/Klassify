// React Native Firebase v27 uses the modular API (same shape as firebase-js-sdk).
import {
  getAuth,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  getIdToken,
  type User,
} from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { createContext, useContext, useEffect, useState } from "react";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase restores the session on app start, then this fires
    const auth = getAuth();
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
    } catch {}
    await firebaseSignOut(getAuth());
  };

  return (
    <Ctx.Provider value={{ user, loading, signOut }}>{children}</Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

// Use this in analyzeFile: headers: { Authorization: `Bearer ${await getToken()}` }
export async function getToken(): Promise<string | undefined> {
  const user = getAuth().currentUser;
  return user ? getIdToken(user) : undefined;
}
