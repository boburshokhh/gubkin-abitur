import { getAccessToken } from '@/api/app-api'
import { connectFeedbackSocket, getFeedbackSocket } from '@/services/feedback-socket'

function getStoredAccessToken() {
  return getAccessToken() || localStorage.getItem('app-access-token') || localStorage.getItem('app.auth.token')
}

export function subscribeApplicationUpdates(handler) {
  const token = getStoredAccessToken()
  const socket = getFeedbackSocket() || (token ? connectFeedbackSocket(token) : null)

  if (!socket) return () => {}

  socket.off('server:application_updated', handler)
  socket.on('server:application_updated', handler)

  return () => {
    socket.off('server:application_updated', handler)
  }
}
