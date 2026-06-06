<template>
  <div v-if="shouldShowWidget" class="feedback-widget">
    <el-badge :value="totalUnread" :hidden="totalUnread === 0" :max="99">
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

    <el-dialog
      v-model="feedbackStore.isOpen"
      title="Обратная связь"
      width="380px"
      append-to-body
      class="feedback-widget__dialog"
      :close-on-click-modal="false"
      @opened="handleOpened"
    >
      <template #header>
        <div class="feedback-widget__header">
          <el-avatar :icon="Service" />
          <div>
            <div class="feedback-widget__title">Обратная связь</div>
            <el-text size="small" type="info">Приёмная комиссия</el-text>
          </div>
        </div>
      </template>

      <el-scrollbar ref="scrollbarRef" height="340px" class="feedback-widget__messages">
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
            <el-card shadow="never" class="feedback-widget__bubble">
              <p v-if="message.text" class="feedback-widget__text">{{ message.text }}</p>

              <div v-if="message.image_url" class="feedback-widget__image">
                <el-image
                  v-if="imageUrls[message.id]"
                  :src="imageUrls[message.id]"
                  :preview-src-list="[imageUrls[message.id]]"
                  fit="cover"
                  lazy
                />
                <el-button v-else size="small" text @click="loadImage(message)">
                  Загрузить изображение
                </el-button>
              </div>

              <el-text size="small" type="info" class="feedback-widget__time">
                {{ formatTime(message.created_at) }}
              </el-text>
            </el-card>
          </div>
        </div>
      </el-scrollbar>

      <div v-if="imagePreview" class="feedback-widget__preview">
        <el-image :src="imagePreview" fit="cover" />
        <el-button size="small" type="danger" text @click="removeImage">Удалить</el-button>
      </div>

      <template #footer>
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
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChatDotRound, Close, Loading, Paperclip, Promotion, Service } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { feedback as feedbackApi, getAccessToken } from '@/api/app-api'
import { useAuthStore } from '@/stores/auth'
import { useFeedbackStore } from '@/stores/feedback'

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

const totalUnread = computed(() => feedbackStore.unreadNotifications + feedbackStore.unreadMessages)
const shouldShowWidget = computed(() => authStore.isAuthenticated && authStore.isApplicant)

async function handleToggle() {
  feedbackStore.toggleWidget()
  if (feedbackStore.isOpen) await loadData()
}

async function handleOpened() {
  await nextTick()
  scrollToBottom()
  inputRef.value?.focus?.()
}

async function loadData() {
  await feedbackStore.loadConversations()
  if (feedbackStore.conversations.length > 0) {
    await feedbackStore.selectConversation(feedbackStore.conversations[0].id)
  } else {
    feedbackStore.messages.length = 0
  }
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

.feedback-widget__button {
  width: 56px;
  height: 56px;
  font-size: 22px;
  box-shadow: var(--el-box-shadow-dark);
}

.feedback-widget__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.feedback-widget__title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.feedback-widget__messages {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: var(--el-fill-color-lighter);
}

.feedback-widget__messages-inner {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 320px;
  padding: 12px;
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
  max-width: 82%;
  border-radius: 14px;
}

.feedback-widget__message--own .feedback-widget__bubble {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
}

.feedback-widget__text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.feedback-widget__image {
  margin-top: 8px;
}

.feedback-widget__image :deep(.el-image) {
  width: 180px;
  height: 140px;
  border-radius: 8px;
}

.feedback-widget__time {
  display: block;
  margin-top: 4px;
  text-align: right;
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
}

@media (max-width: 480px) {
  .feedback-widget {
    right: 16px;
    bottom: 16px;
  }
}
</style>
