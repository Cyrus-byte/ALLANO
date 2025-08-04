
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { PRODUCTS } from '@/lib/data';

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const getWishlistFromLocalStorage = () => {
    try {
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) {
        const productIds = JSON.parse(storedWishlist) as string[];
        return PRODUCTS.filter(p => productIds.includes(p.id));
      }
    } catch (error) {
      console.error("Failed to parse wishlist from localStorage", error);
    }
    return [];
  };

  const getWishlistFromFirestore = useCallback(async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const wishlistData = userDoc.data().wishlist as { productId: string }[];
        const productIds = wishlistData.map(item => item.productId);
        const userWishlist = PRODUCTS.filter(p => productIds.includes(p.id));
        
        // Merge with local wishlist and update firestore
        const localWishlist = getWishlistFromLocalStorage();
        const mergedWishlist = [...new Map([...localWishlist, ...userWishlist].map(item => [item.id, item])).values()];
        if(mergedWishlist.length > userWishlist.length) {
            const updatedFirestoreWishlist = mergedWishlist.map(p => ({ productId: p.id }));
            await setDoc(userRef, { wishlist: updatedFirestoreWishlist }, { merge: true });
        }

        setWishlist(mergedWishlist);
        localStorage.removeItem('wishlist');
      }
    } catch (error) {
      console.error("Error fetching wishlist from Firestore:", error);
    }
  }, [user]);

  useEffect(() => {
    const loadWishlist = async () => {
        setLoading(true);
        if (user) {
            await getWishlistFromFirestore();
        } else {
            setWishlist(getWishlistFromLocalStorage());
        }
        setLoading(false);
    };
    loadWishlist();
  }, [user, getWishlistFromFirestore]);


  const toggleWishlist = async (product: Product) => {
    const isInWishlist = wishlist.some(item => item.id === product.id);

    if (user) {
        const userRef = doc(db, 'users', user.uid);
        try {
            if (isInWishlist) {
                await setDoc(userRef, {
                    wishlist: arrayRemove({ productId: product.id })
                }, { merge: true });
            } else {
                 await setDoc(userRef, {
                    wishlist: arrayUnion({ productId: product.id })
                }, { merge: true });
            }
        } catch (error) {
            console.error("Error updating firestore wishlist", error);
            toast({ title: "Erreur", description: "Impossible de mettre à jour les favoris.", variant: "destructive" });
            return;
        }
    }

    if (isInWishlist) {
      setWishlist(prev => prev.filter(item => item.id !== product.id));
      toast({
        title: "Retiré des favoris",
        description: `${product.name} a été retiré de vos favoris.`,
      });
    } else {
      setWishlist(prev => [...prev, product]);
      toast({
        title: "Ajouté aux favoris",
        description: `${product.name} a été ajouté à vos favoris.`,
      });
    }
  };
  
  useEffect(() => {
    if (!user) {
        try {
            const productIds = wishlist.map(p => p.id);
            localStorage.setItem('wishlist', JSON.stringify(productIds));
        } catch (error) {
            console.error("Failed to save wishlist to localStorage", error);
        }
    }
  }, [wishlist, user]);

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  const value = {
    wishlist,
    toggleWishlist,
    isInWishlist,
    loading
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
