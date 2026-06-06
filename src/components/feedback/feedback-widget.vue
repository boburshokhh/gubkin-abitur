<template>
  <div class="feedback-widget" v-if="authStore.isAuthenticated">
    <!-- Плавающая кнопка -->
    <button
      class="feedback-fab"
      :class="{ 'feedback-fab--open': feedbackStore.isOpen }"
      @click="handleToggle"
      aria-label="Обратная связь"
    >
      <span v-if="totalUnread > 0" class="feedback-fab__badge">
        {{ totalUnread > 99 ? '99+' : totalUnread }}
      </span>
      <svg v-if="!feedbackStore.isOpen" xmlns="http://www.w3.org/2000/svg" class="feedback-fab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="feedback-fab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Окно чата -->
    <transition name="chat-window">
      <div v-if="feedbackStore.isOpen" class="feedback-chat">
        <!-- Заголовок -->
        <div class="feedback-chat__header">
          <div class="feedback-chat__header-info">
            <div class="feedback-chat__avatar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div>
              <p class="feedback-chat__title">Обратная связь</p>
              <p class="feedback-chat__subtitle">Приёмная комиссия</p>
            </div>
          </div>
          <button class="feedback-chat__close" @click="feedbackStore.closeWidget">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Список сообщений -->
        <div class="feedback-chat__messages" ref="messagesContainer">
          <div v-if="feedbackStore.loadingMessages" class="feedback-chat__loading">
            <div class="feedback-chat__spinner"></div>
            <p>Загрузка...</p>
          </div>

          <div
            v-else-if="feedbackStore.messages.length === 0"
            class="feedback-chat__empty"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>Напишите нам, и мы ответим как можно скорее</p>
          </div>

          <template v-else>
            <div
              v-for="msg in feedbackStore.messages"
              :key="msg.id"
              class="feedback-chat__message"
              :class="msg.sender_id === authStore.user?.id ? 'feedback-chat__message--own' : 'feedback-chat__message--other'"
            >
              <div class="feedback-chat__bubble">
                <p v-if="msg.text" class="feedback-chat__text">{{ msg.text }}</p>
                <div v-if="msg.image_url" class="feedback-chat__image-wrapper">
                  <img
                    v-if="imageUrls[msg.id]"
                    :src="imageUrls[msg.id]"
                    class="feedback-chat__image"
                    alt="Изображение"
                    @click="openImage(imageUrls[msg.id])"
                  />
                  <button
                    v-else
                    class="feedback-chat__load-image"
                    @click="loadImage(msg)"
                  >
                    Загрузить изображение
                  </button>
                </div>
                <span class="feedback-chat__time">{{ formatTime(msg.created_at) }}</span>
              </div>
            </div>
          </template>
        </div>

        <!-- Предпросмотр изображения -->
        <div v-if="imagePreview" class="feedback-chat__preview">
          <img :src="imagePreview" alt="Preview" />
          <button class="feedback-chat__preview-remove" @click="removeImage">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Поле ввода -->
        <div class="feedback-chat__input-area">
          <label class="feedback-chat__attach" title="Прикрепить изображение">
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
            class="feedback-chat__textarea"
            placeholder="Введите сообщение..."
            rows="1"
            @keydown.enter.prevent="onEnter"
            @input="autoResize"
            ref="textarea"
          ></textarea>

          <button
            class="feedback-chat__send"
            :disabled="sending || (!inputText.trim() && !selectedFile)"
            @click="send"
          >
            <div v-if="sending" class="feedback-chat__spinner feedback-chat__spinner--small"></div>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </transition>
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

const totalUnread = computed(() =>
  feedbackStore.unreadNotifications + feedbackStore.unreadMessages
)

async function handleToggle() {
  feedbackStore.toggleWidget()
  if (feedbackStore.isOpen) {
    await loadData()
  }
}

async function loadData() {
  await feedbackStore.loadConversations()
  if (feedbackStore.conversations.length > 0) {
    const conv = feedbackStore.conversations[0]
    await feedbackStore.selectConversation(conv.id)
  } else {
    feedbackStore.messages.length = 0
  }
  await nextTick()
  scrollToBottom()
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

watch(() => feedbackStore.isOpen, async (val) => {
  if (val) {
    await nextTick()
    scrollToBottom()
  }
})

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
    if (textarea.value) {
      textarea.value.style.height = 'auto'
    }
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

function formatTime(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

let socketInitialized = false
let tokenRetryTimer = null

async function initializeSocket() {
  if (socketInitialized || !authStore.isAuthenticated) return
  const token = getAccessToken() || localStorage.getItem('app-access-token') || localStorage.getItem('app.auth.token')
  if (token) {
    feedbackStore.initSocket(token)
    await feedbackStore.loadNotifications()
    socketInitialized = true
  } else {
    // Retry once the token is available (auth may still be completing)
    if (!tokenRetryTimer) {
      tokenRetryTimer = setTimeout(async () => {
        tokenRetryTimer = null
        await initializeSocket()
      }, 2000)
    }
  }
}

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await initializeSocket()
  }
})

