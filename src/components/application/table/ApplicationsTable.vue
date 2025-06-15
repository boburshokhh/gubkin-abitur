<template>
  <div class="overflow-x-auto bg-white rounded-lg shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Абитуриент</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата подачи</th>
          <th scope="col" class="relative px-6 py-3"><span class="sr-only">Действия</span></th>
          </tr>
        </thead>
      <tbody v-if="loading">
        <tr><td colspan="6" class="text-center py-8">Загрузка...</td></tr>
      </tbody>
      <tbody v-else-if="applications.length === 0">
        <tr><td colspan="6" class="text-center py-8">Заявки не найдены.</td></tr>
      </tbody>
      <tbody v-else class="bg-white divide-y divide-gray-200">
        <tr v-for="app in applications" :key="app.id" class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap">
            {{ app.applicant_full_name || getApplicantName(app) }}
          </td>
            <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getStatusClass(app.status?.name || app.status_name)">
              {{ app.status?.name || app.status_name }}
              </span>
            </td>
          <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(app.created_at) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button @click="$emit('view-application', app)" class="text-primary-600 hover:text-primary-900">Просмотр</button>
            </td>
          </tr>
        </tbody>
      </table>
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

const getStatusClass = (statusName) => {
  const classes = {
    'Подана': 'bg-blue-100 text-blue-800',
    'Принята': 'bg-green-100 text-green-800',
    'Отклонена': 'bg-red-100 text-red-800',
    'Требует доработки': 'bg-yellow-100 text-yellow-800',
  };
  return classes[statusName] || 'bg-gray-100 text-gray-800';
};

// Получение имени абитуриента в разных форматах данных
const getApplicantName = (app) => {
  // Сначала проверяем поле applicant_full_name (заполняется в ApplicationsManager)
  if (app.applicant_full_name) {
    return app.applicant_full_name;
  }
  
  // Проверяем наличие объекта user с полным именем
  if (app.user) {
    if (app.user.full_name) return app.user.full_name;
    if (app.user.first_name || app.user.last_name) {
      return `${app.user.last_name || ''} ${app.user.first_name || ''}${app.user.middle_name ? ' ' + app.user.middle_name : ''}`.trim();
    }
  }
  
  // Проверяем наличие объекта users
  if (app.users) {
    return `${app.users.last_name || ''} ${app.users.first_name || ''}${app.users.middle_name ? ' ' + app.users.middle_name : ''}`.trim();
  }
  
  // Резервный вариант - показываем user_id если есть
  if (app.user_id) {
    return `Пользователь ${app.user_id.substring(0, 8)}...`;
  }
  
  // Если данные отсутствуют
  return 'Не указан';
};

// Получение названия направления
const getDirectionName = (app) => {
  // Если есть информация о направлении в выборке
  if (app.direction_name) return app.direction_name;
  if (app.direction_code) return app.direction_code;
  
  // Проверяем наличие объекта direction
  if (app.direction && app.direction.name) return app.direction.name;
  
  // Если есть выбор образовательной программы
  if (app.application_choices && app.application_choices.length > 0) {
    const firstChoice = app.application_choices[0];
    if (firstChoice.profile && firstChoice.profile.direction) {
      return firstChoice.profile.direction.name || firstChoice.profile.direction.code || 'Не указано';
    }
  }
  
  return 'Не указано';
};

// Получение названия профиля/специальности
const getProfileName = (app) => {
  // Если есть информация о профиле в выборке
  if (app.profile_name) return app.profile_name;
  
  // Если есть выбор образовательной программы
  if (app.application_choices && app.application_choices.length > 0) {
    const firstChoice = app.application_choices[0];
    if (firstChoice.profile && firstChoice.profile.name) {
      return firstChoice.profile.name;
    }
  }
  
  return 'Не указано';
};

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return 'Не указана';
  
  try {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    console.error('Ошибка форматирования даты:', e);
    return dateString;
  }
};
</script> 