<template>
  <div class="flex items-start">
    <div 
      :class="[
        'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1 -ml-3', 
        statusColorClass
      ]"
    >
      <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <div class="ml-4">
      <div class="flex items-center">
        <h4 class="text-sm font-medium text-gray-900">{{ statusText }}</h4>
        <span class="ml-2 text-xs text-gray-500">{{ formattedDate }}</span>
      </div>
      <p class="mt-1 text-sm text-gray-600">{{ historyItem.comment || 'Без комментария' }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  historyItem: {
    type: Object,
    required: true
  }
});

// Получение текста для статуса
const statusText = computed(() => {
  const statusMap = {
    'draft': 'Черновик',
    'submitted': 'На рассмотрении',
    'reviewing': 'Проверяется',
    'additional_info': 'Требуется уточнение',
    'approved': 'Одобрено',
    'rejected': 'Отклонено'
  };
  return statusMap[props.historyItem.status] || 'Неизвестный статус';
});

// Получение цвета для статуса
const statusColorClass = computed(() => {
  const colorMap = {
    'draft': 'bg-gray-500',
    'submitted': 'bg-blue-500',
    'reviewing': 'bg-purple-500',
    'additional_info': 'bg-yellow-500',
    'approved': 'bg-green-500',
    'rejected': 'bg-red-500'
  };
  return colorMap[props.historyItem.status] || 'bg-gray-500';
});

// Форматирование даты
const formattedDate = computed(() => {
  if (!props.historyItem.date) return 'Не указана';
  
  const date = new Date(props.historyItem.date);
  return date.toLocaleDateString('ru-RU', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});
</script> 