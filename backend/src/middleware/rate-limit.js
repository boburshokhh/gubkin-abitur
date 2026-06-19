const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const { normalizeEmail } = require('../services/auth/email-token-service');

const RATE_LIMIT_MESSAGE = { error: 'Слишком много запросов. Попробуйте позже.' };

/** Строгий лимит для входа, регистрации и сброса пароля */
const credentialRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = normalizeEmail(req.body?.email);
    const ipKey = ipKeyGenerator(req.ip);
    return email ? `${ipKey}:${email}` : ipKey;
  },
  message: RATE_LIMIT_MESSAGE
});

/** Лимит для приглашений сотрудников */
const invitationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: RATE_LIMIT_MESSAGE
});

module.exports = {
  credentialRateLimit,
  invitationRateLimit
};
