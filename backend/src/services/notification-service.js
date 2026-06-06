const db = require('../config/db')
const { emitNotification } = require('../socket/feedback')

async function createNotification({
  userId,
  type = 'feedback_message',
  message,
  applicationId = null,
  conversationId = null,
  messageId = null,
  meta = {}
}) {
  const result = await db.query(
    `INSERT INTO notifications (user_id, type, message, application_id, conversation_id, message_id, meta)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
     RETURNING *`,
    [
      userId,
      type,
      message,
      applicationId,
      conversationId,
      messageId,
      JSON.stringify(meta || {})
    ]
  )

  const notification = result.rows[0]
  emitNotification(userId, notification)
  return notification
}

async function createStaffNotifications(payload) {
  const staffResult = await db.query('SELECT id FROM users WHERE role_id IN (2, 3)')
  await Promise.all(staffResult.rows.map((staff) => (
    createNotification({ ...payload, userId: staff.id })
  )))
}

module.exports = {
  createNotification,
  createStaffNotifications
}
