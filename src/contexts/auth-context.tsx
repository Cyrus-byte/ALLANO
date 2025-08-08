
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from "firebase/firestore"; 
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

// Hardcoded Admin UID. In a real-world scenario, this might come from a secure config.
const ADMIN_UID = 'Lh1t3W3YqWg2S6uWdBsY05tSgT23';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const createUserDocument = async (user: User, additionalData = {}) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        const userData = {
            email: user.email,
            displayName: user.displayName,
            createdAt: new Date(),
            cart: [],
            wishlist: [],
            ...additionalData
        };

        if (user.uid === ADMIN_UID) {
            // @ts-ignore
            userData.roles = { admin: true };
        }

        await setDoc(userRef, userData);
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const displayName = `${firstName} ${lastName}`;
      await updateProfile(userCredential.user, { displayName });
      
      const userWithProfile = { ...userCredential.user, displayName };
      await createUserDocument(userWithProfile);

      setUser(userCredential.user);
      router.push('/');
      toast({ title: "Compte créé", description: "Bienvenue sur Allano !" });
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast({ title: "Erreur d'inscription", description: error.message, variant: 'destructive' });
    }
  };

  const logIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/account');
      toast({ title: "Connexion réussie", description: "Heureux de vous revoir !" });
    } catch (error: any) {
      console.error("Error logging in:", error);
      toast({ title: "Erreur de connexion", description: "Email ou mot de passe incorrect.", variant: 'destructive' });
    }
  };

  const logInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createUserDocument(result.user);
      router.push('/account');
      toast({ title: "Connexion réussie", description: "Heureux de vous revoir !" });
    } catch (error: any) {
      console.error("Error with Google login:", error);
      toast({ title: "Erreur de connexion Google", description: error.message, variant: 'destructive' });
    }
  };


  const logOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/');
      toast({ title: "Déconnexion", description: "Vous avez été déconnecté." });
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast({ title: "Erreur", description: "Impossible de se déconnecter.", variant: 'destructive' });
    }
  };

  const value = { user, loading, signUp, logIn, logInWithGoogle, logOut };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
