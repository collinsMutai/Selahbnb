import paypal from "@paypal/checkout-server-sdk";
import Booking from "../models/Booking.js";
import dotenv from "dotenv";
import axios from "axios";

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
  try {
    const { bookingId, totalPrice } = req.body;

    if (!totalPrice) {
      throw new Error("Invalid totalPrice");
    }

    // Get PayPal access token (if required)
    const accessToken = await getPaypalAccessToken();

    // Set up the PayPal payment request
    const requestBody = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD", // Adjust to your currency
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

    // Add access token to authorization header
    request.headers["Authorization"] = `Bearer ${accessToken}`;

    // Execute the PayPal API call
    const paypalResponse = await client.execute(request);

    // Log the full PayPal response to inspect the links
    console.log("PayPal Response:", paypalResponse);

    // Check if response contains the expected properties
    if (paypalResponse.result && paypalResponse.result.status === "CREATED") {
      // Log the links array to understand its structure
      console.log("PayPal Response Links:", paypalResponse.result.links);

      // Find the link with rel === 'approve' (or 'approval_url')
      const approvalLinkObj = paypalResponse.result.links.find(
        (link) => link.rel === "approve" || link.rel === "approval_url"
      );

      if (approvalLinkObj) {
        return {
          status: 200,
          data: {
            approvalLink: approvalLinkObj.href, // Extract the approval link from the response
            orderId: paypalResponse.result.id,
          },
        };
      } else {
        console.error("No approval link found in PayPal response");
        return {
          status: 500,
          message: "No approval link found in PayPal response",
        };
      }
    } else {
      console.error("Unexpected PayPal response:", paypalResponse);
      return { status: 500, message: "Error processing PayPal payment" };
    }
  } catch (error) {
    console.error("Error creating PayPal payment:", error);
    return { status: 500, message: "Error creating PayPal payment" };
  }
};

// Capture the PayPal payment (after the user completes the payment)
export const capturePaypalPayment = async (req, res) => {
  const { orderId } = req.body; // Order ID returned from PayPal

  try {
    const accessToken = await getPaypalAccessToken();

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.headers["Authorization"] = `Bearer ${accessToken}`;

    const captureResponse = await client.execute(request);

    // Find the booking based on the PayPal order reference (assuming you store it)
    const booking = await Booking.findOne({
      paypalOrderId: orderId,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update booking status to 'Confirmed' and save the payment details
    booking.status = "Confirmed";
    booking.paymentStatus = "Completed";
    booking.paymentTransactionId =
      captureResponse.result.purchase_units[0].payments.captures[0].id;
    booking.paymentAmount =
      captureResponse.result.purchase_units[0].payments.captures[0].amount.value;
    booking.payerEmail = captureResponse.result.payer.email_address;

    await booking.save();

    res.status(200).json({ message: "Payment successfully captured", booking });
  } catch (error) {
    console.error("Error capturing PayPal payment:", error);
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
