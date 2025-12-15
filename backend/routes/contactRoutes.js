import express from 'express';
import { sendContactFormEmail } from '../controllers/contactEmailController.js';

const router = express.Router();

/**
 * Handle contact form submission.
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message, honeypot } = req.body;

    // Check for empty fields and the honeypot field
    if (honeypot) {
      return res.status(400).json({ message: 'Bot detected, submission rejected.' });
    }

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // If everything is good, send the email
    await sendContactFormEmail({ name, email, phone, message, honeypot });

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

export default router;