onBeforeUnmount(() => {
  if (tokenRetryTimer) clearTimeout(tokenRetryTimer)
  feedbackStore.destroySocket()
  socketInitialized = false
})

watch(() => authStore.isAuthenticated, async (val) => {
  if (val) {
    await initializeSocket()
  } else {
    feedbackStore.destroySocket()
    socketInitialized = false
  }
})
</script>

<style scoped>
.feedback-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.feedback-fab {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  flex-shrink: 0;
}

.feedback-fab:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
}

.feedback-fab--open {
  background: linear-gradient(135deg, #4b5563, #374151);
  box-shadow: 0 4px 16px rgba(55, 65, 81, 0.4);
}

.feedback-fab__icon {
  width: 26px;
  height: 26px;
}

.feedback-fab__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 10px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  line-height: 1;
}

/* Chat window */
.feedback-chat {
  width: 360px;
  max-height: 520px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 480px) {
  .feedback-widget {
    bottom: 16px;
    right: 16px;
  }

  .feedback-chat {
    width: calc(100vw - 32px);
    max-height: 70vh;
  }
}

.feedback-chat__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 14px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  flex-shrink: 0;
}

.feedback-chat__header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.feedback-chat__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feedback-chat__avatar svg {
  width: 22px;
  height: 22px;
  fill: white;
}

.feedback-chat__title {
  font-weight: 600;
  font-size: 15px;
  margin: 0;
}

.feedback-chat__subtitle {
  font-size: 12px;
  opacity: 0.85;
  margin: 2px 0 0;
}

.feedback-chat__close {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  cursor: pointer;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.feedback-chat__close:hover {
  background: rgba(255, 255, 255, 0.25);
}

.feedback-chat__close svg {
  width: 16px;
  height: 16px;
}

.feedback-chat__messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.feedback-chat__loading,
.feedback-chat__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex: 1;
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
  padding: 24px;
}

.feedback-chat__empty svg {
  width: 48px;
  height: 48px;
  opacity: 0.4;
}

.feedback-chat__message {
  display: flex;
  flex-direction: column;
}

.feedback-chat__message--own {
  align-items: flex-end;
}

.feedback-chat__message--other {
  align-items: flex-start;
}

.feedback-chat__bubble {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 14px;
  position: relative;
}

.feedback-chat__message--own .feedback-chat__bubble {
  background: #2563eb;
  color: white;
  border-bottom-right-radius: 4px;
}

.feedback-chat__message--other .feedback-chat__bubble {
  background: #f3f4f6;
  color: #111827;
  border-bottom-left-radius: 4px;
}

.feedback-chat__text {
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 2px;
  white-space: pre-wrap;
  word-break: break-word;
}

.feedback-chat__time {
  font-size: 10px;
  opacity: 0.6;
  display: block;
  text-align: right;
  margin-top: 2px;
}

.feedback-chat__image-wrapper {
  margin-top: 4px;
}

.feedback-chat__image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  cursor: pointer;
  object-fit: cover;
}

.feedback-chat__load-image {
  font-size: 12px;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.4);
  color: inherit;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
}

.feedback-chat__preview {
  position: relative;
  padding: 8px 16px 0;
  flex-shrink: 0;
}

.feedback-chat__preview img {
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.feedback-chat__preview-remove {
  position: absolute;
  top: 4px;
  left: 12px;
  width: 20px;
  height: 20px;
  background: #ef4444;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.feedback-chat__preview-remove svg {
  width: 12px;
  height: 12px;
}

.feedback-chat__input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 12px;
  border-top: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
}

.feedback-chat__attach {
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: 8px;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}

.feedback-chat__attach:hover {
  background: #f3f4f6;
  color: #2563eb;
}

.feedback-chat__attach svg {
  width: 20px;
  height: 20px;
}

.feedback-chat__textarea {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 8px 12px;
  font-size: 14px;
  resize: none;
  outline: none;
  font-family: inherit;
  line-height: 1.5;
  max-height: 120px;
  transition: border-color 0.15s;
}

.feedback-chat__textarea:focus {
  border-color: #2563eb;
}

.feedback-chat__send {
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
  transition: background 0.15s, transform 0.15s;
  flex-shrink: 0;
}

.feedback-chat__send:hover:not(:disabled) {
  background: #1d4ed8;
  transform: scale(1.05);
}

.feedback-chat__send:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.feedback-chat__send svg {
  width: 18px;
  height: 18px;
}

.feedback-chat__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.feedback-chat__spinner--small {
  width: 16px;
  height: 16px;
  border-width: 2px;
  border-color: rgba(255,255,255,0.4);
  border-top-color: white;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Transition */
.chat-window-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.chat-window-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.chat-window-enter-from,
.chat-window-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}
</style>
