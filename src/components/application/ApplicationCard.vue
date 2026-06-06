<template>
  <el-card shadow="never" class="application-card">
    <template #header>
      <div class="application-card__header">
        <div>
          <el-text tag="h2" class="application-card__title">
            Заявление №{{ shortId }}
          </el-text>
          <el-text type="info" class="application-card__subtitle">
            Учебный год: {{ application.academic_year || new Date().getFullYear() }}
          </el-text>
        </div>
        <el-tag :type="statusTagType" effect="light">
          {{ statusName }}
        </el-tag>
      </div>
    </template>

    <el-descriptions :column="descriptionColumns" border class="application-card__descriptions">
      <el-descriptions-item label="Дата подачи">
        {{ formatDate(application.created_at) }}
      </el-descriptions-item>
      <el-descriptions-item label="Последнее обновление">
        {{ formatDate(application.updated_at) }}
      </el-descriptions-item>
      <el-descriptions-item v-if="documentSummaryLabel" label="Документы">
        {{ documentSummaryLabel }}
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

const statusId = computed(() => props.application.status?.id || props.application.status_id)

const statusName = computed(() => props.application.status?.name || getStatusText(statusId.value))

const statusTagType = computed(() => {
  const statusTypes = {
    1: 'info',
    2: 'warning',
    3: 'success',
    4: 'danger'
  }
  return statusTypes[statusId.value] || 'info'
})

const documentSummaryLabel = computed(() => {
  const summary = props.application.document_summary
  if (!summary) return ''

  const uploaded = summary.uploaded || summary.uploaded_count || summary.total_uploaded || 0
  const required = summary.required || summary.required_count || summary.total_required || 0

  if (required) return `${uploaded} из ${required} обязательных`
  if (uploaded) return `${uploaded} загружено`
  return ''
})

const descriptionColumns = computed(() => documentSummaryLabel.value ? 3 : 2)

function getStatusText(id) {
  const statuses = {
    1: 'Черновик',
    2: 'На рассмотрении',
    3: 'Одобрено',
    4: 'Отклонено'
  }
  return statuses[id] || 'Неизвестный статус'
}

function formatDate(dateString) {
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
  display: block;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.application-card__subtitle {
  display: block;
  margin-top: 4px;
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