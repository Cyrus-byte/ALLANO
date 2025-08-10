
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
    const reviewsColRef = collection(db, 'products', productId, 'reviews');
    
    const newReviewData = {
        userId,
        userName,
        rating,
        comment,
        createdAt: serverTimestamp()
    };
    
    const newReviewRef = doc(reviewsColRef);

    try {
        await runTransaction(db, async (transaction) => {
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists()) {
                throw "Document does not exist!";
            }

            // Get current reviews data
            const currentReviews = await getReviewsByProductId(productId);
            const newNumberOfReviews = currentReviews.length + 1;
            const oldRatingTotal = (productDoc.data().rating || 0) * currentReviews.length;
            const newAverageRating = (oldRatingTotal + rating) / newNumberOfReviews;

            // Update product with new average rating and review count
            transaction.update(productRef, { 
                rating: newAverageRating,
                reviews: newNumberOfReviews
            });

            // Add the new review
            transaction.set(newReviewRef, newReviewData);
        });

    } catch (e) {
        console.error("Transaction failed: ", e);
        throw new Error("Impossible d'ajouter l'avis.");
    }

     return {
        id: newReviewRef.id,
        userId,
        userName,
        rating,
        comment,
        createdAt: new Date()
    } as Review;
};
