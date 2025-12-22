import axios from "axios";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

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

// Send contact form email
const sendContactFormEmail = async (contactData) => {
  const { name, email, phone, message, honeypot } = contactData;

  // Honeypot check - if the honeypot field is filled, it's likely a bot
  if (honeypot) {
    throw new Error("Bot detected! Submission rejected.");
  }

  try {
    // Send the email if no bot is detected
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "selahsprings48@gmail.com",
      replyTo: email,
      subject: `Message from Selah Springs Lodge`,
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                color: #333;
                background-color: #f9f9f9;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h2 {
                color: #148992;  /* Theme color for header */
                font-size: 24px;
                margin-bottom: 20px;
              }
              p {
                font-size: 16px;
                line-height: 1.6;
              }
              strong {
                font-weight: bold;
                color: #333;
              }
              a {
                color: #148992 !important; /* Force theme color for links */
                text-decoration: none !important; /* Ensure no underlining */
              }
              a:hover {
                color: #0f6f6f !important; /* Darker shade for hover */
                text-decoration: underline !important; /* Underline on hover */
              }
            </style>
          </head>
          <body>
            <div class="container">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
              <h3>Message:</h3>
              <p>${message}</p>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Message sent successfully!");
  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Failed to send message.");
  }
};

export { sendContactFormEmail };
