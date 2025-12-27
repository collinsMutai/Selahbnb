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
  const event = JSON.parse(req.body.toString());
  console.log("✅ Event Type:", event.event_type);

  try {
    // 1. HANDLE APPROVAL: This is where we tell PayPal to capture the funds
    if (event.event_type === "CHECKOUT.ORDER.APPROVED") {
      const orderId = event.resource.id;
      console.log("Order Approved! Triggering Capture for ID:", orderId);

      // Get your access token (ensure this helper is imported)
      const accessToken = await getPaypalAccessToken();

      // 🚀 THIS CALL TRIGGERS THE 'PAYMENT.CAPTURE.COMPLETED' WEBHOOK
      await axios.post(
        `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
        {}, // Empty body required
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "PayPal-Request-Id": orderId, // Helps prevent accidental double-captures
          },
        }
      );

      console.log("Capture command sent to PayPal.");
    }

    // 2. HANDLE COMPLETION: This is where we update our database
    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const orderId =
        event.resource.supplementary_data?.related_ids?.order_id ||
        event.resource.parent_payment ||
        (event.links &&
          event.links
            .find((l) => l.rel === "up")
            ?.href.split("/")
            .pop());

      console.log("💰 Payment Captured for Order:", orderId);

      // Only update if it's NOT already confirmed to prevent double-processing
      const updatedBooking = await Booking.findOneAndUpdate(
        { paypalOrderId: orderId, status: { $ne: "Confirmed" } },
        {
          status: "Confirmed",
          paymentStatus: "Completed",
          paymentTransactionId: event.resource.id,
        },
        { new: true }
      );

      if (updatedBooking) {
        console.log("🎉 Booking confirmed in Database.");
      } else {
        // Check if it was already confirmed or truly missing
        const alreadyConfirmed = await Booking.findOne({
          paypalOrderId: orderId,
          status: "Confirmed",
        });
        if (alreadyConfirmed) {
          console.log(
            "ℹ️ Webhook received, but booking was already confirmed."
          );
        } else {
          console.log("⚠️ Order ID not found in any booking record:", orderId);
        }
      }
    }

    // Always send 200 to PayPal so they stop retrying the webhook
    res.status(200).send("Webhook Handled");
  } catch (err) {
    // Log detailed error info if it's an Axios error from the capture call
    console.error("Webhook Logic Error:", err.response?.data || err.message);
    res.status(500).send("Internal Server Error");
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
