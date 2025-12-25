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
  // const contactEmail = 'selahsprings48@gmail.com';
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
  const logoUrl = 'https://selahspringslodge.com/static/media/Selah_Logo.7fee93c37c0ef3580664.png';

  // Create the email transporter for Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',  // Use your preferred email service
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password (or app password)
    },
  });

  // Payer email template with card layout and Google Fonts
  const payerMailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: payerEmail, // Payer's email address
    subject: `Payment Confirmation - $${amount}`,  // Subject
    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Payer Confirmation Email</title>
          <style>
            @import url("https://fonts.googleapis.com/css2?family=DM+Sans&family=Jost:wght@400;700&display=swap");

            body {
              font-family: "DM Sans", sans-serif, Arial, sans-serif;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              line-height: 1.6;
              color: #34495e;
              padding: 20px;
              background-color: #f4f4f4;
            }

            .email-container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }

            .content {
              text-align: left;
            }

            .card {
              border: 1px solid #ddd;
              padding: 20px;
              border-radius: 10px;
              background-color: #ffffff;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            h1, h2, h3, h4, h5, h6 {
              font-family: "Jost", sans-serif, Arial, sans-serif;
              font-weight: normal;
              color: #148992;
            }

            a {
              color: #148992;
              text-decoration: none;
            }

            ul {
              list-style-type: none;
              padding-left: 0;
            }

            li {
              font-size: 16px;
              color: #34495e;
            }

            .logo {
              width: 200px;
              margin: 0;
            }

            .footer {
              font-size: 14px;
              color: #7f8c8d;
              margin-top: 20px;
              text-align: center;
            }

            .contact-info {
              margin-top: 20px;
              font-size: 16px;
              color: #34495e;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="card">
              <h1>Payment Confirmation</h1>
              <p>Dear ${payerName},</p>
              <p>Your payment of <strong style="color: #148992;">$${amount}</strong> has been successfully processed.</p>

              <h3>Transaction Details:</h3>
              <ul>
                <li><strong>Transaction ID:</strong> ${transactionId}</li>
                <li><strong>Payment Date:</strong> ${formattedPaymentDate}</li>
                <li><strong>Amount Charged:</strong> $${amount}</li>
              </ul>

              <p>Thank you for your payment!</p>
              <p>Best regards,<br />Selah Springs Lodge</p>
              <div class="contact-info">
                <p>If you have any questions, feel free to contact us:</p>
                <p><strong>Selah Springs Lodge Contact Information:</strong></p>
                <p>Email: <a href="mailto:${contactEmail}">${contactEmail}</a></p>
                <p>Phone: <a href="tel:${contactPhone}">${contactPhone}</a></p>
                <img src="${logoUrl}" alt="Selah Springs Logo" class="logo" />
              </div>
              <div class="footer">
                <p>Selah Springs Lodge | Colorado Springs, Colorado</p>
              </div>
            </div>


          </div>
        </body>
      </html>
    `, // HTML body for payer
  };

  // Admin email template with card layout and Google Fonts
  const adminMailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: adminEmail, // Admin's email address
    subject: `New Payment Received - $${amount}`,  // Subject
    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Admin Payment Notification</title>
          <style>
            @import url("https://fonts.googleapis.com/css2?family=DM+Sans&family=Jost:wght@400;700&display=swap");

            body {
              font-family: "DM Sans", sans-serif, Arial, sans-serif;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              line-height: 1.6;
              color: #34495e;
              padding: 20px;
              background-color: #f4f4f4;
            }

            .email-container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }

            .content {
              text-align: left;
            }

            .card {
              border: 1px solid #ddd;
              padding: 20px;
              border-radius: 10px;
              background-color: #ffffff;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            h1, h2, h3, h4, h5, h6 {
              font-family: "Jost", sans-serif, Arial, sans-serif;
              font-weight: normal;
              color: #148992;
            }

            a {
              color: #148992;
              text-decoration: none;
            }

            ul {
              list-style-type: none;
              padding-left: 0;
            }

            li {
              font-size: 16px;
              color: #34495e;
            }

            .logo {
              width: 200px;
              margin: 20px 0;
            }

            .footer {
              font-size: 14px;
              color: #7f8c8d;
              margin-top: 20px;
              text-align: center;
            }

            .contact-info {
              margin-top: 20px;
              font-size: 16px;
              color: #34495e;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="card">
              <h1>New Payment From Selah Springs Lodge</h1>
              <p>A new payment has been successfully processed.</p>

              <h3>Payment Details:</h3>
              <ul>
                <li><strong>Payer:</strong> ${payerName}</li>
                <li><strong>Transaction ID:</strong> ${transactionId}</li>
                <li><strong>Amount Charged:</strong> $${amount}</li>
                <li><strong>Payment Date:</strong> ${formattedPaymentDate}</li>
                <li><strong>Payer Email:</strong> ${payerEmail}</li>
              </ul>

              <p>Best regards,<br />Selah Springs Lodge</p>
              <div class="contact-info">
                <p><strong>Selah Springs Contact Information:</strong></p>
                <p>Email: <a href="mailto:${contactEmail}">${contactEmail}</a></p>
                <p>Phone: <a href="tel:${contactPhone}">${contactPhone}</a></p>
                <img src="${logoUrl}" alt="Selah Springs Logo" class="logo" />
              </div>
  
              <div class="footer">
                <p>Selah Springs Lodge | Colorado Springs, Colorado</p>
              </div>
            </div>

          </div>
        </body>
      </html>
    `, // HTML body for admin
  };

  // Retry logic for sending the email (max 3 attempts)
  const maxRetries = 3;
  let attempt = 0;

  const sendEmailWithRetry = async (mailOptions) => {
    while (attempt < maxRetries) {
      try {
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
