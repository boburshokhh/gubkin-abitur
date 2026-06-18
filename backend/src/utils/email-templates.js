const { FRONTEND_ORIGIN } = require('../config/auth');

function buildUrl(path, params) {
  const url = new URL(path, FRONTEND_ORIGIN);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url.toString();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wrapEmail({ title, body }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <h2 style="color: #003366; text-align: center;">Губкинский университет</h2>
      <h3 style="color: #111827;">${title}</h3>
      ${body}
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
    </div>
  `;
}

function verificationEmail({ token }) {
  const link = buildUrl('/auth/callback', { type: 'email_verification', token });
  return {
    subject: 'Подтверждение email - Приемная кампания Губкинского университета',
    text: `Подтвердите email по ссылке: ${link}`,
    html: wrapEmail({
      title: 'Подтверждение email',
      body: `
        <p>Здравствуйте!</p>
        <p>Для завершения регистрации подтвердите ваш email:</p>
        <p><a href="${link}" style="display: inline-block; padding: 12px 18px; background: #003366; color: #ffffff; border-radius: 6px; text-decoration: none;">Подтвердить email</a></p>
        <p style="font-size: 14px; color: #666;">Ссылка одноразовая и действует ограниченное время.</p>
      `
    })
  };
}

function passwordResetEmail({ token }) {
  const link = buildUrl('/auth/reset-password', { token });
  return {
    subject: 'Сброс пароля - Приемная кампания Губкинского университета',
    text: `Сбросьте пароль по ссылке: ${link}`,
    html: wrapEmail({
      title: 'Сброс пароля',
      body: `
        <p>Здравствуйте!</p>
        <p>Мы получили запрос на сброс пароля. Если это были вы, задайте новый пароль по ссылке:</p>
        <p><a href="${link}" style="display: inline-block; padding: 12px 18px; background: #003366; color: #ffffff; border-radius: 6px; text-decoration: none;">Задать новый пароль</a></p>
        <p style="font-size: 14px; color: #666;">Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
      `
    })
  };
}

function invitationEmail({ token, roleName }) {
  const link = buildUrl('/auth/accept-invitation', { token });
  return {
    subject: 'Приглашение в систему - Приемная кампания Губкинского университета',
    text: `Примите приглашение (${roleName}) по ссылке: ${link}`,
    html: wrapEmail({
      title: 'Приглашение в систему',
      body: `
        <p>Здравствуйте!</p>
        <p>Вас пригласили в систему приемной кампании с ролью: <strong>${roleName}</strong>.</p>
        <p><a href="${link}" style="display: inline-block; padding: 12px 18px; background: #003366; color: #ffffff; border-radius: 6px; text-decoration: none;">Принять приглашение</a></p>
        <p style="font-size: 14px; color: #666;">Ссылка одноразовая и действует ограниченное время.</p>
      `
    })
  };
}

const ACCEPTED_STATUS_ID = 3;
const REJECTED_STATUS_ID = 4;

function applicationStatusEmail({
  statusId,
  statusName,
  comment,
  applicationId,
  studentName,
  commissionPhoneLabel,
  commissionPhone
}) {
  const isAccepted = statusId === ACCEPTED_STATUS_ID;
  const isRejected = statusId === REJECTED_STATUS_ID;
  const greeting = studentName ? `Здравствуйте, ${studentName}!` : 'Здравствуйте!';
  const trimmedComment = typeof comment === 'string' ? comment.trim() : '';
  const phoneDisplay = commissionPhoneLabel || commissionPhone || 'не указан';
  const phoneLine = commissionPhone
    ? `Телефон приемной комиссии: ${phoneDisplay} (${commissionPhone})`
    : `Телефон приемной комиссии: ${phoneDisplay}`;

  let statusMessage;
  let subject;

  if (isAccepted) {
    subject = 'Заявление принято - Приемная кампания Губкинского университета';
    statusMessage = 'Ваше заявление успешно проверено и принято приемной комиссией.';
  } else if (isRejected) {
    subject = 'Заявление отклонено - Приемная кампания Губкинского университета';
    statusMessage = 'К сожалению, ваше заявление отклонено приемной комиссией.';
  } else {
    subject = `Статус заявления изменен: ${statusName} - Приемная кампания Губкинского университета`;
    statusMessage = `Статус вашего заявления изменен на «${statusName}».`;
  }

  const commentBlock = trimmedComment
    ? `
        <p><strong>${isRejected ? 'Причина отклонения' : 'Комментарий приемной комиссии'}:</strong></p>
        <p style="padding: 12px 16px; background: #f9fafb; border-left: 4px solid ${isRejected ? '#dc2626' : '#003366'}; margin: 0 0 16px;">${escapeHtml(trimmedComment)}</p>
      `
    : '';

  const commentText = trimmedComment
    ? `\n\n${isRejected ? 'Причина отклонения' : 'Комментарий приемной комиссии'}: ${trimmedComment}`
    : '';

  const text = [
    greeting,
    '',
    statusMessage,
    `Номер заявления: ${applicationId}`,
    commentText,
    '',
    phoneLine,
    '',
    'С уважением,',
    'Приемная комиссия Губкинского университета'
  ].join('\n');

  const html = wrapEmail({
    title: isAccepted ? 'Заявление принято' : isRejected ? 'Заявление отклонено' : 'Изменение статуса заявления',
    body: `
      <p>${greeting}</p>
      <p>${statusMessage}</p>
      <p>Номер заявления: <strong>${applicationId}</strong></p>
      ${commentBlock}
      <p style="margin-top: 20px;">
        <strong>Контакты приемной комиссии</strong><br>
        ${commissionPhone
          ? `<a href="tel:${commissionPhone}" style="color: #003366;">${phoneDisplay}</a>`
          : phoneDisplay}
      </p>
      <p style="font-size: 14px; color: #666;">По вопросам поступления вы можете обратиться в приемную комиссию по указанному телефону.</p>
    `
  });

  return { subject, text, html };
}

module.exports = {
  verificationEmail,
  passwordResetEmail,
  invitationEmail,
  applicationStatusEmail,
  ACCEPTED_STATUS_ID,
  REJECTED_STATUS_ID
};
