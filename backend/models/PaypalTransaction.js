import mongoose from 'mongoose';

// Define the schema for the PayPal transaction
const paypalTransactionSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true, // PayPal order ID
  },
  payerEmail: {
    type: String,
    required: true, // Email of the payer
  },
  payerName: {
    type: String,
    required: true, // Name of the payer
  },
  amount: {
    type: Number,
    required: true, // Payment amount
  },
  currency: {
    type: String,
    default: 'USD', // Default currency
  },
  status: {
    type: String,
    enum: ['CREATED', 'COMPLETED', 'CANCELLED', 'PENDING', 'REFUNDED'],
    default: 'CREATED', // Initial status
  },
  approvalLink: {
    type: String,
    required: false, // Make this field optional
  },
  createdAt: {
    type: Date,
    default: Date.now, // Time of transaction creation
  },
});

const PaypalTransaction = mongoose.model('PaypalTransaction', paypalTransactionSchema);

export default PaypalTransaction;
