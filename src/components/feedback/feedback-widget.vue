<template>
  <div v-if="shouldShowWidget" class="feedback-widget">
    <el-badge :value="unreadMessages" :hidden="unreadMessages === 0" :max="99">
      <el-button
        class="feedback-widget__button"
        type="primary"
        circle
        size="large"
        :icon="feedbackStore.isOpen ? Close : ChatDotRound"
        aria-label="Обратная связь"
        @click="handleToggle"
      />
    </el-badge>

    <transition name="feedback-popover">
      <el-card
        v-if="feedbackStore.isOpen"
        shadow="always"
        class="feedback-widget__panel"
        body-class="feedback-widget__panel-body"
      >
        <template #header>
          <div class="feedback-widget__header">
            <div class="feedback-widget__header-user">
              <el-avatar :icon="Service" />
              <div>
                <div class="feedback-widget__title">Обратная связь</div>
                <el-text size="small" type="info">Приёмная комиссия онлайн</el-text>
              </div>
            </div>
            <el-button :icon="Close" text circle aria-label="Закрыть чат" @click="feedbackStore.closeWidget" />
          </div>
        </template>

        <div class="feedback-widget__body">
          <el-scrollbar ref="scrollbarRef" height="460px" class="feedback-widget__messages">
            <div ref="messagesRef" class="feedback-widget__messages-inner">
              <div v-if="feedbackStore.loadingMessages" class="feedback-widget__center">
                <el-icon class="is-loading"><Loading /></el-icon>
                <el-text type="info">Загрузка...</el-text>
              </div>

              <el-empty
                v-else-if="feedbackStore.messages.length === 0"
                description="Напишите нам, и мы ответим как можно скорее"
              />

              <div
                v-for="message in feedbackStore.messages"
                v-else
                :key="message.id"
                class="feedback-widget__message"
                :class="{ 'feedback-widget__message--own': message.sender_id === authStore.user?.id }"
              >
                <div class="feedback-widget__bubble">
                  <p v-if="message.text" class="feedback-widget__text">{{ message.text }}</p>

                  <Lightgallery
                    v-if="message.image_url"
                    class="feedback-widget__image-gallery"
                    :settings="{ speed: 400, download: false }"
                  >
                    <a
                      v-if="imageUrls[message.id]"
                      :href="imageUrls[message.id]"
                      class="feedback-widget__image-link"
                    >
                      <img :src="imageUrls[message.id]" alt="Прикрепленное изображение">
                    </a>
                    <el-button v-else size="small" text @click="loadImage(message)">
                      Загрузить изображение
                    </el-button>
                  </Lightgallery>

                  <div class="feedback-widget__meta">
                    <el-text size="small" type="info">
                      {{ formatTime(message.created_at) }}
                    </el-text>
                    <span
                      v-if="isOwnMessage(message)"
                      class="feedback-widget__read-status"
                      :class="{ 'feedback-widget__read-status--read': message.is_read }"
                      :title="message.is_read ? 'Прочитано' : 'Отправлено'"
                    >
                      <el-icon><Check /></el-icon>
                      <el-icon v-if="message.is_read"><Check /></el-icon>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </el-scrollbar>

          <div v-if="imagePreview" class="feedback-widget__preview">
            <el-image :src="imagePreview" fit="cover" />
            <el-button size="small" type="danger" text @click="removeImage">Удалить</el-button>
          </div>

          <div class="feedback-widget__footer">
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              accept="image/*"
              :on-change="onFileChange"
            >
              <el-button :icon="Paperclip" circle />
            </el-upload>

            <el-input
              ref="inputRef"
              v-model="inputText"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 4 }"
              resize="none"
              placeholder="Введите сообщение..."
              @keydown.enter.exact.prevent="send"
            />

            <el-button
              type="primary"
              :icon="Promotion"
              circle
              :loading="sending"
              :disabled="!inputText.trim() && !selectedFile"
              @click="send"
            />
          </div>
        </div>
      </el-card>
    </transition>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Lightgallery from 'lightgallery/vue'
import { ChatDotRound, Check, Close, Loading, Paperclip, Promotion, Service } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { feedback as feedbackApi, getAccessToken } from '@/api/app-api'
import { useAuthStore } from '@/stores/auth'
import { useFeedbackStore } from '@/stores/feedback'
import 'lightgallery/css/lightgallery.css'

const authStore = useAuthStore()
const feedbackStore = useFeedbackStore()

const scrollbarRef = ref(null)
const messagesRef = ref(null)
const inputRef = ref(null)
const inputText = ref('')
const selectedFile = ref(null)
const imagePreview = ref(null)
const imageUrls = ref({})
const sending = ref(false)
const socketInitialized = ref(false)
const tokenRetryTimer = ref(null)

const unreadMessages = computed(() => feedbackStore.unreadMessages)
const shouldShowWidget = computed(() => authStore.isAuthenticated && authStore.isApplicant)

async function handleToggle() {
  feedbackStore.toggleWidget()
  if (feedbackStore.isOpen) {
    await loadData()
    inputRef.value?.focus?.()
  }
}

async function loadData() {
  await feedbackStore.loadConversations()
  if (feedbackStore.conversations.length > 0) {
    await feedbackStore.selectConversation(feedbackStore.conversations[0].id)
  } else {
    feedbackStore.messages.length = 0
  }
  await preloadMessageImages()
  await nextTick()
  scrollToBottom()
}

function scrollToBottom() {
  const height = messagesRef.value?.scrollHeight || 0
  scrollbarRef.value?.setScrollTop(height)
}

