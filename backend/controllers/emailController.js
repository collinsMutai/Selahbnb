import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import moment from 'moment'; // For better date formatting

dotenv.config();

// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail as the service
  host: 'smtp.gmail.com', // Explicitly specify SMTP host
  port: 587, // Default port for TLS encryption (587)
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your app password
  },
});

// Send booking confirmation email function with retry logic
const sendBookingConfirmationEmail = async (payerEmail, userEmail, bookingDetails, listingDetails) => {
  const { name, checkIn, checkOut, subtotal, tax, totalPrice, paymentTransactionId } = bookingDetails;
  const { title, location } = listingDetails;

  // Format the check-in and check-out dates
  const formattedCheckIn = moment(checkIn).format('MMMM Do YYYY, h:mm A');
  const formattedCheckOut = moment(checkOut).format('MMMM Do YYYY, h:mm A');

  // Selah Springs contact details
  const contactEmail = 'selahsprings48@gmail.com';
  const contactPhone = '+17194920042';

  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: payerEmail, // Primary recipient's email address (payer)
    cc: userEmail, // CC the user's email address
    subject: `Booking Confirmation - ${title} at ${location}`, // Subject line
    html: `
      <h1>Booking Confirmation</h1>
      <p>Dear ${name},</p>
      <p>Your booking for <strong>${title}</strong> at <strong>${location}</strong> has been confirmed.</p>

      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Check-in:</strong> ${formattedCheckIn}</li>
        <li><strong>Check-out:</strong> ${formattedCheckOut}</li>
        <li><strong>Subtotal:</strong> $${Number(subtotal).toFixed(2)}</li>
        <li><strong>Tax:</strong> $${Number(tax).toFixed(2)}</li>
        <li><strong>Total price:</strong> $${Number(totalPrice).toFixed(2)}</li>
        <li><strong>Payment Transaction ID:</strong> ${paymentTransactionId}</li>
      </ul>

      <p>We look forward to hosting you! If you have any questions, feel free to contact us:</p>

      <p><strong>Selah Springs Contact Information:</strong></p>
      <p>Email: <a href="mailto:${contactEmail}">${contactEmail}</a></p>
      <p>Phone: <a href="tel:${contactPhone}">${contactPhone}</a></p>

      <p>Best regards,<br>The Booking Team</p>
    `, // HTML body
  };

  // Retry logic for sending the email (max 3 attempts)
  const maxRetries = 3;
  let attempt = 0;

  const sendEmailWithRetry = async () => {
    while (attempt < maxRetries) {
      try {
        // Attempt to send the email
        await transporter.sendMail(mailOptions);
        console.log('Booking confirmation email sent successfully!');
        break; // Exit loop after successful email send
      } catch (error) {
        attempt++;
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt >= maxRetries) {
          console.error('Max retries reached. Failed to send email.');
        } else {
          console.log('Retrying...');
        }
      }
    }
  };

  // Execute the retry logic
  await sendEmailWithRetry();
};

// Send monthly charge email function with retry logic
const sendMonthlyChargeEmail = async (payerEmail, adminEmail, payerName, amount, transactionId, paymentDate) => {
  // Format the payment date for readability
  const formattedPaymentDate = moment(paymentDate).format('MMMM Do YYYY, h:mm A');
  
  // Contact details
  const contactEmail = 'selahsprings48@gmail.com';
  const contactPhone = '+17194920042';

  // Payer email template
  const payerMailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: payerEmail, // Primary recipient's email address (payer)
    subject: `Monthly Charge Confirmation - $${amount}`,
    html: `
      <h1>Monthly Charge Confirmation</h1>
      <p>Dear ${payerName},</p>
      <p>Your monthly charge of <strong>$${amount}</strong> has been successfully processed.</p>
      
      <h3>Transaction Details:</h3>
      <ul>
        <li><strong>Transaction ID:</strong> ${transactionId}</li>
        <li><strong>Payment Date:</strong> ${formattedPaymentDate}</li>
        <li><strong>Amount Charged:</strong> $${amount}</li>
      </ul>

      <p>If you have any questions, feel free to contact us:</p>

      <p><strong>Selah Springs Contact Information:</strong></p>
      <p>Email: <a href="mailto:${contactEmail}">${contactEmail}</a></p>
      <p>Phone: <a href="tel:${contactPhone}">${contactPhone}</a></p>

      <p>Thank you for your payment!</p>
      <p>Best regards,<br>The Payment Team</p>
    `, // HTML body
  };

  // Admin email template
  const adminMailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: adminEmail, // Admin's email address
    subject: `New Monthly Charge Payment Received - $${amount}`,
    html: `
      <h1>New Monthly Charge Payment Received</h1>
      <p>A new monthly charge payment has been successfully processed.</p>
      
      <h3>Payment Details:</h3>
      <ul>
        <li><strong>Payer:</strong> ${payerName}</li>
        <li><strong>Transaction ID:</strong> ${transactionId}</li>
        <li><strong>Amount Charged:</strong> $${amount}</li>
        <li><strong>Payment Date:</strong> ${formattedPaymentDate}</li>
        <li><strong>Payer Email:</strong> ${payerEmail}</li>
      </ul>

      <p>Thank you for your attention!</p>
      <p>Best regards,<br>The Payment Team</p>
    `, // HTML body
  };

  // Retry logic for sending the email (max 3 attempts)
  const maxRetries = 3;
  let attempt = 0;

  const sendEmailWithRetry = async (mailOptions) => {
    while (attempt < maxRetries) {
      try {
        // Attempt to send the email
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        break; // Exit loop after successful email send
      } catch (error) {
        attempt++;
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt >= maxRetries) {
          console.error('Max retries reached. Failed to send email.');
        } else {
          console.log('Retrying...');
        }
      }
    }
  };

  // Execute the retry logic for both payer and admin emails
  await sendEmailWithRetry(payerMailOptions);
  await sendEmailWithRetry(adminMailOptions);
};

export { sendBookingConfirmationEmail, sendMonthlyChargeEmail };
