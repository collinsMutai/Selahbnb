import axios from 'axios';

export const verifyPaypalWebhook = async (req, webhookId) => {
  const { headers } = req;
  
  // Ensure that the raw body exists
  const rawBody = req.body ? req.body.toString('utf-8') : null;

  if (!rawBody) {
    console.error('Request body is missing');
    return false;
  }

  // Extract necessary headers
  const transmissionId = headers['paypal-transmission-id'];
  const transmissionTime = headers['paypal-transmission-time'];
  const certUrl = headers['paypal-cert-url'];
  const authAlgo = headers['paypal-auth-algo'];
  const transmissionSig = headers['paypal-transmission-sig'];

  // Construct the payload for signature verification
  const verificationPayload = {
    transmission_id: transmissionId,
    transmission_time: transmissionTime,
    cert_url: certUrl,
    auth_algo: authAlgo,
    transmission_sig: transmissionSig,
    webhook_id: webhookId,
    webhook_event: JSON.parse(rawBody), // The raw body from the webhook
  };

  // Prepare the request to PayPal for signature verification
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  try {
    const tokenRes = await axios.post(
      'https://api-m.sandbox.paypal.com/v1/oauth2/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = tokenRes.data.access_token;

    const response = await axios.post(
      'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature',
      verificationPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('Error verifying webhook signature:', error.response?.data || error.message);
    return false;
  }
};
