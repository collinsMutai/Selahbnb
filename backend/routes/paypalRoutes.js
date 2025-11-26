import express from 'express';
import { createPaypalPayment, capturePaypalPayment, cancelPaypalPayment } from '../controllers/paypalController.js';
import { verifyPaypalWebhook } from '../utils/paypalUtils.js';

const router = express.Router();

// Route to create PayPal payment
router.post('/create', createPaypalPayment);

// Route to capture PayPal payment after the user approves it
router.post('/capture', capturePaypalPayment);

// Route to cancel PayPal payment
router.post('/cancel', cancelPaypalPayment);

// Route to handle PayPal webhooks
router.post('/webhook', async (req, res) => {
  const body = req.body;
  const signature = req.headers['paypal-transmission-sig'];
  const timestamp = req.headers['paypal-transmission-time'];
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  // Verify PayPal webhook
  const isVerified = await verifyPaypalWebhook(body, signature, timestamp, webhookId);

  if (!isVerified) {
    return res.status(400).json({ message: 'Invalid PayPal webhook' });
  }

  try {
    const event = body.event_type;

    // Handle different PayPal events
    switch (event) {
      case 'PAYMENT.SALE.COMPLETED':
        // Handle completed payment
        await handlePaymentCompleted(body.resource);
        break;
      case 'PAYMENT.SALE.PENDING':
        // Handle pending payment
        await handlePaymentPending(body.resource);
        break;
      case 'PAYMENT.SALE.REFUNDED':
        // Handle refunded payment
        await handlePaymentRefunded(body.resource);
        break;
      case 'PAYMENT.SALE.DENIED':
        // Handle denied payment
        await handlePaymentDenied(body.resource);
        break;
      default:
        console.log(`Unhandled PayPal event: ${event}`);
        break;
    }

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    res.status(500).json({ message: 'Error processing PayPal webhook' });
  }
});

// Handle payment completion
// Handle payment completion
const handlePaymentCompleted = async (paymentData) => {
  const { transaction_id, amount, payer } = paymentData;

  // Check if the payment transaction already exists in the booking database
  const booking = await Booking.findOne({ paymentTransactionId: transaction_id });

  if (booking) {
    // If the booking is already confirmed or processed, skip it
    if (booking.paymentStatus === 'Completed') {
      console.log(`Payment already processed for transaction: ${transaction_id}`);
      return;  // Prevent duplicate processing
    }

    // Otherwise, update the booking status to 'Confirmed' and mark payment as completed
    booking.status = 'Confirmed';
    booking.paymentStatus = 'Completed';
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

  const booking = await Booking.findOne({ paymentTransactionId: transaction_id });

  if (booking) {
    // Check if status is already 'Pending' to prevent updating the status again
    if (booking.status === 'Pending') {
      console.log(`Payment already marked as Pending for transaction: ${transaction_id}`);
      return;
    }

    booking.status = 'Pending';
    await booking.save();
    console.log(`Payment pending for transaction: ${transaction_id}`);
  }
};

// Handle refunded payment
const handlePaymentRefunded = async (paymentData) => {
  const { transaction_id } = paymentData;

  const booking = await Booking.findOne({ paymentTransactionId: transaction_id });

  if (booking) {
    // Prevent updating the status if it's already 'Refunded'
    if (booking.status === 'Refunded') {
      console.log(`Payment already refunded for transaction: ${transaction_id}`);
      return;
    }

    booking.status = 'Refunded';
    await booking.save();
    console.log(`Payment refunded for transaction: ${transaction_id}`);
  }
};

// Handle denied payment
const handlePaymentDenied = async (paymentData) => {
  const { transaction_id } = paymentData;

  const booking = await Booking.findOne({ paymentTransactionId: transaction_id });

  if (booking) {
    // Prevent updating the status if it's already 'Denied'
    if (booking.status === 'Denied') {
      console.log(`Payment already denied for transaction: ${transaction_id}`);
      return;
    }

    booking.status = 'Denied';
    await booking.save();
    console.log(`Payment denied for transaction: ${transaction_id}`);
  }
};


export default router;
