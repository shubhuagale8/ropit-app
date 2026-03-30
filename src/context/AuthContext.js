import React, { createContext, useContext, useEffect, useState } from "react";
import auth from "@react-native-firebase/auth";
import { getNurseryProfile } from "../config/firebase";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser]                     = useState(undefined); // undefined = still loading
  const [profile, setProfile]               = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  // Temporarily holds nursery info collected before OTP so LocationMap can access it
  const [pendingInfo, setPendingInfo]       = useState(null);

  useEffect(() => {
    const unsub = auth().onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser || null);
      setProfileLoading(true);

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
        setPendingInfo(null); // clear on logout
      }

      setProfileLoading(false);
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
      // loading stays true until BOTH auth state AND profile fetch are done
      loading: user === undefined || profileLoading,
      profileLoading,
      refreshProfile,
      pendingInfo,
      setPendingInfo,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
