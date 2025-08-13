
import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrderById, updateOrderStatus } from '@/lib/order-service';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// This is the server-to-server notification endpoint for CinetPay
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // CinetPay sends transaction details in the request body
    const { cpm_trans_id, cpm_site_id, cpm_amount, cpm_currency, cpm_signature, cpm_payment_date, cpm_payment_time, cpm_error_message, cpm_trans_status } = body;

    console.log("CinetPay Notification Received:", body);

    // TODO: You should verify the signature here for security
    // This requires making a request back to CinetPay to check the transaction status
    // For now, we trust the notification if the status is "ACCEPTED"

    if (cpm_trans_status === 'ACCEPTED') {
      // The transaction ID from your side, which you sent when initializing
      // Note: CinetPay doesn't send back the initial transaction_id in the standard notification.
      // A common pattern is to find the order using cpm_trans_id (CinetPay's ID)
      // or to rely on the client-side creation and use this endpoint as a backup/confirmation.

      // Let's assume for now that the client-side creation has worked,
      // and this is just a confirmation. We can log it or update the status if needed.
      // A more robust implementation would check if an order with `paymentDetails.cpm_trans_id`
      // exists and is still 'Pending', then update it to 'Paid'.
      
      console.log(`Payment confirmed for CinetPay transaction ${cpm_trans_id}. Amount: ${cpm_amount} ${cpm_currency}`);
      
      // Here you could implement logic to:
      // 1. Check if an order with this `cpm_trans_id` already exists.
      // 2. If it exists and its status is 'Pending', update it to 'Paid'.
      // 3. If it doesn't exist, you might need to create it, but this would require
      //    passing more metadata (like cart items) during CinetPay initialization,
      //    which is an advanced feature.
      
    } else {
       console.log(`Payment was not successful for CinetPay transaction ${cpm_trans_id}. Status: ${cpm_trans_status}, Message: ${cpm_error_message}`);
    }

    // Respond to CinetPay to acknowledge receipt of the notification
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error handling CinetPay notification:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
