
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, serverTimestamp, updateDoc, orderBy, query, getDoc, where, Timestamp, setDoc } from 'firebase/firestore';
import type { PromoCode } from './types';


export const createPromoCode = async (data: Omit<PromoCode, 'createdAt'> & {id: string}) => {
  const promoCodeRef = doc(db, 'promoCodes', data.id);
  const promoCodeSnap = await getDoc(promoCodeRef);

  if (promoCodeSnap.exists()) {
    throw new Error('Un code promotionnel avec cet ID existe déjà.');
  }

  const promoCodeWithTimestamp: any = {
    ...data,
    createdAt: serverTimestamp(),
  };

  // Firestore doesn't allow `undefined` values.
  // If expiresAt is not provided, remove it from the object.
  if (!promoCodeWithTimestamp.expiresAt) {
    delete promoCodeWithTimestamp.expiresAt;
  }


  await setDoc(promoCodeRef, promoCodeWithTimestamp);
  return data.id;
};


export const getPromoCodes = async (): Promise<PromoCode[]> => {
    const promoCodesCol = collection(db, 'promoCodes');
    const q = query(promoCodesCol, orderBy("createdAt", "desc"));
    
    const querySnapshot = await getDocs(q);
    const promoCodes: PromoCode[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Convert timestamp to Date object if it exists
        if (data.expiresAt && data.expiresAt.toDate) {
            data.expiresAt = data.expiresAt.toDate();
        }
        promoCodes.push({
            ...data,
            id: doc.id,
        } as PromoCode);
    });

    return promoCodes;
}


export const updatePromoCode = async (codeId: string, data: Partial<Omit<PromoCode, 'id' | 'createdAt'>>) => {
  if (!codeId) {
    throw new Error("L'ID du code est requis pour la mise à jour.");
  }
  const promoCodeRef = doc(db, 'promoCodes', codeId);
  
  const dataToUpdate = { ...data };

  // If expiresAt is explicitly set to undefined, delete it.
  if (dataToUpdate.expiresAt === undefined) {
      delete dataToUpdate.expiresAt;
  }

  await updateDoc(promoCodeRef, dataToUpdate);
};


export const deletePromoCode = async (codeId: string): Promise<void> => {
    if (!codeId) {
        throw new Error("L'ID du code est requis pour la suppression.");
    }
    const promoCodeRef = doc(db, 'promoCodes', codeId);
    await deleteDoc(promoCodeRef);
};


export const applyPromoCode = async (code: string, cartTotal: number): Promise<{ promoCode: PromoCode, discount: number }> => {
    const promoCodeRef = doc(db, 'promoCodes', code);
    const promoCodeSnap = await getDoc(promoCodeRef);

    if (!promoCodeSnap.exists()) {
        throw new Error("Le code promotionnel n'est pas valide.");
    }

    const promoCodeData = promoCodeSnap.data();
    
    if (promoCodeData.expiresAt && promoCodeData.expiresAt.toDate) {
        promoCodeData.expiresAt = promoCodeData.expiresAt.toDate();
    }
    
    const promoCode = promoCodeData as PromoCode;

    // Check expiry
    if (promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date()) {
        throw new Error("Ce code promotionnel a expiré.");
    }

    let discount = 0;
    if (promoCode.type === 'percentage') {
        discount = (cartTotal * promoCode.value) / 100;
    } else if (promoCode.type === 'fixed') {
        discount = promoCode.value;
    }

    if (cartTotal < discount) {
         throw new Error("Le montant de la commande est inférieur à la réduction.");
    }

    return { promoCode: {...promoCode, id: promoCodeSnap.id }, discount };
}
