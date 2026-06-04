const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-gubkin-key-2026';

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Не авторизован. Отсутствует токен доступа.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role_id }
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
