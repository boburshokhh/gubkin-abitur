<template>
  <div v-if="shouldShowWidget" class="staff-feedback-widget">
    <el-badge :value="totalUnread" :hidden="totalUnread === 0" :max="99">
      <el-button
        class="staff-feedback-widget__button"
        type="primary"
        circle
        size="large"
        :icon="feedbackStore.isOpen ? Close : ChatDotRound"
        aria-label="Обращения студентов"
        @click="handleToggle"
      />
    </el-badge>

    <transition name="staff-feedback-widget">
      <el-card
        v-if="feedbackStore.isOpen"
        shadow="always"
        class="staff-feedback-widget__panel"
        body-class="staff-feedback-widget__panel-body"
      >
        <template #header>
          <div class="staff-feedback-widget__header">
            <div class="staff-feedback-widget__header-user">
              <el-avatar :icon="Service" />
              <div>
                <div class="staff-feedback-widget__title">Обращения</div>
                <el-text size="small" type="info">Мессенджер приёмной комиссии</el-text>
              </div>
            </div>
            <el-button
              :icon="Close"
              text
              circle
              aria-label="Закрыть обращения"
              @click="feedbackStore.closeWidget"
            />
          </div>
        </template>

        <div class="staff-feedback-widget__messenger">
          <aside
            class="staff-feedback-widget__sidebar"
            :class="{ 'staff-feedback-widget__sidebar--hidden-mobile': feedbackStore.activeConversationId }"
          >
            <div class="staff-feedback-widget__sidebar-head">
              <div>
                <el-text tag="strong">Чаты</el-text>
                <el-text size="small" type="info">{{ feedbackStore.conversations.length }} диалогов</el-text>
              </div>
              <el-button
                :icon="Refresh"
                :loading="feedbackStore.loadingConversations"
                text
                circle
                aria-label="Обновить обращения"
                @click="reload"
              />
            </div>

            <el-scrollbar class="staff-feedback-widget__chat-list">
              <div v-if="feedbackStore.loadingConversations" class="staff-feedback-widget__center">
                <el-icon class="is-loading"><Loading /></el-icon>
                <el-text type="info">Загрузка...</el-text>
              </div>

              <el-empty
                v-else-if="feedbackStore.conversations.length === 0"
                description="Обращений пока нет"
                :image-size="80"
              />

              <button
                v-for="conversation in feedbackStore.conversations"
                v-else
                :key="conversation.id"
                type="button"
                class="staff-feedback-widget__chat-item"
                :class="{ 'staff-feedback-widget__chat-item--active': conversation.id === feedbackStore.activeConversationId }"
                @click="selectConversation(conversation.id)"
              >
                <el-avatar size="small">{{ getInitials(conversation) }}</el-avatar>
                <div class="staff-feedback-widget__chat-main">
                  <div class="staff-feedback-widget__chat-top">
                    <span>{{ getStudentName(conversation) }}</span>
                    <time>{{ formatDate(conversation.last_message_at) }}</time>
                  </div>
                  <div class="staff-feedback-widget__chat-bottom">
                    <span>{{ conversation.student_email || 'Без email' }}</span>
                    <el-badge
                      :value="Number(conversation.unread_count || 0)"
                      :hidden="Number(conversation.unread_count || 0) === 0"
                      :max="99"
                    />
                  </div>
                </div>
              </button>
            </el-scrollbar>
          </aside>

          <section
            class="staff-feedback-widget__dialog"
            :class="{ 'staff-feedback-widget__dialog--open-mobile': feedbackStore.activeConversationId }"
          >
            <div v-if="!feedbackStore.activeConversationId" class="staff-feedback-widget__empty">
              <el-avatar :icon="ChatDotRound" :size="56" />
              <el-text tag="strong">Выберите чат</el-text>
              <el-text size="small" type="info">Ответы приёмной комиссии будут отправлены студенту сразу.</el-text>
            </div>

            <template v-else>
              <div class="staff-feedback-widget__dialog-head">
                <el-button
                  class="staff-feedback-widget__back"
                  :icon="ArrowLeft"
                  text
                  circle
                  aria-label="Назад к чатам"
                  @click="feedbackStore.activeConversationId = null"
                />
                <el-avatar size="small">{{ getInitials(feedbackStore.activeConversation) }}</el-avatar>
                <div class="staff-feedback-widget__dialog-title">
                  <el-text tag="strong" truncated>{{ getStudentName(feedbackStore.activeConversation) }}</el-text>
                  <el-text size="small" type="info" truncated>
                    {{ feedbackStore.activeConversation?.student_email || 'Без email' }}
                  </el-text>
                </div>
                <el-tag
                  size="small"
                  :type="feedbackStore.activeConversation?.status === 'open' ? 'success' : 'info'"
                  effect="light"
                >
                  {{ feedbackStore.activeConversation?.status === 'open' ? 'Открыто' : 'Закрыто' }}
                </el-tag>
              </div>

              <el-scrollbar ref="scrollbarRef" class="staff-feedback-widget__messages">
                <div ref="messagesRef" class="staff-feedback-widget__messages-inner">
                  <div v-if="feedbackStore.loadingMessages" class="staff-feedback-widget__center">
                    <el-icon class="is-loading"><Loading /></el-icon>
                  </div>

                  <el-empty
                    v-else-if="feedbackStore.messages.length === 0"
                    description="Сообщений пока нет"
                    :image-size="80"
                  />

                  <div
                    v-for="message in feedbackStore.messages"
                    v-else
                    :key="message.id"
                    class="staff-feedback-widget__message"
                    :class="{ 'staff-feedback-widget__message--own': isOwnMessage(message) }"
                  >
                    <div class="staff-feedback-widget__bubble">
                      <div v-if="!isOwnMessage(message)" class="staff-feedback-widget__sender">
                        {{ message.sender_first_name }} {{ message.sender_last_name }}
                      </div>
                      <p v-if="message.text">{{ message.text }}</p>
                      <button
                        v-if="message.image_url && !imageUrls[message.id]"
                        type="button"
                        class="staff-feedback-widget__image-loader"
                        @click="loadImage(message)"
                      >
                        Показать изображение
                      </button>
                      <img
                        v-if="imageUrls[message.id]"
                        class="staff-feedback-widget__image"
                        :src="imageUrls[message.id]"
                        alt="Прикрепленное изображение"
                      >
                      <div class="staff-feedback-widget__meta">
                        <time>{{ formatTime(message.created_at) }}</time>
                        <span
                          v-if="isOwnMessage(message)"
                          class="staff-feedback-widget__read"
                          :class="{ 'staff-feedback-widget__read--done': message.is_read }"
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

              <el-alert
                v-if="feedbackStore.activeConversation?.status === 'closed'"
                title="Диалог закрыт"
                type="info"
                show-icon
                :closable="false"
                class="staff-feedback-widget__closed"
              />

              <div v-else class="staff-feedback-widget__composer">
                <div v-if="imagePreview" class="staff-feedback-widget__preview">
                  <img :src="imagePreview" alt="Предпросмотр изображения">
                  <el-button size="small" type="danger" text @click="removeImage">Удалить</el-button>
                </div>
                <div class="staff-feedback-widget__composer-row">
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
                    :autosize="{ minRows: 1, maxRows: 3 }"
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
          </section>
        </div>
      </el-card>
    </transition>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ChatDotRound, Check, Close, Loading, Paperclip, Promotion, Refresh, Service } from '@element-plus/icons-vue'
