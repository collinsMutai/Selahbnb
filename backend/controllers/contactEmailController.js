import axios from 'axios';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
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
    throw new Error('Bot detected! Submission rejected.');
  }

  try {
    // Send the email if no bot is detected
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'selahsprings48@gmail.com',
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
        <h3>Message:</h3>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Message sent successfully!');
  } catch (error) {
    console.error(error);
    throw new Error(error.message || 'Failed to send message.');
  }
};

export { sendContactFormEmail };
