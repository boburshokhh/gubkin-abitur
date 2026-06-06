<template>
  <div class="fb-inbox">
    <!-- Панель со списком обращений -->
    <div class="fb-inbox__sidebar" :class="{ 'fb-inbox__sidebar--hidden': mobileShowChat }">
      <div class="fb-inbox__sidebar-header">
        <h3 class="fb-inbox__sidebar-title">Обращения</h3>
        <span v-if="totalUnread > 0" class="fb-inbox__badge">{{ totalUnread }}</span>
      </div>

      <div v-if="feedbackStore.loadingConversations" class="fb-inbox__placeholder">
        <div class="fb-inbox__spinner"></div>
        <p>Загрузка...</p>
      </div>

      <div v-else-if="feedbackStore.conversations.length === 0" class="fb-inbox__placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p>Обращений пока нет</p>
      </div>

      <ul v-else class="fb-inbox__list">
        <li
          v-for="conv in feedbackStore.conversations"
          :key="conv.id"
          class="fb-inbox__item"
          :class="{
            'fb-inbox__item--active': conv.id === feedbackStore.activeConversationId,
            'fb-inbox__item--unread': Number(conv.unread_count) > 0
          }"
          @click="selectConv(conv.id)"
        >
          <div class="fb-inbox__item-avatar">
            {{ initials(conv.student_first_name, conv.student_last_name) }}
          </div>
          <div class="fb-inbox__item-body">
            <div class="fb-inbox__item-top">
              <span class="fb-inbox__item-name">
                {{ conv.student_first_name }} {{ conv.student_last_name }}
              </span>
              <span class="fb-inbox__item-time">{{ formatDate(conv.last_message_at) }}</span>
            </div>
            <div class="fb-inbox__item-bottom">
              <span class="fb-inbox__item-email">{{ conv.student_email }}</span>
              <span
                v-if="Number(conv.unread_count) > 0"
                class="fb-inbox__item-unread-badge"
              >
                {{ conv.unread_count }}
              </span>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Область диалога -->
    <div class="fb-inbox__chat" :class="{ 'fb-inbox__chat--visible': mobileShowChat }">
      <!-- Заголовок диалога -->
      <div v-if="feedbackStore.activeConversationId" class="fb-inbox__chat-header">
        <button class="fb-inbox__back" @click="mobileShowChat = false">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div class="fb-inbox__chat-info">
          <p class="fb-inbox__chat-name">
            {{ feedbackStore.activeConversation?.student_first_name }}
            {{ feedbackStore.activeConversation?.student_last_name }}
          </p>
          <p class="fb-inbox__chat-email">{{ feedbackStore.activeConversation?.student_email }}</p>
        </div>
        <div class="fb-inbox__chat-actions">
          <span
            class="fb-inbox__status-badge"
            :class="feedbackStore.activeConversation?.status === 'open' ? 'fb-inbox__status-badge--open' : 'fb-inbox__status-badge--closed'"
          >
            {{ feedbackStore.activeConversation?.status === 'open' ? 'Открыто' : 'Закрыто' }}
          </span>
          <button
            v-if="feedbackStore.activeConversation?.status === 'open'"
            class="fb-inbox__close-btn"
            @click="closeConv"
          >
            Закрыть
          </button>
        </div>
      </div>

      <!-- Пустой placeholder -->
      <div v-else class="fb-inbox__chat-empty">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p>Выберите обращение слева</p>
      </div>

      <!-- Сообщения -->
      <div
        v-if="feedbackStore.activeConversationId"
        class="fb-inbox__messages"
        ref="messagesContainer"
      >
        <div v-if="feedbackStore.loadingMessages" class="fb-inbox__msgs-loading">
          <div class="fb-inbox__spinner"></div>
        </div>

        <div v-else-if="feedbackStore.messages.length === 0" class="fb-inbox__msgs-empty">
          <p>Нет сообщений</p>
        </div>

        <template v-else>
          <div
            v-for="msg in feedbackStore.messages"
            :key="msg.id"
            class="fb-inbox__msg"
            :class="msg.sender_role_id === 1 ? 'fb-inbox__msg--student' : 'fb-inbox__msg--staff'"
          >
            <div class="fb-inbox__msg-bubble">
              <span class="fb-inbox__msg-sender">
                {{ msg.sender_first_name }} {{ msg.sender_last_name }}
              </span>
              <p v-if="msg.text" class="fb-inbox__msg-text">{{ msg.text }}</p>
              <div v-if="msg.image_url" class="fb-inbox__msg-image">
                <img
                  v-if="imageUrls[msg.id]"
                  :src="imageUrls[msg.id]"
                  alt="Изображение"
                  @click="openImage(imageUrls[msg.id])"
                />
                <button v-else @click="loadImage(msg)">Показать изображение</button>
              </div>
              <span class="fb-inbox__msg-time">{{ formatTime(msg.created_at) }}</span>
            </div>
          </div>
        </template>
      </div>

      <!-- Поле ввода -->
      <div
        v-if="feedbackStore.activeConversationId && feedbackStore.activeConversation?.status === 'open'"
        class="fb-inbox__input-area"
      >
        <div v-if="imagePreview" class="fb-inbox__preview">
          <img :src="imagePreview" alt="preview" />
          <button @click="removeImage">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="fb-inbox__input-row">
          <label class="fb-inbox__attach">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="sr-only"
              @change="onFileChange"
            />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </label>

          <textarea
            v-model="inputText"
            class="fb-inbox__textarea"
            placeholder="Введите ответ..."
            rows="1"
            @keydown.enter.prevent="onEnter"
            @input="autoResize"
            ref="textarea"
          ></textarea>

          <button
            class="fb-inbox__send"
            :disabled="sending || (!inputText.trim() && !selectedFile)"
            @click="send"
          >
            <div v-if="sending" class="fb-inbox__spinner fb-inbox__spinner--small"></div>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>

      <div
        v-else-if="feedbackStore.activeConversationId && feedbackStore.activeConversation?.status === 'closed'"
        class="fb-inbox__closed-notice"
      >
        Диалог закрыт
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFeedbackStore } from '@/stores/feedback'
import { feedback as feedbackApi, getAccessToken } from '@/api/app-api'