import { feedback as feedbackApi, getAccessToken } from '@/api/app-api'
import { useAuthStore } from '@/stores/auth'
import { useFeedbackStore } from '@/stores/feedback'

const authStore = useAuthStore()
const feedbackStore = useFeedbackStore()
const tokenRetryTimer = ref(null)
const scrollbarRef = ref(null)
const messagesRef = ref(null)
const inputText = ref('')
const selectedFile = ref(null)
const imagePreview = ref(null)
const imageUrls = ref({})
const sending = ref(false)

const shouldShowWidget = computed(() => (
  authStore.isAuthenticated && (authStore.isAdmin || authStore.isReviewer)
))

const totalUnread = computed(() =>
  feedbackStore.conversations.reduce((count, conversation) => {
    return count + Number(conversation.unread_count || 0)
  }, 0)
)

async function initializeStaffFeedback() {
  if (!shouldShowWidget.value) return

  const token = getAccessToken() || localStorage.getItem('app-access-token') || localStorage.getItem('app.auth.token')
  if (!token) {
    if (!tokenRetryTimer.value) {
      tokenRetryTimer.value = setTimeout(async () => {
        tokenRetryTimer.value = null
        await initializeStaffFeedback()
      }, 2000)
    }
    return
  }

  feedbackStore.initSocket(token)
  await feedbackStore.loadConversations()
  await feedbackStore.loadNotifications()
}

