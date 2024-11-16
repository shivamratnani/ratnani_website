import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred email service
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-specific-password'
  }
});

app.post('/api/send-email', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  const mailOptions = {
    from: email,
    to: 'shiv@ratnani.org',
    subject: `Contact Form: ${subject}`,
    text: `
      Name: ${name}
      Email: ${email}
      Phone: ${phone}

      Message:
      ${message}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