const authStore = useAuthStore()
const feedbackStore = useFeedbackStore()

const messagesContainer = ref(null)
const fileInput = ref(null)
const textarea = ref(null)
const inputText = ref('')
const selectedFile = ref(null)
const imagePreview = ref(null)
const imageUrls = ref({})
const sending = ref(false)
const mobileShowChat = ref(false)

const totalUnread = computed(() =>
  feedbackStore.conversations.reduce((acc, c) => acc + Number(c.unread_count || 0), 0)
)

async function selectConv(id) {
  mobileShowChat.value = true
  await feedbackStore.selectConversation(id)
  await nextTick()
  scrollToBottom()
}

async function closeConv() {
  if (!feedbackStore.activeConversationId) return
  await feedbackApi.closeConversation(feedbackStore.activeConversationId)
  const conv = feedbackStore.conversations.find(c => c.id === feedbackStore.activeConversationId)
  if (conv) conv.status = 'closed'
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(() => feedbackStore.messages.length, async () => {
  await nextTick()
  scrollToBottom()
})

function initials(first, last) {
  return [(first || '?')[0], (last || '')[0]].filter(Boolean).join('').toUpperCase()
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  selectedFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

function removeImage() {
  selectedFile.value = null
  imagePreview.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function onEnter(e) {
  if (e.shiftKey) return
  send()
}

function autoResize() {
  const el = textarea.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

async function send() {
  if (sending.value) return
  const text = inputText.value.trim()
  if (!text && !selectedFile.value) return
  sending.value = true
  try {
    await feedbackStore.sendMessage({ text: text || undefined, image: selectedFile.value || undefined })
    inputText.value = ''
    removeImage()
    if (textarea.value) textarea.value.style.height = 'auto'
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Ошибка отправки:', err)
  } finally {
    sending.value = false
  }
}

async function loadImage(msg) {
  if (!feedbackStore.activeConversationId) return
  try {
    const { data } = await feedbackApi.getImageUrl(feedbackStore.activeConversationId, msg.image_url)
    if (data?.url) imageUrls.value[msg.id] = data.url
  } catch (err) {
    console.error('Ошибка загрузки изображения:', err)
  }
}

function openImage(url) {
  window.open(url, '_blank')
}

let socketInitialized = false

async function initSocket() {
  if (socketInitialized) return
  const token = getAccessToken() || localStorage.getItem('app-access-token') || localStorage.getItem('app.auth.token')
  if (token) {
    feedbackStore.initSocket(token)
    socketInitialized = true
  }
}

onMounted(async () => {
  await initSocket()
  await feedbackStore.loadConversations()
})

onBeforeUnmount(() => {
  socketInitialized = false
})
</script>

<style scoped>
.fb-inbox {
  display: flex;
  height: 600px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

/* Sidebar */
.fb-inbox__sidebar {
  width: 300px;
  min-width: 240px;
  flex-shrink: 0;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fb-inbox__sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.fb-inbox__sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.fb-inbox__badge {
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.fb-inbox__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex: 1;
  color: #9ca3af;
  font-size: 13px;
  padding: 20px;
  text-align: center;
}

.fb-inbox__placeholder svg {
  width: 40px;
  height: 40px;
  opacity: 0.4;
}

.fb-inbox__list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
}

.fb-inbox__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.12s;
}

.fb-inbox__item:hover {
  background: #f9fafb;
}

.fb-inbox__item--active {
  background: #eff6ff;
}

.fb-inbox__item--unread .fb-inbox__item-name {
  font-weight: 700;
}

.fb-inbox__item-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fb-inbox__item-body {
  flex: 1;
  min-width: 0;
}

.fb-inbox__item-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px;
}

.fb-inbox__item-name {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fb-inbox__item-time {
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
  flex-shrink: 0;
}

.fb-inbox__item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
}

.fb-inbox__item-email {
  font-size: 11px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fb-inbox__item-unread-badge {
  background: #2563eb;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 8px;
  flex-shrink: 0;
}

/* Chat area */
.fb-inbox__chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.fb-inbox__chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #9ca3af;
  font-size: 14px;
}

.fb-inbox__chat-empty svg {
  width: 52px;
  height: 52px;
  opacity: 0.3;
}

.fb-inbox__chat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
}

.fb-inbox__back {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: none;
  align-items: center;
  padding: 4px;
  border-radius: 6px;
}

.fb-inbox__back svg {
  width: 20px;
  height: 20px;
}

.fb-inbox__chat-info {
  flex: 1;
}

.fb-inbox__chat-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.fb-inbox__chat-email {
  font-size: 12px;
  color: #6b7280;
  margin: 2px 0 0;
}

.fb-inbox__chat-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fb-inbox__status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

.fb-inbox__status-badge--open {
  background: #dcfce7;
  color: #166534;
}

.fb-inbox__status-badge--closed {
  background: #f3f4f6;
  color: #6b7280;
}

.fb-inbox__close-btn {
  font-size: 12px;
  padding: 4px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  color: #374151;
  transition: background 0.12s;
}

.fb-inbox__close-btn:hover {
  background: #f9fafb;
}

.fb-inbox__messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fb-inbox__msgs-loading,
.fb-inbox__msgs-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #9ca3af;
  font-size: 13px;
}

.fb-inbox__msg {
  display: flex;
  flex-direction: column;
}

.fb-inbox__msg--student {
  align-items: flex-start;
}

.fb-inbox__msg--staff {
  align-items: flex-end;
}

.fb-inbox__msg-bubble {
  max-width: 75%;
  padding: 8px 12px;
  border-radius: 14px;
  font-size: 14px;
}

.fb-inbox__msg--student .fb-inbox__msg-bubble {
  background: #f3f4f6;
  color: #111827;
  border-bottom-left-radius: 4px;
}

.fb-inbox__msg--staff .fb-inbox__msg-bubble {
  background: #2563eb;
  color: white;
  border-bottom-right-radius: 4px;
}

.fb-inbox__msg-sender {
  display: block;
  font-size: 11px;
  font-weight: 600;
  opacity: 0.7;
  margin-bottom: 2px;
}

.fb-inbox__msg-text {
  margin: 0 0 2px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.fb-inbox__msg-time {
  display: block;
  font-size: 10px;
  opacity: 0.6;
  text-align: right;
  margin-top: 2px;
}

.fb-inbox__msg-image img {
  max-width: 200px;
  max-height: 180px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 4px;
  object-fit: cover;
}

.fb-inbox__msg-image button {
  font-size: 12px;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.4);
  color: inherit;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  margin-top: 4px;
}

.fb-inbox__input-area {
  border-top: 1px solid #e5e7eb;
  padding: 10px 12px;
  background: white;
  flex-shrink: 0;
}

.fb-inbox__preview {
  position: relative;
  display: inline-block;
  margin-bottom: 8px;
}

.fb-inbox__preview img {
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
}

.fb-inbox__preview button {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  background: #ef4444;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.fb-inbox__preview button svg {
  width: 10px;
  height: 10px;
}

.fb-inbox__input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.fb-inbox__attach {
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: 8px;
  transition: background 0.12s, color 0.12s;
  flex-shrink: 0;
}

.fb-inbox__attach:hover {
  background: #f3f4f6;
  color: #2563eb;
}

.fb-inbox__attach svg {
  width: 20px;
  height: 20px;
}

.fb-inbox__textarea {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 14px;
  resize: none;
  outline: none;
  font-family: inherit;
  line-height: 1.5;
  max-height: 120px;
  transition: border-color 0.15s;
}

.fb-inbox__textarea:focus {
  border-color: #2563eb;
}

.fb-inbox__send {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  flex-shrink: 0;
}

.fb-inbox__send:hover:not(:disabled) {
  background: #1d4ed8;
}

.fb-inbox__send:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.fb-inbox__send svg {
  width: 18px;
  height: 18px;
}

.fb-inbox__closed-notice {
  border-top: 1px solid #e5e7eb;
  padding: 12px;
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
  flex-shrink: 0;
}

.fb-inbox__spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: fbspin 0.7s linear infinite;
}

.fb-inbox__spinner--small {
  width: 16px;
  height: 16px;
  border-width: 2px;
  border-color: rgba(255,255,255,0.4);
  border-top-color: white;
}

@keyframes fbspin {
  to { transform: rotate(360deg); }
}

/* Mobile: show sidebar/chat as layers */
@media (max-width: 640px) {
  .fb-inbox {
    height: 500px;
    position: relative;
  }

  .fb-inbox__sidebar--hidden {
    display: none;
  }

  .fb-inbox__chat {
    display: none;
  }

  .fb-inbox__chat--visible {
    display: flex;
    position: absolute;
    inset: 0;
    z-index: 2;
    background: white;
  }

  .fb-inbox__back {
    display: flex;
  }
}
</style>
