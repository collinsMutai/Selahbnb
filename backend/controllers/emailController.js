import nodemailer from "nodemailer";
import dotenv from "dotenv";
import moment from "moment"; // For better date formatting

dotenv.config();

// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ===============================
// Helper: Retry logic for sending emails
// ===============================
const sendEmailWithRetry = async (mailOptions) => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${mailOptions.to}`);
      break;
    } catch (error) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt >= maxRetries) {
        console.error("Max retries reached. Failed to send email.");
      } else {
        // Optional: wait a short time before retrying
        await new Promise((res) => setTimeout(res, 1000 * attempt));
      }
    }
  }
};

// ===============================
// Booking Confirmation Email
// ===============================
const sendBookingConfirmationEmail = async (
  payerEmail,
  userEmail,
  bookingDetails,
  listingDetails
) => {
  const { name, checkIn, checkOut, totalPrice, paymentTransactionId } = bookingDetails;
  const { title, location } = listingDetails;

  const formattedCheckIn = moment(checkIn).format("MMMM Do YYYY, h:mm A");
  const formattedCheckOut = moment(checkOut).format("MMMM Do YYYY, h:mm A");

  const contactEmail = "selahsprings48@gmail.com";
  const contactPhone = "+17194920042";

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: payerEmail,
    cc: userEmail,
    subject: `Booking Confirmation - ${title} at ${location}`,
    html: `
      <h1>Booking Confirmation</h1>
      <p>Dear ${name},</p>
      <p>Your booking for <strong>${title}</strong> at <strong>${location}</strong> has been confirmed.</p>
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Check-in:</strong> ${formattedCheckIn}</li>
        <li><strong>Check-out:</strong> ${formattedCheckOut}</li>
        <li><strong>Total Price:</strong> $${Number(totalPrice).toFixed(2)}</li>
        <li><strong>Payment Transaction ID:</strong> ${paymentTransactionId}</li>
      </ul>
      <p>If you have any questions, contact us:</p>
      <p>Email: <a href="mailto:${contactEmail}">${contactEmail}</a></p>
      <p>Phone: <a href="tel:${contactPhone}">${contactPhone}</a></p>
      <p>Best regards,<br>The Booking Team</p>
    `,
  };

  await sendEmailWithRetry(mailOptions);
};

// ===============================
// Booking Failed Email
// ===============================
const sendBookingFailedEmail = async (
  payerEmail,
  userEmail,
  bookingDetails,
  listingDetails,
  reason
) => {
  const { name, checkIn, checkOut, totalPrice } = bookingDetails;
  const { title, location } = listingDetails;

  const formattedCheckIn = moment(checkIn).format("MMMM Do YYYY, h:mm A");
  const formattedCheckOut = moment(checkOut).format("MMMM Do YYYY, h:mm A");

  const contactEmail = "selahsprings48@gmail.com";
  const contactPhone = "+17194920042";

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: payerEmail,
    cc: userEmail,
    subject: `Booking Could Not Be Processed - ${title} at ${location}`,
    html: `
      <h1>Booking Failed</h1>
      <p>Dear ${name},</p>
      <p>Unfortunately, your booking for <strong>${title}</strong> at <strong>${location}</strong> could not be processed.</p>
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Check-in:</strong> ${formattedCheckIn}</li>
        <li><strong>Check-out:</strong> ${formattedCheckOut}</li>
        <li><strong>Total Price:</strong> $${Number(totalPrice).toFixed(2)}</li>
      </ul>
      <h3>Reason:</h3>
      <p>${reason}</p>
      <p>Your payment has been refunded (if it was captured).</p>
      <p>If you have any questions, please contact us:</p>
      <p>Email: <a href="mailto:${contactEmail}">${contactEmail}</a></p>
      <p>Phone: <a href="tel:${contactPhone}">${contactPhone}</a></p>
      <p>We apologize for the inconvenience.<br>The Booking Team</p>
    `,
  };

  await sendEmailWithRetry(mailOptions);
};

// ===============================
// Admin Alert Email
// ===============================
const sendAdminAlertEmail = async (subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `[ADMIN ALERT] ${subject}`,
    html: `<p>${message}</p>`,
  };

  await sendEmailWithRetry(mailOptions);
};

export { sendBookingConfirmationEmail, sendBookingFailedEmail, sendAdminAlertEmail };
