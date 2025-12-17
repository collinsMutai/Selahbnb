import axios from "axios";
import { getPaypalAccessToken } from "../controllers/paypalController.js";

// Function to verify the PayPal webhook signature
export const verifyPaypalWebhook = async (rawBody, headers, webhookId) => {
  try {
    // Get the PayPal access token
    const accessToken = await getPaypalAccessToken();

    // Log the raw body and headers for debugging
    console.log("Received Raw Webhook Body:", rawBody.toString());
    console.log("Received Headers:", headers);

    // Prepare the data for signature verification
    const data = {
      auth_algo: headers["paypal-auth-algo"], // Signature algorithm used
      cert_url: headers["paypal-cert-url"],   // Certificate URL
      transmission_id: headers["paypal-transmission-id"], // Transmission ID
      transmission_sig: headers["paypal-transmission-sig"], // The transmission signature
      transmission_time: headers["paypal-transmission-time"], // Timestamp of the transmission
      webhook_id: webhookId, // Your PayPal Webhook ID from the dashboard
      webhook_event: rawBody.toString(),  // Send the raw body directly
    };

    // Send a POST request to PayPal's webhook signature verification endpoint
    const response = await axios.post(
      "https://api.sandbox.paypal.com/v1/notifications/verify-webhook-signature", 
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Pass the access token to PayPal
          "Content-Type": "application/json", // Set Content-Type to application/json
        },
      }
    );

    // Check the verification status
    if (response.data.verification_status === "SUCCESS") {
      console.log("Webhook verification succeeded.");
      return true;
    } else {
      console.error("Webhook verification failed:", response.data);
      return false;
    }
  } catch (error) {
    console.error("Error verifying PayPal webhook:", error);

    // Log the full error response if available
    if (error.response) {
      console.error("PayPal verification error response:", error.response.data);
    }

    return false;
  }
};
