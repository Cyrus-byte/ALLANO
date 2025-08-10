
import { db } from '@/lib/firebase';
import { 
    collection, 
    addDoc, 
    serverTimestamp, 
    query, 
    where, 
    getDocs, 
    orderBy,
    doc,
    runTransaction,
    getDoc
} from 'firebase/firestore';
import type { Review } from './types';


export const getReviewsByProductId = async (productId: string): Promise<Review[]> => {
    if (!productId) return [];
    
    const reviewsCol = collection(db, 'products', productId, 'reviews');
    const q = query(reviewsCol, orderBy("createdAt", "desc"));

    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as Review);
    });

    return reviews;
}


export const addReview = async (productId: string, userId: string, userName: string, rating: number, comment: string): Promise<Review> => {
    const reviewsColRef = collection(db, 'products', productId, 'reviews');
    
    const newReviewData = {
        userId,
        userName,
        rating,
        comment,
        createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(reviewsColRef, newReviewData);

     return {
        id: docRef.id,
        userId,
        userName,
        rating,
        comment,
        createdAt: new Date()
    } as Review;
};
