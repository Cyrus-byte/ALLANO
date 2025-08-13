
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, arrayUnion, query, where, getDocs, orderBy, getDoc, updateDoc } from 'firebase/firestore';
import type { Order } from './types';
import { getProducts } from './product-service';

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
            // Convert Firestore Timestamp to Date object
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as Order);
    });

    return orders;
}

export const getOrderById = async (orderId: string): Promise<Order | null> => {
    if (!orderId) {
        console.error("getOrderById: orderId is required.");
        return null;
    }
    try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
            const data = orderSnap.data();
            const allProducts = await getProducts(); // This could be optimized
            const productMap = new Map(allProducts.map(p => [p.id, p]));

            const itemsWithProducts = data.items.map((item: any) => ({
                ...item,
                product: productMap.get(item.productId)
            }));

            return { 
                id: orderSnap.id, 
                ...data,
                items: itemsWithProducts,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            } as Order;
        } else {
            console.warn(`Order with ID ${orderId} not found.`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching order with ID ${orderId}:`, error);
        return null;
    }
}


export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (!orderId) {
        throw new Error("Order ID is required to update status.");
    }
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
}
