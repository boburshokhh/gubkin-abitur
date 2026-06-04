const bcrypt = require('bcryptjs');

const MIN_PASSWORD_LENGTH = 10;

function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Пароль обязателен' };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { isValid: false, error: `Пароль должен быть не короче ${MIN_PASSWORD_LENGTH} символов` };
  }

  if (!/[a-zа-я]/i.test(password) || !/\d/.test(password)) {
    return { isValid: false, error: 'Пароль должен содержать буквы и цифры' };
  }

  return { isValid: true, error: null };
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password, passwordHash) {
  if (!passwordHash) return false;
  return bcrypt.compare(password, passwordHash);
}

module.exports = {
  validatePassword,
  hashPassword,
  verifyPassword
};
