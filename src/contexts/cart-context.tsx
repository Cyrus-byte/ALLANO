
"use client";

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import type { CartItem, Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { PRODUCTS } from '@/lib/data';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const mapCartItems = (cartItems: Omit<CartItem, 'product'>[]): CartItem[] => {
    return cartItems.map(item => ({
        ...item,
        product: PRODUCTS.find(p => p.id === item.productId)
    })).filter(item => item.product) as (CartItem & { product: Product })[];
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();


  const getCartFromLocalStorage = (): Omit<CartItem, 'product'>[] => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        return JSON.parse(storedCart);
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
    }
    return [];
  };

  const getCartFromFirestore = useCallback(async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const firestoreCart = (userDoc.data()?.cart || []) as Omit<CartItem, 'product'>[];
        const localCart = getCartFromLocalStorage();

        // Merge logic
        const mergedCartMap = new Map<string, Omit<CartItem, 'product'>>();
        
        [...firestoreCart, ...localCart].forEach(item => {
            const existing = mergedCartMap.get(item.id);
            if (existing) {
                mergedCartMap.set(item.id, { ...existing, quantity: existing.quantity + item.quantity });
            } else {
                mergedCartMap.set(item.id, item);
            }
        });

        const mergedCart = Array.from(mergedCartMap.values());
        
        if (mergedCart.length > 0) {
            await setDoc(userRef, { cart: mergedCart }, { merge: true });
        }
        
        setCart(mapCartItems(mergedCart));
        localStorage.removeItem('cart');
      }
    } catch (error) {
      console.error("Error fetching/merging cart from Firestore:", error);
    }
  }, [user]);

  useEffect(() => {
    const loadCart = async () => {
        setLoading(true);
        if (user) {
            await getCartFromFirestore();
        } else {
            setCart(mapCartItems(getCartFromLocalStorage()));
        }
        setLoading(false);
    };
    loadCart();
  }, [user, getCartFromFirestore]);


  const updateFirestoreCart = async (newCart: CartItem[]) => {
    if (!user) return;
    try {
        const userRef = doc(db, 'users', user.uid);
        const cartForFirestore = newCart.map(({ product, ...rest }) => rest);
        await setDoc(userRef, { cart: cartForFirestore }, { merge: true });
    } catch (error) {
        console.error("Error updating firestore cart", error);
        toast({ title: "Erreur", description: "Impossible de mettre à jour le panier.", variant: "destructive" });
    }
  }

  useEffect(() => {
    if (!user && !loading) {
        try {
            const cartToStore = cart.map(({ product, ...rest}) => rest);
            localStorage.setItem('cart', JSON.stringify(cartToStore));
        } catch (error) {
            console.error("Failed to save cart to localStorage", error);
        }
    }
  }, [cart, user, loading]);


  const addToCart = (product: Product, size: string, color: string, quantity: number = 1) => {
    const itemId = `${product.id}-${size}-${color}`;
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId);
      let newCart;
      if (existingItem) {
        newCart = prevCart.map(item =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        newCart = [...prevCart, { id: itemId, productId: product.id, product, size, color, quantity: quantity }];
      }
      if (user) updateFirestoreCart(newCart);
      return newCart;
    });
    toast({
      title: "Ajouté au panier",
      description: `${quantity} x ${product.name} a été ajouté à votre panier.`,
    });
  };

  const removeFromCart = (itemId: string) => {
    const itemToRemove = cart.find(item => item.id === itemId);
    const newCart = cart.filter(item => item.id !== itemId)
    setCart(newCart);
    if (user) updateFirestoreCart(newCart);

    if (itemToRemove) {
        toast({
            title: "Article supprimé",
            description: `${itemToRemove.product?.name} a été retiré de votre panier.`,
            variant: "destructive",
          });
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    const newCart = cart.map(item => (item.id === itemId ? { ...item, quantity } : item));
    setCart(newCart);
    if (user) updateFirestoreCart(newCart);
  };

  const clearCart = () => {
    setCart([]);
    if (user) updateFirestoreCart([]);
  };

  const totalItems = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const totalPrice = useMemo(() => {
    return cart.reduce((total, item) => {
      if (!item.product) return total;
      const price = item.product.onSale ? item.product.salePrice! : item.product.price;
      return total + price * item.quantity;
    }, 0);
  }, [cart]);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    loading
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
