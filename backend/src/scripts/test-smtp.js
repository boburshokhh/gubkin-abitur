const nodemailer = require('nodemailer');
require('dotenv').config();

const DEFAULT_TO = 'samanihalab@gmail.com';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function maskEmail(email) {
  const [name, domain] = String(email || '').split('@');
  if (!name || !domain) return 'not-set';
  return `${name.slice(0, 2)}***@${domain}`;
}

async function main() {
  const to = process.argv[2] || DEFAULT_TO;
  const host = requireEnv('SMTP_HOST');
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';
  const user = requireEnv('SMTP_USER');
  const pass = requireEnv('SMTP_PASS');
  const from = process.env.SMTP_FROM || user;

  console.log('SMTP test started:', {
    host,
    port,
    secure,
    user: maskEmail(user),
    from,
    to
  });

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false'
    }
  });

  console.log('Checking SMTP connection...');
  await transporter.verify();
  console.log('SMTP connection verified.');

  const info = await transporter.sendMail({
    from: `"Приемная комиссия Губкинского университета" <${from}>`,
    to,
    subject: 'Тест SMTP - Губкин Абитур',
    text: 'Это тестовое письмо для проверки SMTP отправки.',
    html: '<p>Это тестовое письмо для проверки SMTP отправки.</p>'
  });

  console.log('SMTP test email sent:', {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response
  });
}

main().catch((error) => {
  console.error('SMTP test failed:', {
    message: error.message,
    code: error.code,
    command: error.command,
    responseCode: error.responseCode,
    response: error.response
  });
  process.exit(1);
});
