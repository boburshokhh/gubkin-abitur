import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { feedback as feedbackApi } from '@/api/app-api'
import { useAuthStore } from '@/stores/auth'
import {
  connectFeedbackSocket,
  disconnectFeedbackSocket,
  joinConversation,
  markRead
} from '@/services/feedback-socket'

export const useFeedbackStore = defineStore('feedback', () => {
  const authStore = useAuthStore()
  const isOpen = ref(false)
  const conversations = ref([])
  const activeConversationId = ref(null)
  const messages = ref([])
  const notifications = ref([])
  const loadingMessages = ref(false)
  const loadingConversations = ref(false)
  const socketConnected = ref(false)
  const isSocketInitialized = ref(false)
  const latestRealtimeNotification = ref(null)

  const unreadNotifications = computed(() =>
    notifications.value.filter((n) => !n.is_read).length
  )

  const unreadMessages = computed(() => {
    if (!activeConversationId.value) return 0
    const conv = conversations.value.find((c) => c.id === activeConversationId.value)
    return conv ? Number(conv.unread_count || 0) : 0
  })

  const activeConversation = computed(() =>
    conversations.value.find((c) => c.id === activeConversationId.value) || null
  )

  // -------------------------------------------------------
  // Socket
  // -------------------------------------------------------
  function initSocket(token) {
    if (isSocketInitialized.value) return

    const socket = connectFeedbackSocket(token)
    isSocketInitialized.value = true

    socket.on('connect', async () => {
      socketConnected.value = true
      if (activeConversationId.value) {
        joinConversation(activeConversationId.value)
        await loadMessages(activeConversationId.value)
        await markMessagesRead(activeConversationId.value)
      }
      await loadConversations()
      await loadNotifications()
    })

    socket.on('disconnect', () => {
      socketConnected.value = false
    })

    socket.on('server:new_message', (msg) => {
      if (msg.conversation_id === activeConversationId.value) {
        const exists = messages.value.some((m) => m.id === msg.id)
        if (!exists) messages.value.push(msg)
        if (msg.sender_id !== authStore.user?.id) {
          markMessagesRead(msg.conversation_id)
        }
      }
      updateConversationLastMessage(msg.conversation_id)
    })

    socket.on('server:new_conversation_message', ({ conversation, message }) => {
      const idx = conversations.value.findIndex((c) => c.id === conversation.id)
      const shouldIncrementUnread = conversation.id !== activeConversationId.value
      if (idx === -1) {
        conversations.value.unshift({ ...conversation, unread_count: shouldIncrementUnread ? 1 : 0 })
      } else {
        conversations.value[idx] = {
          ...conversations.value[idx],
          last_message_at: conversation.last_message_at,
          unread_count: shouldIncrementUnread
            ? Number(conversations.value[idx].unread_count || 0) + 1
            : Number(conversations.value[idx].unread_count || 0)
        }
        conversations.value.sort((a, b) =>
          new Date(b.last_message_at) - new Date(a.last_message_at)
        )
      }
    })

    socket.on('server:message_read', ({ conversationId, readBy, messageIds = [] }) => {
      if (conversationId === activeConversationId.value) {
        const readMessageIds = new Set(messageIds)
        messages.value.forEach((message) => {
          const shouldMarkById = readMessageIds.size > 0 && readMessageIds.has(message.id)
          const shouldMarkByReader = readMessageIds.size === 0 && message.sender_id !== readBy
          if (shouldMarkById || shouldMarkByReader) {
            message.is_read = true
            message.read_by = readBy
            message.read_at = message.read_at || new Date().toISOString()
          }
        })
      }
      const conv = conversations.value.find((c) => c.id === conversationId)
      if (conv) conv.unread_count = 0
    })

    socket.on('server:new_notification', (notification) => {
      const exists = notifications.value.some((n) => n.id === notification.id)
      if (!exists) {
        notifications.value.unshift(notification)
        latestRealtimeNotification.value = notification
      }
    })

    socket.on('server:notifications_read', ({ conversationId, notificationIds = [] }) => {
      markConversationNotificationsRead(conversationId, notificationIds)
    })

    socket.on('server:conversation_status', (conversation) => {
      const idx = conversations.value.findIndex((c) => c.id === conversation.id)
      if (idx !== -1) {
        conversations.value[idx] = {
          ...conversations.value[idx],
          ...conversation
        }
      }

      if (activeConversationId.value === conversation.id) {
        const active = conversations.value.find((c) => c.id === conversation.id)
        if (active) active.status = conversation.status
      }
    })
  }

  function destroySocket() {
    disconnectFeedbackSocket()
    socketConnected.value = false
    isSocketInitialized.value = false
  }

  function updateConversationLastMessage(conversationId) {
    const conv = conversations.value.find((c) => c.id === conversationId)
    if (conv) {
      conv.last_message_at = new Date().toISOString()
      if (conversationId !== activeConversationId.value) {
        conv.unread_count = Number(conv.unread_count || 0) + 1
      }
      conversations.value.sort((a, b) =>
        new Date(b.last_message_at) - new Date(a.last_message_at)
      )
    }
  }

  // -------------------------------------------------------
  // Actions
  // -------------------------------------------------------
  async function loadConversations() {
    loadingConversations.value = true
    try {
      const { data, error } = await feedbackApi.getConversations()
      if (!error) conversations.value = data || []
    } finally {
      loadingConversations.value = false
    }
  }

  async function selectConversation(conversationId) {
    activeConversationId.value = conversationId
    joinConversation(conversationId)
    await loadMessages(conversationId)
    await markMessagesRead(conversationId)
  }

  async function loadMessages(conversationId) {
    loadingMessages.value = true
    try {
      const { data, error } = await feedbackApi.getMessages(conversationId)
      if (!error) messages.value = data || []
    } finally {
      loadingMessages.value = false
    }
  }

  async function sendMessage({ text, image }) {
    const { data, error } = await feedbackApi.sendMessage({
      conversationId: activeConversationId.value,
      text,
      image
    })
    if (error) throw error

    const isNewConversation = !activeConversationId.value
    if (isNewConversation) {
      activeConversationId.value = data.conversation_id
      joinConversation(data.conversation_id)
    }

    const exists = messages.value.some((m) => m.id === data.id)
    if (!exists) messages.value.push(data)

    if (isNewConversation) {
      await loadConversations()
    } else {
      updateConversationLastMessage(activeConversationId.value)
    }

    return data
  }

  async function markMessagesRead(conversationId) {
    const hasSocketRead = markRead(conversationId)
    if (!hasSocketRead) {
      const { data, error } = await feedbackApi.markConversationRead(conversationId)
      if (!error && data) {
        const readMessageIds = new Set(data.messageIds || [])
        messages.value.forEach((message) => {
          if (readMessageIds.has(message.id)) {
            message.is_read = true
            message.read_by = data.readBy
            message.read_at = message.read_at || new Date().toISOString()
          }
        })
        markConversationNotificationsRead(conversationId, data.notificationIds || [])
      }
    }
    const conv = conversations.value.find((c) => c.id === conversationId)
    if (conv) conv.unread_count = 0
    markConversationNotificationsRead(conversationId)
  }

  async function loadNotifications() {
    const { data, error } = await feedbackApi.getNotifications()
    if (!error) notifications.value = data || []
  }

  async function markNotificationRead(id) {
    await feedbackApi.markNotificationRead(id)
    const n = notifications.value.find((n) => n.id === id)
    if (n) n.is_read = true
  }

  function markConversationNotificationsRead(conversationId, notificationIds = []) {
    if (!conversationId) return

    const readIds = new Set(notificationIds)
    notifications.value.forEach((notification) => {
      const matchesById = readIds.size > 0 && readIds.has(notification.id)
      const matchesByConversation = String(notification.conversation_id) === String(conversationId)
      if (matchesById || matchesByConversation) {
        notification.is_read = true
      }
    })
  }

  async function markAllNotificationsRead() {
    await feedbackApi.markAllNotificationsRead()
    notifications.value.forEach((n) => { n.is_read = true })
  }

  function openWidget() {
    isOpen.value = true
  }

  function closeWidget() {
    isOpen.value = false
  }

  function toggleWidget() {
    isOpen.value = !isOpen.value
  }

  return {
    isOpen,
    conversations,
    activeConversationId,
    activeConversation,
    messages,
    notifications,
    loadingMessages,
    loadingConversations,
    socketConnected,
    latestRealtimeNotification,
    unreadNotifications,
    unreadMessages,
    initSocket,
    destroySocket,
    loadConversations,
    selectConversation,
    loadMessages,
    sendMessage,
    markMessagesRead,
    loadNotifications,
    markNotificationRead,
    markConversationNotificationsRead,
    markAllNotificationsRead,
    openWidget,
    closeWidget,
    toggleWidget
  }
})
