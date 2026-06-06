const express = require('express')
const multer = require('multer')
const crypto = require('crypto')
const db = require('../config/db')
const s3 = require('../config/s3')
const { requireAuth } = require('../middleware/auth')
const { emitNewMessage, emitConversationStatus } = require('../socket/feedback')
const { createNotification, createStaffNotifications } = require('../services/notification-service')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

// Получить или создать conversationId студента
async function getOrCreateConversation(studentId) {
  const existing = await db.query(
    `SELECT * FROM conversations WHERE student_id = $1 AND status = 'open' ORDER BY created_at ASC LIMIT 1`,
    [studentId]
  )
  if (existing.rows.length > 0) return existing.rows[0]

  const result = await db.query(
    `INSERT INTO conversations (student_id) VALUES ($1) RETURNING *`,
    [studentId]
  )
  return result.rows[0]
}

// Проверка доступа к диалогу
async function checkConversationAccess(userId, roleId, conversationId) {
  if (roleId === 2 || roleId === 3) return true
  const result = await db.query(
    'SELECT id FROM conversations WHERE id = $1 AND student_id = $2',
    [conversationId, userId]
  )
  return result.rows.length > 0
}

// ------------------------------------------------------------------
// GET /feedback/conversations
// Студент — только свой диалог, сотрудник/администратор — все
// ------------------------------------------------------------------
router.get('/conversations', requireAuth, async (req, res) => {
  const { id: userId, role_id } = req.user
  const roleId = Number(role_id)
  try {
    let result
    if (roleId === 2 || roleId === 3) {
      result = await db.query(
        `SELECT c.*,
           u.first_name AS student_first_name,
           u.last_name  AS student_last_name,
           u.email      AS student_email,
           (SELECT COUNT(*) FROM messages m
            WHERE m.conversation_id = c.id AND m.is_read = FALSE AND m.sender_id != $1) AS unread_count
         FROM conversations c
         JOIN users u ON u.id = c.student_id
         ORDER BY c.last_message_at DESC`,
        [userId]
      )
    } else {
      result = await db.query(
        `SELECT c.*,
           (SELECT COUNT(*) FROM messages m
            WHERE m.conversation_id = c.id AND m.is_read = FALSE AND m.sender_id != $1) AS unread_count
         FROM conversations c
         WHERE c.student_id = $1
         ORDER BY c.last_message_at DESC`,
        [userId]
      )
    }
    res.json({ data: result.rows })
  } catch (err) {
    console.error('GET /conversations error:', err)
    res.status(500).json({ error: 'Ошибка при получении диалогов' })
  }
})

// ------------------------------------------------------------------
// GET /feedback/messages/:conversationId
// ------------------------------------------------------------------
router.get('/messages/:conversationId', requireAuth, async (req, res) => {
  const { id: userId, role_id } = req.user
  const roleId = Number(role_id)
  const { conversationId } = req.params
  try {
    const hasAccess = await checkConversationAccess(userId, roleId, conversationId)
    if (!hasAccess) return res.status(403).json({ error: 'Нет доступа к этому диалогу' })

    const result = await db.query(
      `SELECT m.*,
         u.first_name AS sender_first_name,
         u.last_name  AS sender_last_name,
         u.role_id    AS sender_role_id
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC`,
      [conversationId]
    )
    res.json({ data: result.rows })
  } catch (err) {
    console.error('GET /messages error:', err)
    res.status(500).json({ error: 'Ошибка при получении сообщений' })
  }
})

