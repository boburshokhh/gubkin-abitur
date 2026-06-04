require('dotenv').config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

const JWT_SECRET = requireEnv('JWT_SECRET');
const TOKEN_PEPPER = process.env.TOKEN_PEPPER || JWT_SECRET;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173';
const ACCESS_TOKEN_TTL_SECONDS = Number(process.env.ACCESS_TOKEN_TTL_SECONDS || 15 * 60);
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30);
const EMAIL_TOKEN_TTL_MINUTES = Number(process.env.EMAIL_TOKEN_TTL_MINUTES || 60 * 24);
const PASSWORD_RESET_TOKEN_TTL_MINUTES = Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || 30);
const INVITATION_TOKEN_TTL_DAYS = Number(process.env.INVITATION_TOKEN_TTL_DAYS || 7);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

module.exports = {
  JWT_SECRET,
  TOKEN_PEPPER,
  FRONTEND_ORIGIN,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_DAYS,
  EMAIL_TOKEN_TTL_MINUTES,
  PASSWORD_RESET_TOKEN_TTL_MINUTES,
  INVITATION_TOKEN_TTL_DAYS,
  IS_PRODUCTION
};