function onFileChange(uploadFile) {
  const file = uploadFile.raw
  if (!file) return
  selectedFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

function removeImage() {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  selectedFile.value = null
  imagePreview.value = null
}

async function send() {
  if (sending.value) return

  const text = inputText.value.trim()
  if (!text && !selectedFile.value) return

  sending.value = true
  try {
    await feedbackStore.sendMessage({
      text: text || undefined,
      image: selectedFile.value || undefined
    })
    inputText.value = ''
    removeImage()
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error)
    ElMessage.error(error.message || 'Не удалось отправить сообщение')
  } finally {
    sending.value = false
  }
}

async function loadImage(message) {
  if (!feedbackStore.activeConversationId) return
  if (imageUrls.value[message.id]) return

  try {
    const { data, error } = await feedbackApi.getImageUrl(
      feedbackStore.activeConversationId,
      message.image_url
    )
    if (error) throw error
    if (data?.url) imageUrls.value[message.id] = data.url
  } catch (error) {
    console.error('Ошибка загрузки изображения:', error)
    ElMessage.error('Не удалось загрузить изображение')
  }
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function isOwnMessage(message) {
  return message.sender_id === authStore.user?.id
}

async function preloadMessageImages() {
  const imageMessages = feedbackStore.messages.filter((message) => {
    return message.image_url && !imageUrls.value[message.id]
  })

  await Promise.all(imageMessages.map((message) => loadImage(message)))
}

async function initializeSocket() {
  if (socketInitialized.value || !authStore.isAuthenticated) return

  const token = getAccessToken() || localStorage.getItem('app-access-token') || localStorage.getItem('app.auth.token')
  if (!token) {
    if (!tokenRetryTimer.value) {
      tokenRetryTimer.value = setTimeout(async () => {
        tokenRetryTimer.value = null
        await initializeSocket()
      }, 2000)
    }
    return
  }

  feedbackStore.initSocket(token)
  await feedbackStore.loadNotifications()
  socketInitialized.value = true
}

watch(() => feedbackStore.messages.length, async () => {
  await preloadMessageImages()
  await nextTick()
  scrollToBottom()
})

watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
  if (isAuthenticated) {
    await initializeSocket()
    return
  }

  feedbackStore.destroySocket()
  socketInitialized.value = false
})

onMounted(async () => {
  if (authStore.isAuthenticated) await initializeSocket()
})

onBeforeUnmount(() => {
  if (tokenRetryTimer.value) clearTimeout(tokenRetryTimer.value)
  removeImage()
  feedbackStore.destroySocket()
  socketInitialized.value = false
})
</script>

<style scoped>
.feedback-widget {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
}

.feedback-widget__button.el-button.is-circle {
  width: 56px;
  min-width: 56px;
  height: 56px;
  padding: 0;
  border-radius: 50%;
  font-size: 22px;
  aspect-ratio: 1 / 1;
  box-shadow: var(--el-box-shadow-dark);
}

.feedback-widget__panel {
  position: absolute;
  right: 0;
  bottom: 76px;
  width: min(460px, calc(100vw - 32px));
  overflow: visible;
  border-radius: 18px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.22);
}

.feedback-widget__panel::after {
  position: absolute;
  right: 24px;
  bottom: -10px;
  width: 20px;
  height: 20px;
  background: var(--el-bg-color);
  box-shadow: 6px 6px 12px rgba(15, 23, 42, 0.08);
  content: '';
  transform: rotate(45deg);
}

.feedback-widget__panel :deep(.el-card__header) {
  padding: 16px 18px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.feedback-widget__panel :deep(.feedback-widget__panel-body) {
  padding: 0;
}

.feedback-widget__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.feedback-widget__header-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.feedback-widget__title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.feedback-widget__body {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
}

.feedback-widget__messages {
  border: 0;
  border-radius: 0;
  background:
    radial-gradient(circle at 18px 18px, rgba(64, 158, 255, 0.08) 0 2px, transparent 2px 24px),
    linear-gradient(180deg, #eef6ff 0%, #f7fbff 100%);
}

.feedback-widget__messages-inner {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 440px;
  padding: 16px;
}

.feedback-widget__center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 300px;
}

.feedback-widget__message {
  display: flex;
  justify-content: flex-start;
}

.feedback-widget__message--own {
  justify-content: flex-end;
}

.feedback-widget__bubble {
  position: relative;
  max-width: 78%;
  padding: 9px 12px 6px;
  border-radius: 16px 16px 16px 4px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
}

.feedback-widget__message--own .feedback-widget__bubble {
  border-radius: 16px 16px 4px 16px;
  background: #dff1ff;
}

.feedback-widget__text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.feedback-widget__image-gallery {
  display: block;
  margin-top: 8px;
}

.feedback-widget__image-link {
  display: block;
  overflow: hidden;
  width: 240px;
  max-width: 100%;
  height: 170px;
  border-radius: 8px;
}

.feedback-widget__image-link img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.feedback-widget__meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
}

.feedback-widget__read-status {
  display: inline-flex;
  align-items: center;
  gap: 0;
  color: var(--el-text-color-placeholder);
}

.feedback-widget__read-status--read {
  color: var(--el-color-primary);
}

.feedback-widget__read-status .el-icon {
  width: 12px;
  margin-left: -3px;
  font-size: 12px;
}

.feedback-widget__preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.feedback-widget__preview :deep(.el-image) {
  width: 64px;
  height: 64px;
  border-radius: 8px;
}

.feedback-widget__footer {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.feedback-popover-enter-active,
.feedback-popover-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.feedback-popover-enter-from,
.feedback-popover-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}

@media (max-width: 480px) {
  .feedback-widget {
    right: 16px;
    bottom: 16px;
  }

  .feedback-widget__panel {
    bottom: 72px;
    width: calc(100vw - 32px);
  }
}
</style>
