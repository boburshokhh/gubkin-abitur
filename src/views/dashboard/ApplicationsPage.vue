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

    <el-card shadow="never" class="applications-page__nav-card">
      <el-space wrap>
        <router-link custom to="/dashboard/applications" v-slot="{ navigate }">
          <el-button :type="isApplicationsRoute ? 'primary' : 'default'" @click="navigate">
            <el-icon><Document /></el-icon>
            Мои заявления
          </el-button>
        </router-link>

        <router-link custom to="/dashboard/profile" v-slot="{ navigate }">
          <el-button :type="route.path === '/dashboard/profile' ? 'primary' : 'default'" @click="navigate">
            <el-icon><User /></el-icon>
            Мой профиль
          </el-button>
        </router-link>

        <router-link v-if="isAdmissionOpen" custom to="/register" v-slot="{ navigate }">
          <el-button type="success" @click="navigate">
            <el-icon><Plus /></el-icon>
            Подать новое заявление
          </el-button>
        </router-link>

        <el-button v-else type="info" disabled>
          <el-icon><CircleClose /></el-icon>
          Прием 2026 закрыт
        </el-button>
      </el-space>
    </el-card>

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
import { ref, computed, onMounted } from 'vue'
import { useApplicationStore } from '@/stores/application'
import { useRoute } from 'vue-router'
import { useAdmissionStatus } from '@/composables/useAdmissionStatus'

import EmptyState from '@/components/shared/EmptyState.vue'
import ApplicationCard from '@/components/application/ApplicationCard.vue'

const route = useRoute()
const appStore = useApplicationStore()
const { isAdmissionOpen } = useAdmissionStatus()

const applications = ref([])
const isLoading = ref(true)
const error = ref('')

const isApplicationsRoute = computed(() => (
  route.path.includes('/dashboard/applications') && !route.params.id
))

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
  } catch (err) {
    console.error('Ошибка при загрузке заявлений:', err)
    error.value = err.message || 'Произошла ошибка при загрузке заявлений'
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.applications-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px 16px;
}

.applications-page__header-card,
.applications-page__nav-card,
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

:deep(.el-button .el-icon) {
  margin-right: 6px;
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