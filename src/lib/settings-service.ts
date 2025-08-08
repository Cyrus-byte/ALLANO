
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const settingsDocRef = doc(db, 'settings', 'homepage');

/**
 * Updates the homepage hero image URL in Firestore.
 * @param imageUrl The new URL for the hero image.
 */
export const updateHomepageHeroUrl = async (imageUrl: string) => {
  try {
    await setDoc(settingsDocRef, { 
        heroImageUrl: imageUrl,
        updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error updating homepage hero URL:", error);
    throw new Error("Failed to update homepage settings.");
  }
};

/**
 * Fetches the homepage hero image URL from Firestore.
 * @returns A promise that resolves to the hero image URL, or null if not found.
 */
export const getHomepageHeroUrl = async (): Promise<string | null> => {
    try {
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
            return docSnap.data().heroImageUrl || null;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching homepage settings:", error);
        return null;
    }
}
