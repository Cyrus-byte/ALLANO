
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
    const productRef = doc(db, 'products', productId);
    const reviewsColRef = collection(productRef, 'reviews');
    
    // Check if product exists before adding a review to its subcollection
    const productDoc = await getDoc(productRef);
    if (!productDoc.exists()) {
        throw "Le produit n'existe pas !";
    }

    const newReviewData = {
        userId,
        userName,
        rating,
        comment,
        createdAt: serverTimestamp()
    };
    
    const newReviewRef = await addDoc(reviewsColRef, newReviewData);
    
    return {
        id: newReviewRef.id,
        ...newReviewData,
        createdAt: new Date().toISOString() // Approximate client-side date
    } as Review;
};

