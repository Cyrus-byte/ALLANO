import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

// This Cloud Function replaces the Next.js API route for CinetPay notifications.
export const cinetpayNotify = functions.https.onRequest(async (req, res) => {
  try {
    // CinetPay notifications use POST with JSON body
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const body = req.body;
    functions.logger.log("CinetPay Notification Received:", body);

    const {cpm_trans_id: orderId, cpm_trans_status} = body;

    if (!orderId) {
      functions.logger.error("Notification received without transaction ID.");
      // Acknowledge receipt to CinetPay
      res.status(200).json({success: true, message: "Acknowledged: No transaction ID"});
      return;
    }

    const orderRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      functions.logger.error(`Order with ID ${orderId} not found.`);
      res.status(200).json({success: true, message: `Order ${orderId} not found but acknowledged.`});
      return;
    }

    const order = orderDoc.data();
    if (order?.status !== "En attente") {
      functions.logger.log(`Order ${orderId} has already been processed. Current status: ${order?.status}`);
      res.status(200).json({success: true, message: "Order already processed."});
      return;
    }

    if (cpm_trans_status === "ACCEPTED") {
      await orderRef.update({status: "Payée"});
      functions.logger.log(`Payment confirmed for order ${orderId}. Status updated to Payée.`);
    } else {
      await orderRef.update({status: "Annulée"});
      functions.logger.log(`Payment failed for order ${orderId}. Status updated to Annulée.`);
    }

    res.status(200).json({success: true});
  } catch (error) {
    functions.logger.error("Error handling CinetPay notification:", error);
    res.status(500).json({success: false, error: "Internal Server Error"});
  }
});
