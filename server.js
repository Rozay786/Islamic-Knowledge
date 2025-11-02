const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Static assets (existing site HTML/CSS/JS)
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// GET contact page
app.get('/contact', (req, res) => {
  res.render('contact', { sent: false, error: null });
});

// POST route to receive question and send email
app.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).render('contact', { sent: false, error: 'Please fill name, email and message.' });
    }

    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: `"Website Contact" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: process.env.CONTACT_RECEIVER_EMAIL,
      subject: `[Website Question] ${subject || 'No subject'}`,
      text: `You have a new question from the website:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    await transporter.sendMail(mailOptions);
    res.render('contact', { sent: true, error: null });
  } catch (err) {
    console.error('Error sending contact email:', err);
    res.status(500).render('contact', { sent: false, error: 'Failed to send message. Try again later.' });
  }
});

// Serve General page (static file in public/)
app.get('/general', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'general.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
