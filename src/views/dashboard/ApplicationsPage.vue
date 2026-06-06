<template>
  <main class="applications-page">
    <el-card shadow="never" class="applications-page__header-card">
      <div class="applications-page__header">
        <div>
          <el-text tag="h1" class="applications-page__title">Мои заявления</el-text>
          <el-text type="info" class="applications-page__subtitle">
            Отслеживайте статус поданных заявлений и переходите к подробной информации.
          </el-text>
        </div>
        <el-tag v-if="!isLoading && !error" type="primary" effect="light" size="large">
          {{ applicationsCountLabel }}
        </el-tag>
      </div>
    </el-card>

    <DashboardNavigation />

    <el-card v-if="isLoading" shadow="never" class="applications-page__state-card">
      <el-skeleton :rows="5" animated />
    </el-card>

    <el-alert
      v-else-if="error"
      title="Ошибка при загрузке заявлений"
      :description="error"
      type="error"
      show-icon
      class="applications-page__alert"
    />

    <EmptyState v-else-if="!applications.length" />

    <div v-else class="applications-page__list">
      <ApplicationCard
        v-for="application in applications"
        :key="application.id"
        :application="application"
      />
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import { useApplicationStore } from '@/stores/application'
import { subscribeApplicationUpdates } from '@/services/application-realtime'

import EmptyState from '@/components/shared/EmptyState.vue'
import ApplicationCard from '@/components/application/ApplicationCard.vue'
import DashboardNavigation from '@/components/dashboard/DashboardNavigation.vue'

const appStore = useApplicationStore()

const applications = ref([])
const isLoading = ref(true)
const error = ref('')
let unsubscribeApplicationUpdates = null

const applicationsCountLabel = computed(() => {
  const count = applications.value.length
  if (count === 1) return '1 заявление'
  if (count >= 2 && count <= 4) return `${count} заявления`
  return `${count} заявлений`
})

onMounted(async () => {
  try {
    const success = await appStore.loadUserApplications()
    applications.value = success ? appStore.userApplications : []
    if (!success) error.value = appStore.error || 'Не удалось загрузить заявления'
    unsubscribeApplicationUpdates = subscribeApplicationUpdates(handleRealtimeApplicationUpdate)
  } catch (err) {
    console.error('Ошибка при загрузке заявлений:', err)
    error.value = err.message || 'Произошла ошибка при загрузке заявлений'
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  unsubscribeApplicationUpdates?.()
})

async function handleRealtimeApplicationUpdate() {
  const success = await appStore.loadUserApplications()
  if (success) applications.value = appStore.userApplications
}
</script>

<style scoped>
.applications-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px 16px;
}

.applications-page__header-card,
.applications-page__state-card,
.applications-page__alert {
  margin-bottom: 24px;
}

.applications-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.applications-page__title {
  display: block;
  margin: 0 0 8px;
  color: var(--el-text-color-primary);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.applications-page__subtitle {
  display: block;
}

.applications-page__list {
  display: grid;
  gap: 16px;
}

@media (max-width: 640px) {
  .applications-page {
    padding: 16px 12px;
  }

  .applications-page__header {
    flex-direction: column;
  }

  .applications-page__title {
    font-size: 24px;
  }

  .applications-page__nav-card :deep(.el-space__item),
  .applications-page__nav-card :deep(.el-button) {
    width: 100%;
  }
}
</style>