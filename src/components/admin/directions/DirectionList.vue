<template>
  <el-card shadow="never">
    <el-skeleton v-if="loading" :rows="6" animated />

    <el-empty v-else-if="items.length === 0" description="Направления не найдены" />

    <div v-else class="direction-list">
      <DirectionCard
        v-for="item in items"
        :key="item.id"
        :direction="item"
        :field-mapping="fieldMapping"
        :subjects-count="getExamSubjectsCount(item)"
        :subjects-list="getExamSubjectsList(item)"
        @edit="$emit('edit', item)"
        @delete="$emit('delete', item)"
      />
    </div>
  </el-card>
</template>

<script setup>
import DirectionCard from './DirectionCard.vue';

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  directionSubjectsMap: {
    type: Object,
    default: () => ({})
  },
  subjectsData: {
    type: Array,
    default: () => []
  },
  fieldMapping: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['edit', 'delete']);

// Функция для получения количества предметов для экзамена
const getExamSubjectsCount = (direction) => {
  const directionSubjects = props.directionSubjectsMap[direction.id] || [];
  return directionSubjects.length;
};

// Функция для получения списка предметов для экзамена
const getExamSubjectsList = (direction) => {
  const directionSubjects = props.directionSubjectsMap[direction.id] || [];
  if (directionSubjects.length === 0) {
    return '';
  }
  
  return directionSubjects
    .map(ds => {
      const subject = props.subjectsData.find(s => s.id === ds.subject_id);
      return subject ? subject.name : '';
    })
    .filter(name => name)
    .join(', ');
};
</script>

<style scoped>
.direction-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(280px, 1fr));
  gap: 16px;
}

@media (max-width: 768px) {
  .direction-list {
    grid-template-columns: 1fr;
  }
}
</style>