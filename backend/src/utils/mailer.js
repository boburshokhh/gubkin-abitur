const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.api.gubkin.uz',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'priem@api.gubkin.uz',
    pass: process.env.SMTP_PASS || '1234bobur$',
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Приемная комиссия Губкинского университета" <${process.env.SMTP_USER || 'priem@api.gubkin.uz'}>`,
      to,
      subject,
      text,
      html
    });
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendEmail
};
