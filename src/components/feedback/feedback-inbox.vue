<template>
  <el-card shadow="never" class="feedback-inbox">
    <template #header>
      <div class="feedback-inbox__header">
        <div>
          <h2 class="feedback-inbox__title">Обращения</h2>
          <el-text type="info">Диалоги студентов с приёмной комиссией</el-text>
        </div>
        <el-badge :value="totalUnread" :hidden="totalUnread === 0" :max="99">
          <el-button :icon="Refresh" :loading="feedbackStore.loadingConversations" @click="reload">
            Обновить
          </el-button>
        </el-badge>
      </div>
    </template>

    <el-row :gutter="12" class="feedback-inbox__layout">
      <el-col
        :xs="24"
        :md="8"
        class="feedback-inbox__conversations"
        :class="{ 'feedback-inbox__conversations--hidden-mobile': isMobileDialogOpen }"
      >
        <el-card shadow="never" class="feedback-inbox__panel">
          <template #header>
            <div class="feedback-inbox__panel-header">
              <el-text tag="strong">Список обращений</el-text>
              <el-tag type="info" effect="plain">{{ feedbackStore.conversations.length }}</el-tag>
            </div>
          </template>

          <el-scrollbar class="feedback-inbox__conversation-scroll">
            <div v-if="feedbackStore.loadingConversations" class="feedback-inbox__center">
              <el-icon class="is-loading"><Loading /></el-icon>
              <el-text type="info">Загрузка...</el-text>
            </div>

            <el-empty
              v-else-if="feedbackStore.conversations.length === 0"
              description="Обращений пока нет"
            />

            <el-menu
              v-else
              :default-active="feedbackStore.activeConversationId || undefined"
              class="feedback-inbox__menu"
              @select="selectConversation"
            >
              <el-menu-item
                v-for="conversation in feedbackStore.conversations"
                :key="conversation.id"
                :index="conversation.id"
              >
                <div class="feedback-inbox__conversation">
                  <el-avatar size="small">
                    {{ getInitials(conversation) }}
                  </el-avatar>

                  <div class="feedback-inbox__conversation-main">
                    <div class="feedback-inbox__conversation-top">
                      <span class="feedback-inbox__conversation-name">
                        {{ getStudentName(conversation) }}
                      </span>
                      <el-text size="small" type="info">
                        {{ formatDate(conversation.last_message_at) }}
                      </el-text>
                    </div>

                    <div class="feedback-inbox__conversation-bottom">
                      <el-text size="small" truncated>
                        {{ conversation.student_email || 'Без email' }}
                      </el-text>
                      <el-badge
                        :value="Number(conversation.unread_count || 0)"
                        :hidden="Number(conversation.unread_count || 0) === 0"
                        :max="99"
                      />
                    </div>
                  </div>
                </div>
              </el-menu-item>
            </el-menu>
          </el-scrollbar>
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :md="16"
        class="feedback-inbox__dialog"
        :class="{ 'feedback-inbox__dialog--open-mobile': isMobileDialogOpen }"
      >
        <el-card shadow="never" class="feedback-inbox__panel">
          <template #header>
            <div v-if="feedbackStore.activeConversation" class="feedback-inbox__dialog-header">
              <div class="feedback-inbox__dialog-user">
                <el-button
                  class="feedback-inbox__back"
                  :icon="ArrowLeft"
                  text
                  circle
                  aria-label="Назад к списку обращений"
                  @click="isMobileDialogOpen = false"
                />
                <div>
                <el-text tag="strong">{{ getStudentName(feedbackStore.activeConversation) }}</el-text>
                <br>
                <el-text size="small" type="info">
                  {{ feedbackStore.activeConversation.student_email || 'Без email' }}
                </el-text>
                </div>
              </div>

              <el-space wrap>
                <el-tag
                  :type="feedbackStore.activeConversation.status === 'open' ? 'success' : 'info'"
                  effect="light"
                >
                  {{ feedbackStore.activeConversation.status === 'open' ? 'Открыто' : 'Закрыто' }}
                </el-tag>
                <el-button
                  v-if="feedbackStore.activeConversation.status === 'open'"
                  size="small"
                  type="warning"
                  plain
                  @click="closeConversation"
                >
                  Закрыть
                </el-button>
              </el-space>
            </div>

            <el-text v-else tag="strong">Диалог</el-text>
          </template>

          <div v-if="!feedbackStore.activeConversationId" class="feedback-inbox__empty-dialog">
            <el-empty description="Выберите обращение слева" />
          </div>

          <template v-else>
            <el-scrollbar ref="scrollbarRef" class="feedback-inbox__messages">
              <div ref="messagesRef" class="feedback-inbox__messages-inner">
                <div v-if="feedbackStore.loadingMessages" class="feedback-inbox__center">
                  <el-icon class="is-loading"><Loading /></el-icon>
                </div>

                <el-empty
                  v-else-if="feedbackStore.messages.length === 0"
                  description="Нет сообщений"
                />

                <div
                  v-for="message in feedbackStore.messages"
                  v-else
                  :key="message.id"
                  class="feedback-inbox__message"
                  :class="{ 'feedback-inbox__message--staff': message.sender_role_id !== 1 }"
                >
                  <el-card shadow="never" class="feedback-inbox__bubble">
                    <el-text size="small" type="info">
                      {{ message.sender_first_name }} {{ message.sender_last_name }}
                    </el-text>

                    <p v-if="message.text" class="feedback-inbox__text">{{ message.text }}</p>

                    <Lightgallery
                      v-if="message.image_url"
                      class="feedback-inbox__image-gallery"
                      :settings="{ speed: 400, download: false }"
                    >
                      <a
                        v-if="imageUrls[message.id]"
                        :href="imageUrls[message.id]"
                        class="feedback-inbox__image-link"
                      >
                        <img :src="imageUrls[message.id]" alt="Прикрепленное изображение">
                      </a>
                      <el-button v-else size="small" text @click="loadImage(message)">
                        Показать изображение
                      </el-button>
                    </Lightgallery>

                    <div class="feedback-inbox__meta">
                      <el-text size="small" type="info">
                        {{ formatTime(message.created_at) }}
                      </el-text>
                      <span
                        v-if="isOwnMessage(message)"
                        class="feedback-inbox__read-status"
                        :class="{ 'feedback-inbox__read-status--read': message.is_read }"
                        :title="message.is_read ? 'Прочитано' : 'Отправлено'"
                      >
                        <el-icon><Check /></el-icon>
                        <el-icon v-if="message.is_read"><Check /></el-icon>
                      </span>
                    </div>
                  </el-card>
                </div>
              </div>
            </el-scrollbar>

            <el-alert
              v-if="feedbackStore.activeConversation?.status === 'closed'"
              title="Диалог закрыт"
              type="info"
              show-icon
              :closable="false"
              class="feedback-inbox__closed"
            />

            <div v-else class="feedback-inbox__composer">
              <div v-if="imagePreview" class="feedback-inbox__preview">
                <el-image :src="imagePreview" fit="cover" />
                <el-button size="small" type="danger" text @click="removeImage">Удалить</el-button>
              </div>

              <div class="feedback-inbox__composer-row">
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
                  placeholder="Введите ответ..."
                  @keydown.enter.exact.prevent="send"
                />

                <el-button
                  type="primary"
                  :icon="Promotion"
                  :loading="sending"
                  :disabled="!inputText.trim() && !selectedFile"
                  circle
                  @click="send"
                />
              </div>
            </div>
          </template>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Lightgallery from 'lightgallery/vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Check, Loading, Paperclip, Promotion, Refresh } from '@element-plus/icons-vue'
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
const isMobileDialogOpen = ref(false)

