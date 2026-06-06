const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config/auth')
const { isSessionActive } = require('../services/auth/token-service')
const db = require('../config/db')

let io = null

function getIo() {
  return io
}

function initFeedbackSocket(socketIoInstance) {
  io = socketIoInstance

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('auth_required'))

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      if (!decoded.session_id || !(await isSessionActive(decoded.session_id))) {
        return next(new Error('session_expired'))
      }
      socket.user = {
        id: decoded.sub,
        email: decoded.email,
        role_id: decoded.role_id,
        session_id: decoded.session_id
      }
      next()
    } catch {
      next(new Error('invalid_token'))
    }
  })

  io.on('connection', (socket) => {
    const { id, role_id } = socket.user
    const roleId = Number(role_id)

    socket.join(`user:${id}`)

    if (roleId === 2 || roleId === 3) {
      socket.join('staff')
    }

    socket.on('client:join_conversation', async (conversationId) => {
      try {
        const access = await canAccessConversation(id, roleId, conversationId)
        if (access) socket.join(`conversation:${conversationId}`)
      } catch (err) {
        console.error('join_conversation error:', err.message)
      }
    })

    socket.on('client:mark_read', async ({ conversationId }) => {
      try {
        const access = await canAccessConversation(id, roleId, conversationId)
        if (!access) return

        const readResult = await db.query(
          `UPDATE messages
           SET is_read = TRUE, read_at = NOW(), read_by = $2
           WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE
           RETURNING id`,
          [conversationId, id]
        )
        const messageIds = readResult.rows.map((row) => row.id)

        emitMessageRead({ conversationId, readBy: id, messageIds })
      } catch (err) {
        console.error('mark_read error:', err.message)
      }
    })

    socket.on('disconnect', () => {})
  })
}

async function canAccessConversation(userId, roleId, conversationId) {
  if (roleId === 2 || roleId === 3) return true
  const result = await db.query(
    'SELECT id FROM conversations WHERE id = $1 AND student_id = $2',
    [conversationId, userId]
  )
  return result.rows.length > 0
}

async function emitNewMessage(message, conversation) {
  if (!io) return

  io.to(`conversation:${conversation.id}`).emit('server:new_message', message)

  if (message.sender_id === conversation.student_id) {
    io.to('staff').emit('server:new_conversation_message', {
      conversation,
      message
    })
  } else {
    io.to(`user:${conversation.student_id}`).emit('server:new_message', message)
  }
}

async function emitNotification(userId, notification) {
  if (!io) return
  io.to(`user:${userId}`).emit('server:new_notification', notification)
}

function emitConversationStatus(conversation) {
  if (!io) return
  io.to(`conversation:${conversation.id}`).emit('server:conversation_status', conversation)
  io.to(`user:${conversation.student_id}`).emit('server:conversation_status', conversation)
  io.to('staff').emit('server:conversation_status', conversation)
}

function emitMessageRead({ conversationId, readBy, messageIds = [] }) {
  if (!io) return
  io.to(`conversation:${conversationId}`).emit('server:message_read', {
    conversationId,
    readBy,
    messageIds
  })
}

module.exports = {
  initFeedbackSocket,
  getIo,
  emitNewMessage,
  emitNotification,
  emitConversationStatus,
  emitMessageRead
}
