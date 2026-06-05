<template>
  <el-card shadow="never" class="direction-filters">
    <template #header>
      <div class="direction-filters__header">
        <div>
          <h2 class="direction-filters__title">{{ title }}</h2>
          <el-text type="info">{{ description }}</el-text>
        </div>

        <el-space wrap>
          <el-tag type="info" effect="light">Всего направлений: {{ totalCount }}</el-tag>
          <slot name="actions">
            <el-button type="primary" :icon="Plus" @click="$emit('add')">
              Добавить направление
            </el-button>
          </slot>
        </el-space>
      </div>
    </template>

    <el-form label-position="top" class="direction-filters__form">
      <el-form-item label="Тип программы">
        <el-select
          :model-value="modelValue.programType"
          clearable
          placeholder="Все"
          @update:model-value="updateFilter('programType', $event || '')"
        >
          <el-option label="Бакалавриат" value="bachelor" />
          <el-option label="Специалитет" value="specialist" />
        </el-select>
      </el-form-item>

      <el-form-item label="Область">
        <el-select
          :model-value="modelValue.field"
          clearable
          placeholder="Все"
          @update:model-value="updateFilter('field', $event || '')"
        >
          <el-option
            v-for="field in fields"
            :key="field.value"
            :label="field.label"
            :value="field.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Поиск">
        <el-input
          :model-value="modelValue.search"
          placeholder="Поиск по названию или коду"
          clearable
          @update:model-value="updateFilter('search', $event)"
        />
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      programType: '',
      field: '',
      search: ''
    })
  },
  fields: {
    type: Array,
    default: () => []
  },
  totalCount: {
    type: Number,
    default: 0
  },
  title: {
    type: String,
    default: 'Управление направлениями подготовки'
  },
  description: {
    type: String,
    default: 'Добавление, редактирование и удаление направлений бакалавриата и специалитета.'
  }
});

const emit = defineEmits(['update:modelValue', 'add']);

const updateFilter = (key, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  });
};
</script>

<style scoped>
.direction-filters__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.direction-filters__title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.direction-filters__form {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 16px;
}

.direction-filters__form :deep(.el-select) {
  width: 100%;
}

@media (max-width: 768px) {
  .direction-filters__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .direction-filters__form {
    grid-template-columns: 1fr;
  }
}
</style>