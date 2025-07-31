
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
    } catch (error) {
        console.error("Failed to parse wishlist from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch (error) {
        console.error("Failed to save wishlist to localStorage", error);
    }
  }, [wishlist]);

  const toggleWishlist = (product: Product) => {
    const existingItem = wishlist.find(item => item.id === product.id);

    if (existingItem) {
      setWishlist(prevWishlist => prevWishlist.filter(item => item.id !== product.id));
      toast({
        title: "Retiré des favoris",
        description: `${product.name} a été retiré de vos favoris.`,
      });
    } else {
      setWishlist(prevWishlist => [...prevWishlist, product]);
      toast({
        title: "Ajouté aux favoris",
        description: `${product.name} a été ajouté à vos favoris.`,
      });
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  const value = {
    wishlist,
    toggleWishlist,
    isInWishlist
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
