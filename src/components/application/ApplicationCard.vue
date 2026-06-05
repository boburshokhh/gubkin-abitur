<template>
  <el-card shadow="never" class="application-card">
    <template #header>
      <div class="application-card__header">
        <el-text tag="h2" class="application-card__title">
          Заявление №{{ shortId }}
        </el-text>
        <el-tag :type="statusTagType" effect="light">
          {{ application.status?.name || 'Неизвестный статус' }}
        </el-tag>
      </div>
    </template>

    <el-descriptions :column="2" border class="application-card__descriptions">
      <el-descriptions-item label="Дата подачи">
        {{ formatDate(application.created_at) }}
      </el-descriptions-item>
      <el-descriptions-item label="Последнее обновление">
        {{ formatDate(application.updated_at) }}
      </el-descriptions-item>
    </el-descriptions>

    <div class="application-card__actions">
      <router-link :to="`/dashboard/applications/${application.id}`">
        <el-button type="primary">Подробнее</el-button>
      </router-link>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  application: {
    type: Object,
    required: true
  }
})

// Computed
const shortId = computed(() => props.application.id?.slice(-8) || 'N/A')

const statusTagType = computed(() => {
  const statusTypes = {
    10: 'primary',
    11: 'success',
    12: 'danger'
  }
  return statusTypes[props.application.status?.id] || 'info'
})

// Утилиты
const formatDate = (dateString) => {
  if (!dateString) return 'Не указана'
  return new Date(dateString).toLocaleDateString('ru-RU', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
}
</script>

<style scoped>
.application-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.application-card__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.application-card__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.application-card__actions a {
  text-decoration: none;
}

@media (max-width: 640px) {
  .application-card__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>