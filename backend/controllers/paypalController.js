import paypal from '@paypal/checkout-server-sdk';
import Booking from '../models/Booking.js';

// Initialize PayPal environment (make sure to use your PayPal credentials)
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

// Create a PayPal payment (this generates the PayPal payment link)
export const createPaypalPayment = async (req, res) => {
  const { bookingId } = req.body;  // Only need the bookingId, not the totalPrice

  try {
    // Find the booking in the database
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Calculate the total price for the booking
    const totalPrice = booking.totalPrice;

    // Create PayPal order request
    const order = new paypal.orders.OrdersCreateRequest();
    order.requestBody({
      intent: 'CAPTURE',  // 'CAPTURE' means we will capture the payment later
      purchase_units: [
        {
          reference_id: bookingId,
          amount: {
            currency_code: 'USD',  // Change to your currency
            value: totalPrice.toString(),  // Convert to string if it's a number
          },
        },
      ],
      application_context: {
        return_url: `${process.env.CLIENT_URL}/payment/success`,  // Redirect after payment success
        cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,  // Redirect if payment is canceled
      },
    });

    // Execute PayPal order request
    const response = await client.execute(order);

    // Return the PayPal approval link to the client
    const approvalLink = response.result.links.find(link => link.rel === 'approve').href;

    res.status(200).json({ approvalLink });
  } catch (error) {
    console.error('Error creating PayPal payment:', error);
    res.status(500).json({ message: 'Error creating PayPal payment' });
  }
};

// Capture the PayPal payment (after the user completes the payment)
export const capturePaypalPayment = async (req, res) => {
  const { orderId } = req.body;  // Order ID returned from PayPal

  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const captureResponse = await client.execute(request);

    // Find the booking based on the PayPal order reference (assuming you store it)
    const booking = await Booking.findOne({ paymentTransactionId: captureResponse.result.id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update booking status to 'Confirmed' and save the payment details
    booking.status = 'Confirmed';
    booking.paymentStatus = 'Completed';
    booking.paymentAmount = captureResponse.result.purchase_units[0].payments.captures[0].amount.value;
    booking.payerEmail = captureResponse.result.payer.email_address;
    booking.paymentTransactionId = captureResponse.result.id;  // Save PayPal transaction ID

    await booking.save();

    res.status(200).json({ message: 'Payment successfully captured', booking });
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    res.status(500).json({ message: 'Error capturing PayPal payment' });
  }
};

// Cancel the PayPal payment (if the user decides to cancel)
export const cancelPaypalPayment = async (req, res) => {
  const { orderId } = req.body;

  try {
    // Currently, PayPal doesn't support direct "cancel" API calls, but we can handle cancellations manually
    const request = new paypal.orders.OrdersCancelRequest(orderId);
    await client.execute(request);

    // Find and update the booking status to 'Cancelled'
    const booking = await Booking.findOne({ paymentTransactionId: orderId });

    if (booking) {
      booking.status = 'Cancelled';
      await booking.save();
      res.status(200).json({ message: 'Payment canceled successfully' });
    } else {
      res.status(404).json({ message: 'Booking not found for cancellation' });
    }
  } catch (error) {
    console.error('Error canceling PayPal payment:', error);
    res.status(500).json({ message: 'Error canceling PayPal payment' });
  }
};
