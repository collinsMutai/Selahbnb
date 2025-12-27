import paypal from "@paypal/checkout-server-sdk";
import axios from "axios";
import Listing from "../models/Listing.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { sendBookingConfirmationEmail } from "./emailController.js";
import dotenv from "dotenv";
dotenv.config();

// Initialize PayPal environment
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

// Cache for storing the access token and its expiry time
let cachedAccessToken = null;
let tokenExpiry = 0;

// Function to get PayPal access token
export const getPaypalAccessToken = async () => {
  if (cachedAccessToken && Date.now() < tokenExpiry) {
    return cachedAccessToken; // Return cached token if still valid
  }

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const response = await axios.post(
      "https://api.sandbox.paypal.com/v1/oauth2/token", // Sandbox for testing, switch to live for production
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    cachedAccessToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000; // Token expiration time in ms
    return cachedAccessToken;
  } catch (error) {
    console.error("Error getting PayPal access token:", error);
    throw new Error("Failed to obtain access token");
  }
};


export const createPaypalPayment = async (req) => {
  const { bookingId, totalPrice } = req.body;

  try {
    const accessToken = await getPaypalAccessToken();
    const request = new paypal.orders.OrdersCreateRequest();
    request.headers["Authorization"] = `Bearer ${accessToken}`;
    
    // Construct dynamic return URL with bookingId for the frontend Success Page
    const dynamicReturnUrl = `${process.env.return_url}?bookingId=${bookingId}`;

    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [{
        amount: { 
          currency_code: "USD", 
          value: totalPrice.toString() 
        },
        // Adding custom_id helps identify the booking in webhooks even if DB is slow
        custom_id: bookingId 
      }],
      application_context: {
        return_url: dynamicReturnUrl, // Now includes ?bookingId=...
        cancel_url: process.env.cancel_url,
        user_action: "PAY_NOW" 
      },
    });

    const response = await client.execute(request);
    
    // Link PayPal Order ID to the Booking immediately
    await Booking.findByIdAndUpdate(bookingId, { 
      paypalOrderId: response.result.id 
    });

    const approvalLink = response.result.links.find(l => l.rel === "approve").href;
    
    return { 
      status: 200, 
      data: { approvalLink, orderId: response.result.id } 
    };
  } catch (error) {
    console.error("PayPal Create Error:", error);
    return { status: 500, message: error.message };
  }
};
// Capture the PayPal payment (after the user completes the payment)
export const capturePaypalPayment = async (req, res) => {
  const { orderId } = req.body;
  console.log("📡 Frontend Sync/Capture for Order:", orderId);

  try {
    const accessToken = await getPaypalAccessToken();

    // 1. Get latest status from PayPal
    const orderDetails = await axios.get(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const paypalStatus = orderDetails.data.status;

    // 2. If already COMPLETED (maybe the webhook beat the controller)
    if (paypalStatus === "COMPLETED") {
      const booking = await Booking.findOneAndUpdate(
        { paypalOrderId: orderId },
        { status: "Confirmed", paymentStatus: "Completed" },
        { new: true }
      ).populate("listing");

      return res.status(200).json({ message: "Already Processed", booking });
    }

    // 3. If APPROVED, move the money now (The Ecommerce Way)
    if (paypalStatus === "APPROVED") {
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.headers["Authorization"] = `Bearer ${accessToken}`;
      
      const response = await client.execute(request);
      
      const booking = await Booking.findOneAndUpdate(
        { paypalOrderId: orderId },
        {
          status: "Confirmed",
          paymentStatus: "Completed",
          paymentTransactionId: response.result.purchase_units[0].payments.captures[0].id
        },
        { new: true }
      ).populate("listing");

      return res.status(200).json({ message: "Payment Captured", booking });
    }

    res.status(400).json({ message: `Order is in ${paypalStatus} state.` });

  } catch (error) {
    // 4. Guard against double-capture race conditions
    if (error.statusCode === 422 || error.message?.includes("ORDER_ALREADY_CAPTURED")) {
      const booking = await Booking.findOne({ paypalOrderId: orderId }).populate("listing");
      return res.status(200).json({ message: "Success (Handled by Webhook)", booking });
    }
    
    console.error("Capture Controller Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Cancel the PayPal payment (if the user decides to cancel)
export const cancelPaypalPayment = async (req, res) => {
  const { orderId } = req.body;

  try {
    const accessToken = await getPaypalAccessToken();

    // Currently, PayPal doesn't support direct "cancel" API calls, but we can handle cancellations manually
    const request = new paypal.orders.OrdersCancelRequest(orderId);
    request.headers["Authorization"] = `Bearer ${accessToken}`;

    await client.execute(request);

    // Find and update the booking status to 'Cancelled'
    const booking = await Booking.findOne({ paymentTransactionId: orderId });

    if (booking) {
      booking.status = "Cancelled";
      await booking.save();
      res.status(200).json({ message: "Payment canceled successfully" });
    } else {
      res.status(404).json({ message: "Booking not found for cancellation" });
    }
  } catch (error) {
    console.error("Error canceling PayPal payment:", error);
    res.status(500).json({ message: "Error canceling PayPal payment" });
  }
};

// Issue a refund for a PayPal payment
export const refundPaypalPayment = async (req, res) => {
  const { bookingId } = req.body;

  try {
    // Step 1: Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.paymentStatus !== "Completed") {
      return res.status(400).json({ message: "Payment not completed or already refunded" });
    }

    // Step 2: Get the PayPal capture ID from the booking (use the capture ID from the payment transaction)
    const captureId = booking.captureId; // Use the stored capture ID

    // Step 3: Get the PayPal access token
    const accessToken = await getPaypalAccessToken();

    // Step 4: Verify the capture exists and is completed
    const captureStatusRequest = new paypal.payments.CapturesGetRequest(captureId);
    captureStatusRequest.headers["Authorization"] = `Bearer ${accessToken}`;
    const captureStatusResponse = await client.execute(captureStatusRequest);
    const captureStatus = captureStatusResponse.result.status;

    if (captureStatus !== "COMPLETED") {
      return res.status(400).json({ message: "Capture not completed or already refunded" });
    }

    // Step 5: Create the refund request
    const refundRequest = new paypal.payments.CapturesRefundRequest(captureId);
    refundRequest.headers["Authorization"] = `Bearer ${accessToken}`;
    refundRequest.requestBody({
      amount: {
        value: booking.totalPrice.toString(),
        currency_code: "USD",
      },
    });

    // Step 6: Execute the refund request
    const refundResponse = await client.execute(refundRequest);
    if (refundResponse.result.status !== "COMPLETED") {
      return res.status(400).json({ message: "Failed to refund the payment" });
    }

    // Step 7: Update booking status to 'Refunded'
    booking.status = "Cancelled";
    booking.paymentStatus = "Refunded";
    await booking.save();

    res.status(200).json({
      message: "Payment refunded successfully",
      booking,
    });
  } catch (error) {
    console.error("Error issuing PayPal refund:", error);
    res.status(500).json({ message: "Error issuing PayPal refund" });
  }
};
