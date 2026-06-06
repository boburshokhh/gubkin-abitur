import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || ''

let socket = null

export function connectFeedbackSocket(token) {
  if (socket?.connected) return socket

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000
  })

  return socket
}

export function disconnectFeedbackSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function getFeedbackSocket() {
  return socket
}

export function joinConversation(conversationId) {
  socket?.emit('client:join_conversation', conversationId)
}

export function markRead(conversationId) {
  if (!socket?.connected) return false
  socket.emit('client:mark_read', { conversationId })
  return true
}
