import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);


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

// Send email function
const sendBookingConfirmationEmail = async (userEmail, bookingDetails, listingDetails) => {
  const { name, checkIn, checkOut, totalPrice, paymentTransactionId } = bookingDetails;
  const { title, location } = listingDetails;

  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: userEmail, // Recipient's email address
    subject: `Booking Confirmation - ${title} at ${location}`, // Subject line
    text: `
    Dear ${name},

    Your booking for ${title} at ${location} has been confirmed.

    Booking Details:
    - Check-in: ${checkIn}
    - Check-out: ${checkOut}
    - Total Price: $${totalPrice}
    - Payment Transaction ID: ${paymentTransactionId}

    We look forward to hosting you! If you have any questions, feel free to contact us.

    Best regards,
    The Booking Team
    `,
  };

  try {
    // Attempt to send the email
    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('SMTP Response Error:', error.response);
    }
  }
};

export { sendBookingConfirmationEmail };
