import express from "express";
import {
  createPaypalPayment,
  capturePaypalPayment,
  cancelPaypalPayment,
  refundPaypalPayment,
} from "../controllers/paypalController.js";
import { verifyPaypalWebhook } from "../utils/paypalUtils.js";
import PaypalTransaction from "../models/PaypalTransaction.js";

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
// Handle payment completion
const handlePaymentCompleted = async (paymentData) => {
  const { transaction_id, amount, payer } = paymentData;

  const booking = await Booking.findOne({
    paymentTransactionId: transaction_id,
  });

  if (booking) {
    if (booking.paymentStatus === "Completed") {
      console.log(
        `Payment already processed for transaction: ${transaction_id}`
      );
      return;
    }

    booking.status = "Confirmed";
    booking.paymentStatus = "Completed";
    booking.paymentAmount = amount.total;
    booking.payerEmail = payer.payer_info.email;

    await booking.save();
    console.log(`Payment confirmed for transaction: ${transaction_id}`);
  } else {
    console.log(`Booking not found for transaction: ${transaction_id}`);
  }
};

// Handle pending payment
const handlePaymentPending = async (paymentData) => {
  const { transaction_id } = paymentData;

  const booking = await Booking.findOne({
    paymentTransactionId: transaction_id,
  });

  if (booking) {
    if (booking.status === "Pending") {
      console.log(
        `Payment already marked as Pending for transaction: ${transaction_id}`
      );
      return;
    }

    booking.status = "Pending";
    await booking.save();
    console.log(`Payment pending for transaction: ${transaction_id}`);
  }
};

// Handle refunded payment (this is triggered by the webhook)
const handlePaymentRefunded = async (paymentData) => {
  const { transaction_id } = paymentData;

  const booking = await Booking.findOne({
    paymentTransactionId: transaction_id,
  });

  if (booking) {
    if (booking.status === "Refunded") {
      console.log(
        `Payment already refunded for transaction: ${transaction_id}`
      );
      return;
    }

    booking.status = "Refunded";
    await booking.save();
    console.log(`Payment refunded for transaction: ${transaction_id}`);
  }
};

// Handle denied payment
const handlePaymentDenied = async (paymentData) => {
  const { transaction_id } = paymentData;

  const booking = await Booking.findOne({
    paymentTransactionId: transaction_id,
  });

  if (booking) {
    if (booking.status === "Denied") {
      console.log(`Payment already denied for transaction: ${transaction_id}`);
      return;
    }

    booking.status = "Denied";
    await booking.save();
    console.log(`Payment denied for transaction: ${transaction_id}`);
  }
};

// Route to save PayPal transaction
router.post("/transactions", async (req, res) => {
  const { orderId, payerEmail, amount, approvalLink, status } = req.body;

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
    res.status(200).json({ message: "Transaction saved successfully" });
  } catch (error) {
    console.error("Error saving PayPal transaction:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
