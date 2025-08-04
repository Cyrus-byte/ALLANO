
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import type { Order } from './types';

export const createOrder = async (orderData: Omit<Order, 'createdAt'>) => {
  if (!orderData.userId) {
    throw new Error("L'ID de l'utilisateur est requis pour créer une commande.");
  }

  const orderWithTimestamp = {
    ...orderData,
    createdAt: serverTimestamp(),
  };

  const orderRef = await addDoc(collection(db, 'orders'), orderWithTimestamp);
  
  // Add the order to the user's subcollection of orders for easy lookup
  const userOrderRef = doc(db, 'users', orderData.userId, 'orders', orderRef.id);
  await updateDoc(doc(db, 'users', orderData.userId), {
      orders: userOrderRef
  });


  return orderRef.id;
};