async function reload() {
  await feedbackStore.loadConversations()
}

async function handleToggle() {
  feedbackStore.toggleWidget()
  if (feedbackStore.isOpen) await initializeStaffFeedback()
}

async function selectConversation(conversationId) {
  await feedbackStore.selectConversation(conversationId)
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

async function preloadMessageImages() {
  const imageMessages = feedbackStore.messages.filter((message) => {
    return message.image_url && !imageUrls.value[message.id]
  })

  await Promise.all(imageMessages.map((message) => loadImage(message)))
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

watch(shouldShowWidget, async (isVisible) => {
  if (isVisible) {
    await initializeStaffFeedback()
    return
  }

  feedbackStore.closeWidget()
})

watch(() => feedbackStore.messages.length, async () => {
  await preloadMessageImages()
  await nextTick()
  scrollToBottom()
})

onMounted(async () => {
  await initializeStaffFeedback()
})

onBeforeUnmount(() => {
  if (tokenRetryTimer.value) clearTimeout(tokenRetryTimer.value)
  removeImage()
})
</script>

<style scoped>
.staff-feedback-widget {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
}

.staff-feedback-widget__button.el-button.is-circle {
  width: 56px;
  min-width: 56px;
  height: 56px;
  padding: 0;
  border-radius: 50%;
  font-size: 22px;
  aspect-ratio: 1 / 1;
  box-shadow: 0 12px 30px rgba(64, 158, 255, 0.28);
}

.staff-feedback-widget__panel {
  position: absolute;
  right: 0;
  bottom: 72px;
  width: min(760px, calc(100vw - 32px));
  overflow: hidden;
  border-radius: 18px;
}

.staff-feedback-widget__panel :deep(.staff-feedback-widget__panel-body) {
  padding: 0;
}

.staff-feedback-widget__header,
.staff-feedback-widget__header-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.staff-feedback-widget__header {
  justify-content: space-between;
}

.staff-feedback-widget__title {
  color: var(--el-text-color-primary);
  font-weight: 700;
}

.staff-feedback-widget__messenger {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  height: min(590px, calc(100vh - 150px));
  background: var(--el-bg-color);
}

.staff-feedback-widget__sidebar {
  min-width: 0;
  border-right: 1px solid var(--el-border-color-lighter);
  background: #f8fafc;
}

.staff-feedback-widget__sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
}

.staff-feedback-widget__sidebar-head > div {
  display: flex;
  flex-direction: column;
}

.staff-feedback-widget__chat-list {
  height: calc(100% - 57px);
}

.staff-feedback-widget__chat-item {
  display: flex;
  align-items: center;
  width: calc(100% - 16px);
  min-width: 0;
  margin: 4px 8px;
  padding: 9px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  cursor: pointer;
  gap: 8px;
  text-align: left;
  transition: background 0.16s ease, box-shadow 0.16s ease;
}

.staff-feedback-widget__chat-item:hover,
.staff-feedback-widget__chat-item--active {
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

.staff-feedback-widget__chat-item--active {
  outline: 1px solid rgba(64, 158, 255, 0.22);
}

.staff-feedback-widget__chat-main {
  flex: 1;
  min-width: 0;
}

.staff-feedback-widget__chat-top,
.staff-feedback-widget__chat-bottom,
.staff-feedback-widget__dialog-head,
.staff-feedback-widget__composer-row,
.staff-feedback-widget__meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.staff-feedback-widget__chat-top,
.staff-feedback-widget__chat-bottom {
  justify-content: space-between;
}

.staff-feedback-widget__chat-top span,
.staff-feedback-widget__chat-bottom span,
.staff-feedback-widget__dialog-title {
  overflow: hidden;
  min-width: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.staff-feedback-widget__chat-top span {
  color: var(--el-text-color-primary);
  font-weight: 700;
}

.staff-feedback-widget__chat-top time,
.staff-feedback-widget__chat-bottom span {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.staff-feedback-widget__dialog {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background:
    radial-gradient(circle at 18px 18px, rgba(64, 158, 255, 0.08) 0 2px, transparent 2px 24px),
    linear-gradient(180deg, #eef6ff 0%, #f8fbff 100%);
}

.staff-feedback-widget__empty,
.staff-feedback-widget__center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.staff-feedback-widget__empty {
  flex: 1;
  flex-direction: column;
  padding: 24px;
  text-align: center;
}

.staff-feedback-widget__center {
  min-height: 160px;
}

.staff-feedback-widget__dialog-head {
  min-height: 57px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(8px);
}

.staff-feedback-widget__dialog-title {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.staff-feedback-widget__back {
  display: none;
}

.staff-feedback-widget__messages {
  flex: 1;
}

.staff-feedback-widget__messages-inner {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 100%;
  padding: 12px;
}

.staff-feedback-widget__message {
  display: flex;
  justify-content: flex-start;
}

.staff-feedback-widget__message--own {
  justify-content: flex-end;
}

.staff-feedback-widget__bubble {
  max-width: min(78%, 360px);
  padding: 8px 10px 6px;
  border-radius: 16px 16px 16px 5px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
}

.staff-feedback-widget__message--own .staff-feedback-widget__bubble {
  border-radius: 16px 16px 5px 16px;
  background: #dff1ff;
}

.staff-feedback-widget__sender {
  margin-bottom: 3px;
  color: var(--el-color-primary);
  font-size: 12px;
  font-weight: 700;
}

.staff-feedback-widget__bubble p {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.staff-feedback-widget__image-loader {
  margin-top: 6px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--el-color-primary);
  cursor: pointer;
  font-size: 13px;
}

.staff-feedback-widget__image {
  display: block;
  width: 180px;
  max-width: 100%;
  max-height: 160px;
  margin-top: 6px;
  border-radius: 10px;
  object-fit: cover;
}

.staff-feedback-widget__meta {
  justify-content: flex-end;
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 11px;
}

.staff-feedback-widget__read {
  display: inline-flex;
  color: var(--el-text-color-placeholder);
}

.staff-feedback-widget__read--done {
  color: var(--el-color-primary);
}

.staff-feedback-widget__read .el-icon {
  width: 12px;
  margin-left: -3px;
  font-size: 12px;
}

.staff-feedback-widget__closed,
.staff-feedback-widget__composer {
  margin: 10px 12px 12px;
}

.staff-feedback-widget__composer {
  padding: 8px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 26px rgba(15, 23, 42, 0.08);
}

.staff-feedback-widget__preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.staff-feedback-widget__preview img {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  object-fit: cover;
}

.staff-feedback-widget__composer-row {
  align-items: flex-end;
}

.staff-feedback-widget-enter-active,
.staff-feedback-widget-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.staff-feedback-widget-enter-from,
.staff-feedback-widget-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

@media (max-width: 768px) {
  .staff-feedback-widget {
    right: 16px;
    bottom: 16px;
  }

  .staff-feedback-widget__panel {
    position: fixed;
    right: 8px;
    bottom: 84px;
    left: 8px;
    width: auto;
  }

  .staff-feedback-widget__messenger {
    display: block;
    height: min(620px, calc(100vh - 108px));
  }

  .staff-feedback-widget__sidebar,
  .staff-feedback-widget__dialog {
    height: 100%;
  }

  .staff-feedback-widget__sidebar--hidden-mobile,
  .staff-feedback-widget__dialog {
    display: none;
  }

  .staff-feedback-widget__dialog--open-mobile {
    display: flex;
  }

  .staff-feedback-widget__back {
    display: inline-flex;
  }

  .staff-feedback-widget__bubble {
    max-width: 86%;
  }
}
</style>
