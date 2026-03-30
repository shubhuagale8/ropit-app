import React, { createContext, useContext, useEffect, useState } from "react";
import auth from "@react-native-firebase/auth";
import { getNurseryProfile } from "../config/firebase";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(undefined); // undefined means still loading
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const unsub = auth().onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser || null);
      if (firebaseUser) {
        try {
          const p = await getNurseryProfile(firebaseUser.uid);
          setProfile(p || null);
        } catch (e) {
          console.log("AuthContext profile load:", e.message);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    });
    return unsub;
  }, []);

  // Call this after saving nursery to refresh profile in context
  const refreshProfile = async () => {
    const u = auth().currentUser;
    if (!u) return;
    try {
      const p = await getNurseryProfile(u.uid);
      setProfile(p || null);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading: user === undefined,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
