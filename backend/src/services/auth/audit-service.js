const db = require('../../config/db');

async function logAuthEvent({ userId = null, event, email = null, sessionId = null, req = null, metadata = {} }) {
  try {
    await db.query(
      `INSERT INTO auth_audit_logs (user_id, event, email, session_id, ip_address, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        event,
        email,
        sessionId,
        req?.ip || null,
        req?.headers?.['user-agent'] || null,
        metadata
      ]
    );
  } catch (err) {
    console.error('Ошибка записи auth audit log:', err);
  }
}

module.exports = {
  logAuthEvent
};
