<template>
  <div class="bg-white shadow rounded-lg overflow-hidden">
    <div v-if="loading" class="p-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-4"></div>
      <p class="text-gray-500">Загрузка данных...</p>
    </div>
    
    <div v-else-if="items.length === 0" class="p-8 text-center">
      <p class="text-gray-500">Направления не найдены</p>
    </div>
    
    <!-- Адаптивные карточки для всех размеров экранов -->
    <div v-else class="block">
      <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 p-4">
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
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
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