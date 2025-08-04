
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, arrayUnion, query, where, getDocs, orderBy } from 'firebase/firestore';
import type { Order } from './types';

export const createOrder = async (orderData: Omit<Order, 'createdAt'>) => {
  if (!orderData.userId) {
    throw new Error("L'ID de l'utilisateur est requis pour créer une commande.");
  }

  const orderWithTimestamp = {
    ...orderData,
    createdAt: serverTimestamp(),
  };

  const docRef = doc(collection(db, 'orders'));
  await setDoc(docRef, { ...orderWithTimestamp, id: docRef.id });

  const userRef = doc(db, 'users', orderData.userId);

  await setDoc(userRef, { 
    orders: arrayUnion({ orderId: docRef.id, createdAt: new Date() }) 
  }, { merge: true });


  return docRef.id;
};

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
    if (!userId) {
        throw new Error("L'ID de l'utilisateur est requis pour récupérer les commandes.");
    }

    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, where("userId", "==", userId), orderBy("createdAt", "desc"));
    
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
            ...data,
            id: doc.id,
            // Convert Firestore Timestamp to Date object if needed
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as Order);
    });

    return orders;
}
