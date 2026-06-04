const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth');
const { isSessionActive } = require('../services/auth/token-service');

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Не авторизован. Отсутствует токен доступа.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.session_id || !await isSessionActive(decoded.session_id)) {
      return res.status(401).json({ error: 'Сессия истекла или была отозвана.' });
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role_id: decoded.role_id,
      session_id: decoded.session_id,
      jti: decoded.jti
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Неверный или истекший токен доступа.' });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user && req.user.role_id === 2) {
      next();
    } else {
      res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
  });
}

function requireAdminOrReviewer(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user && (req.user.role_id === 2 || req.user.role_id === 3)) {
      next();
    } else {
      res.status(403).json({ error: 'Доступ запрещен. Требуются права модератора или администратора.' });
    }
  });
}

module.exports = {
  JWT_SECRET,
  requireAuth,
  requireAdmin,
  requireAdminOrReviewer
};
