import express from "express";
import {
  createPaypalPayment,
  capturePaypalPayment,
  cancelPaypalPayment,
  refundPaypalPayment,
} from "../controllers/paypalController.js";
import { verifyPaypalWebhook } from "../utils/paypalUtils.js";
import PaypalTransaction from "../models/PaypalTransaction.js";
import { sendBookingConfirmationEmail, sendMonthlyChargeEmail } from "../controllers/emailController.js"; // Import email functions

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
  const webhookId = process.env.PAYPAL_WEBHOOK_ID; // Your PayPal Webhook ID
  const success = await verifyPaypalWebhook(req, webhookId);

  if (success) {
    res.status(200).send("Webhook verified successfully");
  } else {
    res.status(400).send("Webhook verification failed");
  }
});

// Route to save PayPal transaction and send emails
router.post("/transactions", async (req, res) => {
  console.log('req',req);
  
  const { orderId, payerEmail, amount, approvalLink, status, payerName } = req.body;

  // Create a new PaypalTransaction document
  const transaction = new PaypalTransaction({
    orderId,
    payerEmail,
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
      await sendMonthlyChargeEmail(payerEmail, 'collinsfrontend@gmail.com', payerName, amount, orderId, new Date());

      // If it's a booking-related payment (you can add conditions based on your app's logic)
      // Example: You might want to send booking confirmation for certain transaction types
      await sendBookingConfirmationEmail(payerEmail, 'collinsfrontend@gmail.com', { 
        name: payerName, 
        subtotal: amount, 
        tax: 0, // You can adjust this based on your app's calculation
        totalPrice: amount, 
        paymentTransactionId: orderId 
      }, { title: "Selah Springs Lodge", location: "Colorado Springs" });
    }

    res.status(200).json({ message: "Transaction saved and emails sent successfully" });
  } catch (error) {
    console.error("Error saving PayPal transaction:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
