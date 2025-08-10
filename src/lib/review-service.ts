
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
    
    const newReviewData = {
        userId,
        userName,
        rating,
        comment,
        createdAt: serverTimestamp()
    };
    
    // Add the new review and update the product's average rating in a transaction
    await runTransaction(db, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) {
            throw new Error("Le produit n'existe pas ou la connexion à la base de données a échoué.");
        }

        // Add the new review document
        const newReviewRef = doc(reviewsColRef); // Create a new ref in the subcollection
        transaction.set(newReviewRef, newReviewData);
        
        // Update the aggregate rating on the product
        const currentData = productDoc.data();
        const currentRating = currentData.rating || 0;
        const currentReviewsCount = currentData.reviews || 0;

        const newReviewsCount = currentReviewsCount + 1;
        const newTotalRating = (currentRating * currentReviewsCount) + rating;
        const newAverageRating = newTotalRating / newReviewsCount;

        transaction.update(productRef, { 
            rating: newAverageRating, 
            reviews: newReviewsCount 
        });
    });

    // The review is created within the transaction, we need to return something sensible
    // For simplicity, we'll return the input data as the created review, as fetching it again is complex post-transaction
     return {
        id: 'temp-id', // The actual ID is generated in the transaction
        userId,
        userName,
        rating,
        comment,
        createdAt: new Date()
    } as Review;
};
