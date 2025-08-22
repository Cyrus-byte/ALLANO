
import { NextResponse } from 'next/server';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// This function needs to be outside the handler to avoid re-initialization on every call in a serverless environment.
function initializeAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }
  
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountString) {
    throw new Error("La variable d'environnement FIREBASE_SERVICE_ACCOUNT_KEY n'est pas définie.");
  }
  
  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error("Erreur lors de l'analyse de FIREBASE_SERVICE_ACCOUNT_KEY:", error);
    throw new Error("La clé de compte de service Firebase est mal formatée.");
  }
}

const adminApp = initializeAdminApp();
const db = getFirestore(adminApp);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("CinetPay Notification Received:", body);

    const {cpm_trans_id: orderId, cpm_trans_status} = body;
    
    if (!orderId) {
      console.error("Notification received without transaction ID.");
      return NextResponse.json({ success: true, message: "Acknowledged: No transaction ID" }, { status: 200 });
    }

    const orderRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
        console.error(`Order with ID ${orderId} not found.`);
        return NextResponse.json({ success: true, message: `Order ${orderId} not found but acknowledged.` }, { status: 200 });
    }

    const order = orderDoc.data();
    if (order?.status !== "En attente") {
        console.log(`Order ${orderId} has already been processed. Current status: ${order?.status}`);
        return NextResponse.json({ success: true, message: "Order already processed." }, { status: 200 });
    }

    if (cpm_trans_status === 'ACCEPTED') {
      await orderRef.update({ status: 'Payée' });
      console.log(`Payment confirmed for order ${orderId}. Status updated to Payée.`);
    } else {
      await orderRef.update({ status: 'Annulée' });
      console.log(`Payment failed for order ${orderId}. Status updated to Annulée.`);
    }
    
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Error handling CinetPay notification:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
