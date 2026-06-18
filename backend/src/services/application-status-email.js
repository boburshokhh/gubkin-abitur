const db = require('../config/db');
const { sendEmail } = require('../utils/mailer');
const {
  applicationStatusEmail,
  ACCEPTED_STATUS_ID,
  REJECTED_STATUS_ID
} = require('../utils/email-templates');

const NOTIFY_STATUS_IDS = new Set([ACCEPTED_STATUS_ID, REJECTED_STATUS_ID]);

async function getCommissionPhone() {
  const result = await db.query(
    `SELECT key, value
     FROM site_settings
     WHERE category = 'contact' AND key IN ('phone_main', 'phone_main_label')`
  );

  const settings = result.rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

  return {
    phone: settings.phone_main || process.env.ADMISSION_PHONE || null,
    phoneLabel: settings.phone_main_label || settings.phone_main || process.env.ADMISSION_PHONE_LABEL || null
  };
}

async function sendApplicationStatusChangeEmail({
  applicationId,
  statusId,
  statusName,
  comment,
  studentEmail,
  studentFirstName,
  studentLastName,
  studentMiddleName
}) {
  if (!NOTIFY_STATUS_IDS.has(statusId)) return { sent: false, skipped: true };
  if (!studentEmail) {
    console.warn('Application status email skipped: student email is missing', { applicationId, statusId });
    return { sent: false, skipped: true };
  }

  const { phone, phoneLabel } = await getCommissionPhone();
  const emailPayload = applicationStatusEmail({
    statusId,
    statusName,
    comment,
    applicationId,
    studentName: [studentLastName, studentFirstName, studentMiddleName].filter(Boolean).join(' ').trim(),
    commissionPhone: phone,
    commissionPhoneLabel: phoneLabel
  });

  const sent = await sendEmail(studentEmail, emailPayload.subject, emailPayload.text, emailPayload.html);

  if (!sent) {
    console.error('Failed to send application status email', { applicationId, statusId, studentEmail });
  }

  return { sent, skipped: false };
}

module.exports = {
  sendApplicationStatusChangeEmail,
  NOTIFY_STATUS_IDS
};
