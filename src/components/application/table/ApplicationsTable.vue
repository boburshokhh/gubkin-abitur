<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ФИО абитуриента
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Направление
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Дата подачи
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Статус
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading">
            <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
              Загрузка данных...
            </td>
          </tr>
          <tr v-else-if="applications.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
              Нет заявок, соответствующих выбранным фильтрам
            </td>
          </tr>
          <tr 
            v-for="application in applications" 
            :key="application.id"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ application.id.substring(0, 8) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ getUserFullName(application.user) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ application.direction?.name || 'Не указано' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(application.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="getStatusClass(application.status_id)"
              >
                {{ getStatusName(application.status_id) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="$emit('view-application', application)"
                class="text-primary-600 hover:text-primary-900 mr-2"
              >
                Просмотр
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  applications: {
    type: Array,
    required: true
  },
  statuses: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['view-application']);

// Получение полного имени пользователя
function getUserFullName(user) {
  if (!user) return 'Неизвестный пользователь';
  return `${user.last_name || ''} ${user.first_name || ''} ${user.middle_name || ''}`.trim();
}

// Форматирование даты
function formatDate(dateString) {
  if (!dateString) return 'Не указана';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}

// Получение имени статуса по ID
function getStatusName(statusId) {
  const status = props.statuses.find(s => s.id === statusId);
  return status ? status.name : 'Неизвестный статус';
}

// Получение класса для отображения статуса
function getStatusClass(statusId) {
  const status = props.statuses.find(s => s.id === statusId);
  
  if (!status) return 'bg-gray-100 text-gray-800';
  
  switch (status.name) {
    case 'Подана':
      return 'bg-blue-100 text-blue-800';
    case 'Принята':
      return 'bg-green-100 text-green-800';
    case 'Отклонена':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
</script> 