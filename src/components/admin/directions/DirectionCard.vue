<template>
  <el-card shadow="never" class="direction-card">
    <template #header>
      <div class="direction-card__header">
        <el-tag type="primary" effect="light">{{ direction.code }}</el-tag>
        <el-tag :type="direction.is_active ? 'success' : 'info'" effect="light">
          {{ direction.is_active ? 'Активно' : 'Неактивно' }}
        </el-tag>
      </div>
    </template>

    <div class="direction-card__body">
      <h3 class="direction-card__title">{{ direction.name }}</h3>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="Тип">
          {{ programTypeText }}
        </el-descriptions-item>
        <el-descriptions-item label="Область">
          {{ fieldName }}
        </el-descriptions-item>
        <el-descriptions-item label="Предметы">
          <el-text v-if="subjectsCount > 0">{{ subjectsList }}</el-text>
          <el-text v-else type="info">Нет предметов</el-text>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button-group class="direction-card__actions">
        <el-button :icon="Edit" @click="$emit('edit')">
          Редактировать
        </el-button>
        <el-button type="danger" :icon="Delete" @click="$emit('delete')">
          Удалить
        </el-button>
      </el-button-group>
    </template>
  </el-card>
</template>

<script setup>
import { computed } from 'vue';
import { Delete, Edit } from '@element-plus/icons-vue';

const props = defineProps({
  direction: {
    type: Object,
    required: true
  },
  fieldMapping: {
    type: Object,
    default: () => ({})
  },
  subjectsCount: {
    type: Number,
    default: 0
  },
  subjectsList: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['edit', 'delete']);

// Вычисляемые свойства
const programTypeText = computed(() => 
  props.direction.program_type === 'bachelor' ? 'Бакалавриат' : 'Специалитет'
);

const fieldName = computed(() => {
  const fieldId = props.direction.field;
  return props.fieldMapping[fieldId] || fieldId;
});
</script> 

<style scoped>
.direction-card {
  height: 100%;
}

.direction-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.direction-card__body {
  display: grid;
  gap: 16px;
}

.direction-card__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.direction-card__actions {
  width: 100%;
}

.direction-card__actions :deep(.el-button) {
  width: 50%;
}
</style>