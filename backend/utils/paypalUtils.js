import axios from 'axios';
import crypto from 'crypto';

// Function to verify PayPal webhook signature
export const verifyPaypalWebhook = async (body, signature, timestamp, webhookId) => {
  const verificationUrl = `https://api.paypal.com/v1/notifications/verify-webhook-signature`;
  const payload = JSON.stringify(body);

  const signaturePayload = {
    transmission_id: body.id,
    transmission_time: timestamp,
    cert_url: body.resource.cert_url,
    webhook_id: webhookId,
    webhook_event: payload,
  };

  // Create a signature using PayPal's algorithm (SHA256 with HMAC)
  const generatedSignature = crypto
    .createHmac('sha256', process.env.PAYPAL_CLIENT_SECRET)
    .update(JSON.stringify(signaturePayload))
    .digest('hex');

  return generatedSignature === signature;
};
