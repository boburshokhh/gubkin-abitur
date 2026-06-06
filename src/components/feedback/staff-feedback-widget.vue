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

        <FeedbackInbox compact />
      </el-card>
    </transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChatDotRound, Close, Service } from '@element-plus/icons-vue'
import { getAccessToken } from '@/api/app-api'
import { useAuthStore } from '@/stores/auth'
import { useFeedbackStore } from '@/stores/feedback'
import FeedbackInbox from '@/components/feedback/feedback-inbox.vue'

const authStore = useAuthStore()
const feedbackStore = useFeedbackStore()
const tokenRetryTimer = ref(null)

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

async function handleToggle() {
  feedbackStore.toggleWidget()
  if (feedbackStore.isOpen) await initializeStaffFeedback()
}

watch(shouldShowWidget, async (isVisible) => {
  if (isVisible) {
    await initializeStaffFeedback()
    return
  }

  feedbackStore.closeWidget()
})

onMounted(async () => {
  await initializeStaffFeedback()
})

onBeforeUnmount(() => {
  if (tokenRetryTimer.value) clearTimeout(tokenRetryTimer.value)
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
  width: min(860px, calc(100vw - 32px));
  overflow: hidden;
  border-radius: 18px;
}

.staff-feedback-widget__panel :deep(.staff-feedback-widget__panel-body) {
  padding: 12px;
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
}
</style>
