const { FRONTEND_ORIGIN } = require('../config/auth');

function buildUrl(path, params) {
  const url = new URL(path, FRONTEND_ORIGIN);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url.toString();
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

module.exports = {
  verificationEmail,
  passwordResetEmail,
  invitationEmail
};
