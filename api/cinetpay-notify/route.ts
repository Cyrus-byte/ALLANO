
import { NextResponse } from 'next/server';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { headers } from 'next/headers';

// Initialize Firebase Admin SDK
// This is done once and re-used across invocations.
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}
const db = getFirestore();

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("CinetPay Notification Received:", body);

    const {cpm_trans_id: orderId, cpm_trans_status} = body;
    
    // Some basic validation
    if (!orderId) {
      console.error("Notification received without transaction ID.");
      // Acknowledge receipt to CinetPay even if there's no ID
      return NextResponse.json({ success: true, message: "Acknowledged: No transaction ID" }, { status: 200 });
    }

    const orderRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
        console.error(`Order with ID ${orderId} not found.`);
        // Acknowledge to prevent retries for non-existent orders
        return NextResponse.json({ success: true, message: `Order ${orderId} not found but acknowledged.` }, { status: 200 });
    }

    const order = orderDoc.data();
    // Prevent processing an already completed or cancelled order
    if (order?.status !== "En attente") {
        console.log(`Order ${orderId} has already been processed. Current status: ${order?.status}`);
        return NextResponse.json({ success: true, message: "Order already processed." }, { status: 200 });
    }

    if (cpm_trans_status === 'ACCEPTED') {
      await orderRef.update({ status: 'Payée' });
      console.log(`Payment confirmed for order ${orderId}. Status updated to Payée.`);
    } else {
      // Any other status from CinetPay is considered a failure here
      await orderRef.update({ status: 'Annulée' });
      console.log(`Payment failed for order ${orderId}. Status updated to Annulée.`);
    }
    
    // Acknowledge the notification to CinetPay
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Error handling CinetPay notification:", error);
    // Return a 500 error to signal a problem on our end
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
