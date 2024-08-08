import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    User,
  } from "firebase/auth";
  import { app } from "./firebase";
  
import { useEffect, useState } from "react";
  
  export interface StoredUser {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  }
  
  const auth = getAuth(app);
  
  export const signInWithGoogle = async (): Promise<StoredUser | null> => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const user = result.user;
      const userData: StoredUser = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      return null;
    }
  };
  
  export const handleSignOut = async (): Promise<void> => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  export const useAuthState = (): [
    StoredUser | null,
    boolean,
    (currentUser: User | null) => void
  ] => {
    const [user, setUser] = useState<StoredUser | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setLoading(true);
        if (currentUser) {
          const userData: StoredUser = {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
          };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
        setLoading(false);
      });
  
      return () => unsubscribe();
    }, []);
  
    return [user, loading, setUser];
  };