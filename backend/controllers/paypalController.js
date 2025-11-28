import paypal from "@paypal/checkout-server-sdk";
import axios from "axios";
import Listing from "../models/Listing.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { sendBookingConfirmationEmail } from './emailController.js';
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
const getPaypalAccessToken = async () => {
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

// Create a PayPal payment (this generates the PayPal payment link)
export const createPaypalPayment = async (req) => {
  const { bookingId, totalPrice, returnUrl } = req.body;

  try {
    const accessToken = await getPaypalAccessToken();

    // Set up the PayPal payment request
    const requestBody = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: totalPrice.toString(), // Convert totalPrice to string
          },
        },
      ],
      application_context: {
        return_url: `http://localhost:3000/paypalpayment/success`,
        cancel_url: `http://localhost:3000/paypalpayment/cancel`,
      },
    };

    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody(requestBody);
    request.headers["Authorization"] = `Bearer ${accessToken}`;

    const paypalResponse = await client.execute(request);

    // Check if response contains the expected properties
    if (paypalResponse.result && paypalResponse.result.status === "CREATED") {
      // Extract the approval link
      const approvalLinkObj = paypalResponse.result.links.find(
        (link) => link.rel === "approve" || link.rel === "approval_url"
      );

      if (approvalLinkObj) {
        return {
          status: 200,
          data: {
            approvalLink: approvalLinkObj.href,
            orderId: paypalResponse.result.id, // Save PayPal Order ID for later use
          },
        };
      } else {
        return {
          status: 500,
          message: "No approval link found in PayPal response",
        };
      }
    } else {
      return { status: 500, message: "Error processing PayPal payment" };
    }
  } catch (error) {
    console.error("Error creating PayPal payment:", error);
    return { status: 500, message: "Error creating PayPal payment" };
  }
};

// Capture the PayPal payment (after the user completes the payment)
export const capturePaypalPayment = async (req, res) => {
  const { orderId, payerId } = req.body;

  console.log("Received capturePaypalPayment request", orderId, payerId);  // Log when the function is called

  try {
    // Step 1: Get the access token to interact with PayPal API
    const accessToken = await getPaypalAccessToken();
    console.log("Access token obtained:", accessToken);  // Log access token retrieval

    // Step 2: Check if the PayPal payment was approved
    const statusRequest = new paypal.orders.OrdersGetRequest(orderId);
    statusRequest.headers["Authorization"] = `Bearer ${accessToken}`;
    const statusResponse = await client.execute(statusRequest);
    console.log("PayPal payment status response:", statusResponse);  // Log PayPal status response

    if (statusResponse.result.status !== "APPROVED") {
      return res.status(400).json({ message: "Payment not approved" });
    }

    // Step 3: Find the booking associated with the PayPal order ID
    const booking = await Booking.findOne({ paypalOrderId: orderId });
    console.log("Booking found:", booking);  // Log the booking

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Step 4: Check if the booking payment was already processed
    if (booking.paymentStatus === "Completed") {
      return res.status(400).json({ message: "Payment already processed" });
    }

    // Step 5: Capture the payment from PayPal
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId);
    captureRequest.headers["Authorization"] = `Bearer ${accessToken}`;
    const captureResponse = await client.execute(captureRequest);
    console.log("Capture payment response:", captureResponse);  // Log payment capture response

    // Step 6: Ensure the capture response is valid
    if (!captureResponse.result || !captureResponse.result.purchase_units) {
      return res.status(500).json({ message: "Failed to capture payment" });
    }

    // Step 7: Update the booking with payment details
    booking.status = "Confirmed"; // Change booking status to 'Confirmed'
    booking.paymentStatus = "Completed"; // Set payment status to 'Completed'
    booking.paymentAmount = captureResponse.result.purchase_units[0].payments.captures[0].amount.value; // Store the captured amount
    booking.payerEmail = captureResponse.result.payer.email_address; // Store the payer's email
    booking.paymentTransactionId = captureResponse.result.id; // Store the transaction ID

    console.log("Booking status updated:", booking);  // Log before saving the booking

    // Step 8: Save the updated booking
    const updatedBooking = await booking.save();
    console.log("Booking saved:", updatedBooking);  // Log after saving the booking

    // Step 9: Populate the listing information
    await updatedBooking.populate("listing"); // Populate the `listing` field with the full listing details

    // Step 10: Get the user's email (from the booking's user field)
    const user = await User.findById(booking.user); // Get the user details
    const userEmail = user.email; // User email

    // Step 11: Send a confirmation email to the payer's email and user's email
    setImmediate(async () => {
      try {
        console.log("Sending confirmation email to payer:", updatedBooking.payerEmail); // Log before sending the email
        await sendBookingConfirmationEmail(updatedBooking.payerEmail, userEmail, updatedBooking, updatedBooking.listing);
        console.log("Email sent to payer successfully.");
      } catch (emailError) {
        console.error("Error sending email to payer:", emailError);  // Log email sending failure
      }
    });

    // Step 12: Respond with success and the updated booking data
    res.status(200).json({ message: "Payment successfully captured", booking: updatedBooking });

  } catch (error) {
    console.error("Error in capturing PayPal payment:", error);  // Log error in try-catch block
    res.status(500).json({ message: "Error capturing PayPal payment" });
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
