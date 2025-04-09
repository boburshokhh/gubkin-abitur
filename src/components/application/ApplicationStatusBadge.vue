<template>
  <span 
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', 
      statusClass
    ]"
  >
    {{ statusText }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'sm',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
});

// Получение текста для статуса заявления
const statusText = computed(() => {
  const statusMap = {
    'draft': 'Черновик',
    'submitted': 'На рассмотрении',
    'reviewing': 'Проверяется',
    'additional_info': 'Требуется уточнение',
    'approved': 'Одобрено',
    'rejected': 'Отклонено'
  };
  return statusMap[props.status] || 'Неизвестный статус';
});

// Получение класса для отображения статуса
const statusClass = computed(() => {
  const baseClass = {
    'draft': 'bg-gray-100 text-gray-800',
    'submitted': 'bg-blue-100 text-blue-800',
    'reviewing': 'bg-purple-100 text-purple-800',
    'additional_info': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  };
  
  // Добавляем размеры
  const sizeClass = {
    'sm': 'text-xs px-2.5 py-0.5',
    'md': 'text-sm px-3 py-0.75',
    'lg': 'text-base px-3.5 py-1'
  };
  
  return `${baseClass[props.status] || 'bg-gray-100 text-gray-800'} ${sizeClass[props.size]}`;
});
</script> 