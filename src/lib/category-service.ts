
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, serverTimestamp, updateDoc, orderBy, query } from 'firebase/firestore';
import type { Category } from './types';

/**
 * Creates a new category in the Firestore database.
 * @param name The name for the new category.
 * @returns The ID of the newly created category.
 */
export const createCategory = async (name: string, attributes: Category['attributes']) => {
  if (!name) {
    throw new Error("Le nom de la catégorie est requis.");
  }
  const categoryWithDefaults = {
    name: name,
    attributes: attributes || {},
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'categories'), categoryWithDefaults);
  return docRef.id;
};

/**
 * Fetches all categories from Firestore.
 * @returns A promise that resolves to an array of categories.
 */
export const getCategories = async (): Promise<Category[]> => {
    const categoriesCol = collection(db, 'categories');
    const q = query(categoriesCol, orderBy("name", "asc"));
    
    const querySnapshot = await getDocs(q);
    const categories: Category[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        categories.push({
            id: doc.id,
            ...data
        } as Category);
    });

    return categories;
}

/**
 * Updates an existing category in Firestore.
 * @param categoryId The ID of the category to update.
 * @param name The new name for the category.
 */
export const updateCategory = async (categoryId: string, name: string, attributes: Category['attributes']) => {
  if (!categoryId || !name) {
    throw new Error("L'ID et le nom de la catégorie sont requis pour la mise à jour.");
  }
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await updateDoc(categoryRef, { name, attributes });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la catégorie ${categoryId}:`, error);
    throw new Error("La mise à jour de la catégorie a échoué.");
  }
};


/**
 * Deletes a category from Firestore.
 * @param categoryId The ID of the category to delete.
 */
export const deleteCategory = async (categoryId: string): Promise<void> => {
    if (!categoryId) {
        throw new Error("L'ID de la catégorie est requis pour la suppression.");
    }
    try {
        const categoryRef = doc(db, 'categories', categoryId);
        await deleteDoc(categoryRef);
    } catch (error) {
        console.error(`Erreur lors de la suppression de la catégorie ${categoryId}:`, error);
        throw new Error("La suppression de la catégorie a échoué.");
    }
};