const totalUnread = computed(() =>
  feedbackStore.conversations.reduce((count, conversation) => {
    return count + Number(conversation.unread_count || 0)
  }, 0)
)

async function reload() {
  await feedbackStore.loadConversations()
}

async function selectConversation(conversationId) {
  await feedbackStore.selectConversation(conversationId)
  isMobileDialogOpen.value = true
  await preloadMessageImages()
  await nextTick()
  scrollToBottom()
  inputRef.value?.focus?.()
}

async function closeConversation() {
  if (!feedbackStore.activeConversationId) return

  try {
    const { error } = await feedbackApi.closeConversation(feedbackStore.activeConversationId)
    if (error) throw error

    const conversation = feedbackStore.conversations.find((item) => {
      return item.id === feedbackStore.activeConversationId
    })
    if (conversation) conversation.status = 'closed'
    ElMessage.success('Диалог закрыт')
  } catch (error) {
    console.error('Ошибка закрытия диалога:', error)
    ElMessage.error(error.message || 'Не удалось закрыть диалог')
  }
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
    console.error('Ошибка отправки ответа:', error)
    ElMessage.error(error.message || 'Не удалось отправить ответ')
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

function getStudentName(conversation) {
  const name = [
    conversation?.student_first_name,
    conversation?.student_last_name
  ].filter(Boolean).join(' ')

  return name || 'Студент'
}

function getInitials(conversation) {
  return [
    conversation?.student_first_name?.[0],
    conversation?.student_last_name?.[0]
  ].filter(Boolean).join('').toUpperCase() || 'С'
}

function formatDate(value) {
  if (!value) return ''

  const date = new Date(value)
  const today = new Date()
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
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

function initSocket() {
  if (socketInitialized.value) return

  const token = getAccessToken() || localStorage.getItem('app-access-token') || localStorage.getItem('app.auth.token')
  if (!token) return

  feedbackStore.initSocket(token)
  socketInitialized.value = true
}

watch(() => feedbackStore.messages.length, async () => {
  await preloadMessageImages()
  await nextTick()
  scrollToBottom()
})

onMounted(async () => {
  initSocket()
  await feedbackStore.loadConversations()
})

onBeforeUnmount(() => {
  removeImage()
  socketInitialized.value = false
})
</script>

<style scoped>
.feedback-inbox {
  width: 100%;
}

.feedback-inbox :deep(.el-card__body) {
  padding: 12px;
}

.feedback-inbox__header,
.feedback-inbox__panel-header,
.feedback-inbox__dialog-header,
.feedback-inbox__conversation-top,
.feedback-inbox__conversation-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.feedback-inbox__title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.feedback-inbox__layout {
  min-height: min(680px, calc(100vh - 230px));
}

.feedback-inbox__panel {
  overflow: hidden;
  height: 100%;
  border-radius: 14px;
}

.feedback-inbox__panel :deep(.el-card__header) {
  padding: 10px 12px;
}

.feedback-inbox__conversation-scroll {
  height: min(610px, calc(100vh - 300px));
}

.feedback-inbox__menu {
  border-right: none;
}

.feedback-inbox__menu :deep(.el-menu-item) {
  height: auto;
  min-height: 58px;
  padding: 8px 10px;
  border-radius: 10px;
  margin-bottom: 4px;
  white-space: normal;
}

.feedback-inbox__conversation {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  gap: 8px;
}

.feedback-inbox__conversation-main {
  flex: 1;
  min-width: 0;
}

.feedback-inbox__conversation-name {
  overflow: hidden;
  color: var(--el-text-color-primary);
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feedback-inbox__dialog-user {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
}

.feedback-inbox__back {
  display: none;
  flex: 0 0 auto;
}

.feedback-inbox__center,
.feedback-inbox__empty-dialog {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: min(520px, calc(100vh - 330px));
  gap: 8px;
}

.feedback-inbox__messages {
  height: min(520px, calc(100vh - 390px));
  min-height: 360px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background:
    radial-gradient(circle at 18px 18px, rgba(64, 158, 255, 0.07) 0 2px, transparent 2px 24px),
    linear-gradient(180deg, #eef6ff 0%, #f8fbff 100%);
}

.feedback-inbox__messages-inner {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 100%;
  padding: 12px;
}

.feedback-inbox__message {
  display: flex;
  justify-content: flex-start;
}

.feedback-inbox__message--staff {
  justify-content: flex-end;
}

.feedback-inbox__bubble {
  max-width: min(72%, 560px);
  border: 0;
  border-radius: 16px 16px 16px 4px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
}

.feedback-inbox__bubble :deep(.el-card__body) {
  padding: 8px 10px 6px;
}

.feedback-inbox__message--staff .feedback-inbox__bubble {
  border-radius: 16px 16px 4px 16px;
  background: #dff1ff;
}

.feedback-inbox__text {
  margin: 4px 0 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.feedback-inbox__image-gallery {
  display: block;
  margin-top: 8px;
}

.feedback-inbox__image-link {
  display: block;
  overflow: hidden;
  width: 210px;
  max-width: 100%;
  height: 148px;
  border-radius: 8px;
}

.feedback-inbox__image-link img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.feedback-inbox__meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
}

.feedback-inbox__read-status {
  display: inline-flex;
  align-items: center;
  color: var(--el-text-color-placeholder);
}

.feedback-inbox__read-status--read {
  color: var(--el-color-primary);
}

.feedback-inbox__read-status .el-icon {
  width: 12px;
  margin-left: -3px;
  font-size: 12px;
}

.feedback-inbox__closed,
.feedback-inbox__composer {
  margin-top: 12px;
}

.feedback-inbox__composer {
  position: sticky;
  bottom: 0;
  padding-top: 2px;
  background: var(--el-bg-color);
}

.feedback-inbox__preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.feedback-inbox__preview :deep(.el-image) {
  width: 64px;
  height: 64px;
  border-radius: 8px;
}

.feedback-inbox__composer-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

@media (max-width: 768px) {
  .feedback-inbox :deep(.el-card__body) {
    padding: 8px;
  }

  .feedback-inbox__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .feedback-inbox__conversations--hidden-mobile {
    display: none;
  }

  .feedback-inbox__dialog {
    display: none;
    margin-top: 0;
  }

  .feedback-inbox__dialog--open-mobile {
    display: block;
  }

  .feedback-inbox__back {
    display: inline-flex;
  }

  .feedback-inbox__layout {
    min-height: auto;
  }

  .feedback-inbox__conversation-scroll,
  .feedback-inbox__messages {
    height: calc(100vh - 260px);
    min-height: 360px;
  }

  .feedback-inbox__bubble {
    max-width: 86%;
  }
}

@media (max-width: 480px) {
  .feedback-inbox__conversation-scroll,
  .feedback-inbox__messages {
    height: calc(100vh - 235px);
    min-height: 320px;
  }

  .feedback-inbox__bubble {
    max-width: 92%;
  }

  .feedback-inbox__image-link {
    width: 190px;
    height: 132px;
  }
}
</style>
