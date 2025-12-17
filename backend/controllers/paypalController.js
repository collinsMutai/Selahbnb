import paypal from "@paypal/checkout-server-sdk";
import Booking from "../models/Booking.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const IS_LIVE = process.env.PAYPAL_MODE === "live";
const PAYPAL_BASE_URL = IS_LIVE
  ? "https://api.paypal.com"
  : "https://api.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = IS_LIVE
  ? process.env.PAYPAL_LIVE_CLIENT_ID
  : process.env.PAYPAL_SANDBOX_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = IS_LIVE
  ? process.env.PAYPAL_LIVE_CLIENT_SECRET
  : process.env.PAYPAL_SANDBOX_CLIENT_SECRET;

const environment = IS_LIVE
  ? new paypal.core.LiveEnvironment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
  : new paypal.core.SandboxEnvironment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET);
const client = new paypal.core.PayPalHttpClient(environment);

let cachedAccessToken = null;
let tokenExpiry = 0;

export const getPaypalAccessToken = async () => {
  if (cachedAccessToken && Date.now() < tokenExpiry) return cachedAccessToken;

  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  const res = await axios.post(
    `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  cachedAccessToken = res.data.access_token;
  tokenExpiry = Date.now() + res.data.expires_in * 1000;
  return cachedAccessToken;
};

export const createPaypalPayment = async ({ body }) => {
  const { bookingId, totalPrice } = body;
  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: bookingId,
        amount: { currency_code: "USD", value: totalPrice.toFixed(2) },
      },
    ],
    application_context: {
      return_url: process.env.RETURN_URL,
      cancel_url: process.env.CANCEL_URL,
    },
  });

  const response = await client.execute(request);
  const approvalLink = response.result.links.find(
    (l) => l.rel === "approve"
  )?.href;
  if (!approvalLink) throw new Error("No PayPal approval link found");
  return { data: { orderId: response.result.id, approvalLink } };
};

export const refundPaypalPayment = async ({ orderId }) => {
  const booking = await Booking.findOne({ paypalOrderId: orderId });
  if (!booking) throw new Error("Booking not refundable");

  const accessToken = await getPaypalAccessToken();
  const capturesRes = await axios.get(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const captureId =
    capturesRes.data.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  if (!captureId) throw new Error("Capture ID not found");

  const refundReq = new paypal.payments.CapturesRefundRequest(captureId);
  refundReq.requestBody({
    amount: { value: booking.totalPrice.toFixed(2), currency_code: "USD" },
  });
  await client.execute(refundReq);

  booking.status = "CANCELLED";
  booking.paymentStatus = "REFUNDED";
  await booking.save();
  return booking;
};
