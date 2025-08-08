
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const settingsDocRef = doc(db, 'settings', 'homepage');

/**
 * Updates the homepage hero image URLs in Firestore.
 * @param imageUrls The new array of URLs for the hero images.
 */
export const updateHomepageHeroUrls = async (imageUrls: string[]) => {
  try {
    await setDoc(settingsDocRef, { 
        heroImageUrls: imageUrls,
        updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error updating homepage hero URLs:", error);
    throw new Error("Failed to update homepage settings.");
  }
};

/**
 * Fetches the homepage hero image URLs from Firestore.
 * @returns A promise that resolves to an array of hero image URLs, or null if not found.
 */
export const getHomepageHeroUrls = async (): Promise<string[] | null> => {
    try {
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
            return docSnap.data().heroImageUrls || null;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching homepage settings:", error);
        return null;
    }
}
