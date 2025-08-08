
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const settingsDocRef = doc(db, 'settings', 'homepage');

export interface HomepageSettings {
    heroImageUrls: string[];
    heroHeadline?: string;
    heroSubheadline?: string;
}

/**
 * Updates the homepage settings in Firestore.
 * @param settings The new settings object.
 */
export const updateHomepageSettings = async (settings: HomepageSettings) => {
  try {
    await setDoc(settingsDocRef, { 
        ...settings,
        updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error updating homepage settings:", error);
    throw new Error("Failed to update homepage settings.");
  }
};

/**
 * Fetches the homepage settings from Firestore.
 * @returns A promise that resolves to the settings object, or null if not found.
 */
export const getHomepageSettings = async (): Promise<HomepageSettings | null> => {
    try {
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
            return docSnap.data() as HomepageSettings;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching homepage settings:", error);
        return null;
    }
}
