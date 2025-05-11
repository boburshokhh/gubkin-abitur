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
      <p v-if="userInfo" class="mt-1 text-xs text-gray-500">
        {{ userInfo }}
      </p>
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
  // Проверяем, содержится ли статус в объекте status или непосредственно в status_id
  const statusId = props.historyItem.status?.id || props.historyItem.status_id;
  
  // Сначала пытаемся получить имя из объекта status, если он есть
  if (props.historyItem.status?.name) {
    return props.historyItem.status.name;
  }
  
  // Иначе используем карту статусов
  const statusMap = {
    10: 'Подана',
    11: 'Принята',
    12: 'Отклонена'
  };
  return statusMap[statusId] || 'Неизвестный статус';
});

// Получение цвета для статуса
const statusColorClass = computed(() => {
  // Получаем ID статуса
  const statusId = props.historyItem.status?.id || props.historyItem.status_id;
  
  const colorMap = {
    10: 'bg-blue-500',
    11: 'bg-green-500',
    12: 'bg-red-500'
  };
  return colorMap[statusId] || 'bg-gray-500';
});

// Информация о пользователе, изменившем статус
const userInfo = computed(() => {
  if (props.historyItem.created_by_user) {
    const user = props.historyItem.created_by_user;
    return `Изменено: ${user.last_name || ''} ${user.first_name || ''}`.trim();
  }
  return '';
});

// Форматирование даты
const formattedDate = computed(() => {
  // Используем created_at вместо date
  const dateString = props.historyItem.created_at || props.historyItem.date;
  
  if (!dateString) return 'Не указана';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});
</script> 