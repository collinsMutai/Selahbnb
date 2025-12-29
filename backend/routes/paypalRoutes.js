import express from "express";
import {
  createPaypalPayment,
  capturePaypalPayment,
  cancelPaypalPayment,
  refundPaypalPayment,
} from "../controllers/paypalController.js";
import { verifyPaypalWebhook } from "../utils/paypalUtils.js";
import PaypalTransaction from "../models/PaypalTransaction.js";
import {
  sendBookingConfirmationEmail,
  sendMonthlyChargeEmail,
} from "../controllers/emailController.js"; // Import email functions
import { getPaypalAccessToken } from "../controllers/paypalController.js";
import axios from "axios";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

const router = express.Router();

// Route to create PayPal payment
router.post("/create", createPaypalPayment);

// Route to capture PayPal payment after the user approves it
router.post("/capture", capturePaypalPayment);

// Route to cancel PayPal payment
router.post("/cancel", cancelPaypalPayment);

// Route to issue PayPal refund
router.post("/refund", refundPaypalPayment); // New route to handle refund request

// Route to handle PayPal webhooks
router.post("/webhook", async (req, res) => {
  console.log("🚀 WEBHOOK HIT!");

  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const isValid = await verifyPaypalWebhook(req, webhookId);

    if (!isValid) {
      console.error("❌ Invalid Webhook Signature.");
      return res.status(400).send("Verification Failed");
    }

    const event = JSON.parse(req.body.toString());
    console.log("✅ Verified Event:", event.event_type);

    // STEP A: If User Approves, but Controller hasn't hit yet, move the money
    if (event.event_type === "CHECKOUT.ORDER.APPROVED") {
      const orderId = event.resource.id;
      const accessToken = await getPaypalAccessToken();

      console.log("💸 Auto-capturing funds for approved order:", orderId);

      try {
        await axios.post(
          `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (capErr) {
        // If it's already captured, we don't care, just proceed
        console.log("Capture already initiated by Controller.");
      }
    }

    // STEP B: Final source of truth - update DB and notify user
    // --- STEP B: FINALIZE COMPLETED CAPTURES ---
if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
  const orderId = event.resource.supplementary_data?.related_ids?.order_id || 
                 (event.links?.find(l => l.rel === "up")?.href.split("/").pop());

  const captureId = event.resource.id;

  console.log("💰 Capture Completed. Updating DB for Order:", orderId);

  const updatedBooking = await Booking.findOneAndUpdate(
    { 
      paypalOrderId: orderId, 
      status: { $ne: "Confirmed" } 
    },
    {
      status: "Confirmed",
      paymentStatus: "Completed",
      paymentTransactionId: captureId,
      captureId: captureId,
      $unset: { holdExpiration: "" } 
    },
    { new: true }
  ).populate("listing").populate("user"); // ⚡ Crucial: populates user email

  if (updatedBooking) {
    try {
      // 1. Get Payer Email from PayPal's event data
      const payerEmail = event.resource.payer?.email_address || updatedBooking.user?.email;
      
      // 2. Get Account Email from your Database (populated above)
      const userEmail = updatedBooking.user?.email;

      console.log(`📧 Sending confirmation to Payer: ${payerEmail} and User: ${userEmail}`);

      await sendBookingConfirmationEmail(
        payerEmail, 
        userEmail, 
        updatedBooking, 
        updatedBooking.listing
      );
      
      console.log("🎉 Webhook process complete.");
    } catch (emailErr) {
      console.error("❌ Email failed:", emailErr.message);
    }
  }
}

    res.status(200).send("Webhook Handled");
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.status(200).send("Error");
  }
});
// Route to save PayPal transaction and send emails
router.post("/transactions", async (req, res) => {
  console.log("req", req);

  const { orderId, payerEmail, amount, approvalLink, status, payerName } =
    req.body;

  // Create a new PaypalTransaction document
  const transaction = new PaypalTransaction({
    orderId,
    payerEmail,
    payerName,
    amount,
    approvalLink,
    status,
  });

  try {
    // Save the transaction in the database
    await transaction.save();
    console.log("Transaction saved successfully");

    // Check if it's a monthly charge or a booking transaction
    if (status === "COMPLETED") {
      // If the transaction is a monthly charge, send the charge confirmation email
      await sendMonthlyChargeEmail(
        payerEmail,
        "selahsprings48@gmail.com",
        payerName,
        amount,
        orderId,
        new Date()
      );

      // If it's a booking-related payment (you can add conditions based on your app's logic)
      // Example: You might want to send booking confirmation for certain transaction types
      // await sendBookingConfirmationEmail(payerEmail, 'selahsprings48@gmail.com', {
      //   name: payerName,
      //   subtotal: amount,
      //   tax: 0,
      //   totalPrice: amount,
      //   paymentTransactionId: orderId
      // }, { title: "Selah Springs Lodge", location: "Colorado Springs" });
    }

    res
      .status(200)
      .json({ message: "Transaction saved and emails sent successfully" });
  } catch (error) {
    console.error("Error saving PayPal transaction:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route to fetch PayPal transactions
router.get("/transactions", async (req, res) => {
  try {
    const transactions = await PaypalTransaction.find();
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching PayPal transactions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
