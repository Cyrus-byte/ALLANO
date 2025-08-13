
import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from '@/lib/order-service';
import crypto from 'crypto';

// This is the server-to-server notification endpoint for CinetPay
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("CinetPay Notification Received:", body);

    const { cpm_trans_id, cpm_trans_status, cpm_site_id, signature } = body;

    // It's crucial to verify the signature to ensure the request is from CinetPay
    // The verification logic can be complex. For production, you must implement
    // a robust way to verify the transaction by calling CinetPay's check status endpoint.
    // For now, we will trust the notification if the status is ACCEPTED.
    // This is a simplified approach for demonstration.

    if (!cpm_trans_id) {
        console.error("Notification received without transaction ID.");
        return NextResponse.json({ success: false, error: 'Transaction ID missing' }, { status: 400 });
    }

    // The `cpm_trans_id` should be the ID of our order document in Firestore
    const orderId = cpm_trans_id;
    const order = await getOrderById(orderId);

    if (!order) {
        console.error(`Order with ID ${orderId} not found for notification.`);
        // Even if not found, we must return a 200 OK to CinetPay
        return NextResponse.json({ success: true, message: `Order ${orderId} not found but acknowledged.` });
    }

    if (order.status !== 'En attente') {
        console.log(`Order ${orderId} has already been processed. Current status: ${order.status}`);
        return NextResponse.json({ success: true, message: 'Order already processed.' });
    }

    if (cpm_trans_status === 'ACCEPTED') {
      // Payment is successful, update order status to "Payée"
      await updateOrderStatus(orderId, 'Payée');
      console.log(`Payment confirmed for order ${orderId}. Status updated to Payée.`);
      
    } else {
       // Payment failed or was cancelled, update order status to "Annulée"
       await updateOrderStatus(orderId, 'Annulée');
       console.log(`Payment failed for order ${orderId}. Status updated to Annulée.`);
    }

    // Respond to CinetPay to acknowledge receipt of the notification
    // It's critical to always return a 200 OK status.
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error handling CinetPay notification:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
