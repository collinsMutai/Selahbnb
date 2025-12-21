import axios from 'axios';

export const verifyPaypalWebhook = async (req, webhookId) => {
  const { headers } = req;
  
  // 1. Convert the Buffer back to a string for the verification API
  const rawBody = req.body.toString('utf-8');

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const tokenRes = await axios.post(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenRes.data.access_token;

    // 2. The payload MUST use the raw string, and headers must be present
    const verificationPayload = {
      transmission_id: headers['paypal-transmission-id'],
      transmission_time: headers['paypal-transmission-time'],
      cert_url: headers['paypal-cert-url'],
      auth_algo: headers['paypal-auth-algo'],
      transmission_sig: headers['paypal-transmission-sig'],
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody) // PayPal expects the event object here
    };

    const response = await axios.post(
      "https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature",
      verificationPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.verification_status === "SUCCESS";
  } catch (error) {
    // If headers are missing (Simulator issue), this catch block triggers
    console.error("Webhook verification error:", error.response?.data || error.message);
    return false;
  }
};