// ------------------------------------------------------------------
// POST /feedback/messages
// Тело: { conversationId?, text } + file (опционально)
// ------------------------------------------------------------------
router.post('/messages', requireAuth, upload.single('image'), async (req, res) => {
  const { id: userId, role_id } = req.user
  const roleId = Number(role_id)
  const { text, conversationId: bodyConvId } = req.body

  if (!text && !req.file) {
    return res.status(400).json({ error: 'Необходимо указать текст или прикрепить изображение' })
  }

  try {
    let conversation

    if (roleId !== 2 && roleId !== 3) {
      // Студент — всегда получает или создает свой единственный диалог.
      conversation = await getOrCreateConversation(userId)
    } else {
      // Сотрудник/администратор — отвечает в указанный диалог
      if (!bodyConvId) return res.status(400).json({ error: 'Необходимо указать conversationId' })
      const convResult = await db.query('SELECT * FROM conversations WHERE id = $1', [bodyConvId])
      if (convResult.rows.length === 0) return res.status(404).json({ error: 'Диалог не найден' })
      conversation = convResult.rows[0]
    }

    let imageUrl = null

    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop()
      const fileId = crypto.randomUUID()
      const s3Key = `feedback/${conversation.id}/${fileId}.${fileExt}`
      await s3.uploadToS3(s3.BUCKET_FILES, s3Key, req.file.buffer, req.file.mimetype)
      imageUrl = s3Key
    }

    const msgResult = await db.query(
      `INSERT INTO messages (conversation_id, sender_id, text, image_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [conversation.id, userId, text || null, imageUrl]
    )
    const message = msgResult.rows[0]

    // Обновить last_message_at у диалога
    await db.query(
      'UPDATE conversations SET last_message_at = NOW(), updated_at = NOW() WHERE id = $1',
      [conversation.id]
    )

    // Получить данные отправителя для рассылки
    const senderResult = await db.query(
      'SELECT first_name, last_name, role_id FROM users WHERE id = $1',
      [userId]
    )
    const sender = senderResult.rows[0]
    const enrichedMessage = { ...message, ...sender, sender_role_id: sender.role_id }

    // Эмит через Socket.IO
    emitNewMessage(enrichedMessage, conversation)

    // Создать уведомления
    if (roleId !== 2 && roleId !== 3) {
      // Уведомить всех сотрудников и администраторов
      await createStaffNotifications({
        type: 'feedback_message',
        message: `Новое сообщение от ${sender.first_name} ${sender.last_name}`,
        conversationId: conversation.id,
        messageId: message.id,
        meta: {
          senderName: `${sender.first_name || ''} ${sender.last_name || ''}`.trim(),
          preview: text || (imageUrl ? 'Прикреплено изображение' : '')
        }
      })
    } else {
      // Уведомить студента
      await createNotification({
        userId: conversation.student_id,
        type: 'feedback_reply',
        message: 'Вы получили ответ на ваш вопрос',
        conversationId: conversation.id,
        messageId: message.id,
        meta: {
          preview: text || (imageUrl ? 'Прикреплено изображение' : '')
        }
      })
    }

    res.status(201).json({ data: enrichedMessage })
  } catch (err) {
    console.error('POST /messages error:', err)
    res.status(500).json({ error: 'Ошибка при отправке сообщения' })
  }
})

// ------------------------------------------------------------------
// GET /feedback/messages/:conversationId/image/:key
// Получить presigned URL для изображения
// ------------------------------------------------------------------
router.get('/messages/:conversationId/image', requireAuth, async (req, res) => {
  const { id: userId, role_id } = req.user
  const roleId = Number(role_id)
  const { conversationId } = req.params
  const { key } = req.query
  if (!key) return res.status(400).json({ error: 'key обязателен' })

  try {
    const hasAccess = await checkConversationAccess(userId, roleId, conversationId)
    if (!hasAccess) return res.status(403).json({ error: 'Нет доступа' })

    const signedUrl = await s3.getPresignedDownloadUrl(s3.BUCKET_FILES, key)
    res.json({ data: { url: signedUrl } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ------------------------------------------------------------------
// GET /feedback/notifications
// ------------------------------------------------------------------
router.get('/notifications', requireAuth, async (req, res) => {
  const { id: userId } = req.user
  try {
    const result = await db.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [userId]
    )
    res.json({ data: result.rows })
  } catch (err) {
    console.error('GET /notifications error:', err)
    res.status(500).json({ error: 'Ошибка при получении уведомлений' })
  }
})

// ------------------------------------------------------------------
// PATCH /feedback/notifications/:id/read
// ------------------------------------------------------------------
router.patch('/notifications/:id/read', requireAuth, async (req, res) => {
  const { id: userId } = req.user
  const { id } = req.params
  try {
    const result = await db.query(
      `UPDATE notifications SET is_read = TRUE
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Уведомление не найдено' })
    res.json({ data: result.rows[0] })
  } catch (err) {
    console.error('PATCH /notifications error:', err)
    res.status(500).json({ error: 'Ошибка при обновлении уведомления' })
  }
})

// ------------------------------------------------------------------
// PATCH /feedback/notifications/read-all
// ------------------------------------------------------------------
router.patch('/notifications/read-all', requireAuth, async (req, res) => {
  const { id: userId } = req.user
  try {
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    )
    res.json({ data: { success: true } })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при обновлении уведомлений' })
  }
})

// ------------------------------------------------------------------
// PATCH /feedback/conversations/:id/close
// Только сотрудник/администратор может закрыть диалог
// ------------------------------------------------------------------
router.patch('/conversations/:id/close', requireAuth, async (req, res) => {
  const { role_id } = req.user
  const roleId = Number(role_id)
  if (roleId !== 2 && roleId !== 3) return res.status(403).json({ error: 'Нет доступа' })

  try {
    const result = await db.query(
      `UPDATE conversations SET status = 'closed', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Диалог не найден' })
    const conversation = result.rows[0]
    emitConversationStatus(conversation)
    await createNotification({
      userId: conversation.student_id,
      type: 'feedback_closed',
      message: 'Ваш диалог с приемной комиссией закрыт',
      conversationId: conversation.id,
      meta: { status: 'closed' }
    })
    res.json({ data: conversation })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при закрытии диалога' })
  }
})

module.exports = router
