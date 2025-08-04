
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, arrayUnion } from 'firebase/firestore';
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
  
  const userRef = doc(db, 'users', orderData.userId);

  // Atomically add a new order to the "orders" array field.
  await setDoc(userRef, { 
    orders: arrayUnion({ orderId: orderRef.id, createdAt: new Date() }) 
  }, { merge: true });


  return orderRef.id;
};
