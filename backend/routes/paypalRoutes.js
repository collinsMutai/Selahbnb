import express from "express";
import Booking from "../models/Booking.js";
import { createPaypalPayment, refundPaypalPayment } from "../controllers/paypalController.js";
import { verifyPaypalWebhook } from "../utils/paypalUtils.js"; // Assuming this handles signature verification
import { sendBookingConfirmationEmail, sendBookingFailedEmail } from "../controllers/emailController.js";
import axios from 'axios';

const router = express.Router();

// Middleware to preserve the raw body for signature verification
router.post("/create", createPaypalPayment);

// POST /refund route
router.post("/refund", async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate("listing", "title location");
    if (!booking || !booking.paypalOrderId) {
      return res.status(404).json({ message: "Booking not refundable" });
    }

    // Call the refund function (assumes it exists in your controller)
    await refundPaypalPayment({ orderId: booking.paypalOrderId });
    await sendBookingFailedEmail(
      booking.user.email,
      booking.user.email,
      booking,
      booking.listing,
      "Your payment has been refunded."
    );
    res.json({ message: "Refund successful", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Refund failed" });
  }
});

// POST /webhook route for processing PayPal webhook events
// POST /webhook route for processing PayPal webhook events
router.post('/webhook', async (req, res) => {
  try {
    // Log the raw body to verify PayPal order ID
    console.log("Raw Webhook Body: ", req.body ? req.body.toString() : "No raw body received");

    // Check if rawBody is still undefined
    if (!req.body) {
      return res.status(400).json({ message: "No raw body received" });
    }

    // Parse the raw body to JSON format
    const body = JSON.parse(req.body.toString());
    console.log("Parsed Webhook Body: ", body);

    // Extract key values from the resource object in the webhook
    const paypalOrderId = body.resource.id;  // PayPal order ID (Capture ID)
    const orderId = body.resource.supplementary_data.related_ids.order_id;  // System's order ID
    const paymentStatus = body.resource.status;  // Payment status (COMPLETED, etc.)
    const amountPaid = body.resource.amount.value;  // Amount paid
    console.log("PayPal Order ID: ", paypalOrderId);
    console.log("Order ID: ", orderId);
    console.log("Payment Status: ", paymentStatus);
    console.log("Amount Paid: ", amountPaid);

    // Check if you're in a testing environment (webhook simulator)
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
      console.log("Simulator Mode: Skipping booking lookup since it's a simulated webhook event.");
      
      // Skip the booking lookup in simulation and just process the event
      // You can still handle the event (e.g., log, send emails, etc.)
      return res.status(200).send("Webhook processed successfully (Simulator Mode)");
    }

    // In real mode, find the booking using the PayPal order ID (if real bookings exist in your system)
    // const booking = await Booking.findOne({ paypalOrderId: paypalOrderId });

    // If no booking is found, log and return a response (in a real setup, not in simulation)
    // if (!booking) {
    //   console.log(`Booking not found for PayPal order ID: ${paypalOrderId}`);
    //   return res.status(404).json({ message: `Booking not found for PayPal order ID: ${paypalOrderId}` });
    // }

    // Process PAYMENT.CAPTURE.COMPLETED event (if event type matches)
    if (body.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      // Since we're not looking up a real booking, let's process as if we're updating a booking
      console.log("Simulating booking update for PayPal Order ID:", paypalOrderId);
      // Log payment info (or do other actions, like sending a confirmation email)
      console.log(`Payment Status: ${paymentStatus}, Amount Paid: ${amountPaid}`);

      // For simulation purposes, you can log these details or take other actions as needed
      console.log("Simulated booking details:", {
        paypalOrderId,
        orderId,
        paymentStatus,
        amountPaid,
      });

      // If you were to send an email or trigger another action, it could be done here:
      // await sendBookingConfirmationEmail(userEmail, bookingDetails);
    }

    // Return a successful response
    res.status(200).send("Webhook processed successfully (Simulator Mode)");

  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Internal Server Error");
  }
});








export default router;
