
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, serverTimestamp, updateDoc, orderBy, query, getDoc, where, Timestamp, setDoc } from 'firebase/firestore';
import type { PromoCode } from './types';


export const createPromoCode = async (data: Omit<PromoCode, 'id' | 'createdAt'>) => {
  const promoCodeRef = doc(db, 'promoCodes', data.id);
  const promoCodeSnap = await getDoc(promoCodeRef);

  if (promoCodeSnap.exists()) {
    throw new Error('Un code promotionnel avec cet ID existe déjà.');
  }

  const promoCodeWithTimestamp = {
    ...data,
    createdAt: serverTimestamp(),
  };

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
  await updateDoc(promoCodeRef, data);
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

    const promoCode = promoCodeSnap.data() as PromoCode;

    // Check expiry
    if (promoCode.expiresAt && promoCode.expiresAt.toDate() < new Date()) {
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

    return { promoCode, discount };
}
