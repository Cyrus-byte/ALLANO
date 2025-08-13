
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"; 
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/lib/types';


interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  
  const fetchUserData = useCallback(async (user: User | null) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setUserProfile(data);
            setIsAdmin(data.role === 'admin');
        } else {
             setIsAdmin(false);
             setUserProfile(null);
        }
    } else {
        setIsAdmin(false);
        setUserProfile(null);
    }
  }, []);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      await fetchUserData(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserData]);

  const createUserDocument = async (user: User, additionalData: Partial<UserProfile> = {}) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
        const [firstName, ...lastNameParts] = user.displayName?.split(' ') || ['', ''];
        const lastName = lastNameParts.join(' ');
        
        const userData: UserProfile = {
            email: user.email!,
            firstName: firstName,
            lastName: lastName,
            createdAt: new Date(),
            cart: [],
            wishlist: [],
            role: 'customer', // Default role
            ...additionalData
        };
        await setDoc(userRef, userData);
        setUserProfile(userData);
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const displayName = `${firstName} ${lastName}`;
      await updateProfile(userCredential.user, { displayName });
      
      await createUserDocument(userCredential.user, { firstName, lastName });

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

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error("Utilisateur non connecté.");
    
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, data);
    
    // Update displayName in Firebase Auth if names are changed
    if (data.firstName || data.lastName) {
        const newDisplayName = `${data.firstName || userProfile?.firstName} ${data.lastName || userProfile?.lastName}`.trim();
        if (newDisplayName && auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName: newDisplayName });
        }
    }

    // Refresh local profile state
    await fetchUserData(user);
  };


  const value = { user, userProfile, isAdmin, loading, signUp, logIn, logInWithGoogle, logOut, updateUserProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
