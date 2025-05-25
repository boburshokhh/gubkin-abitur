<template>
  <main class="container mx-auto px-4 py-6 md:py-8">
    <h1 class="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Мои заявления</h1>

    <!-- Навигационные кнопки -->
    <div class="bg-white shadow rounded-lg mb-6 md:mb-8 p-3 md:p-4">
      <div class="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4">
        <router-link 
          to="/dashboard/applications" 
          class="px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center sm:justify-start"
          :class="[$route.path.includes('/dashboard/applications') && !$route.params.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200']"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Мои заявления
          </span>
        </router-link>
        
        <router-link 
          to="/dashboard/profile" 
          class="px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center sm:justify-start"
          :class="[$route.path === '/dashboard/profile' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200']"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Мой профиль
          </span>
        </router-link>
        
        <router-link 
          to="/register" 
          class="px-3 md:px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center sm:justify-start"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Подать новое заявление
          </span>
        </router-link>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 md:p-6 mb-6 md:mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center">
        <svg class="h-6 w-6 text-red-600 mr-3 mb-2 sm:mb-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="text-lg font-medium">Ошибка при загрузке заявлений</h3>
          <p class="mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-else-if="applications.length === 0" class="bg-white shadow rounded-lg overflow-hidden p-4 md:p-6 text-center">
      <svg class="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-3 md:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h2 class="text-lg md:text-xl font-medium text-gray-900 mb-2">У вас пока нет заявлений</h2>
      <p class="text-gray-600 mb-4">Подайте документы для поступления, заполнив форму</p>
      <router-link 
        to="/register" 
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Подать заявление
      </router-link>
    </div>

    <div v-else class="space-y-4 md:space-y-6">
      <!-- Карточки заявлений -->
      <div 
        v-for="application in applications" 
        :key="application.id" 
        class="bg-white shadow rounded-lg overflow-hidden"
      >
        <div class="bg-primary-600 px-4 py-3 md:px-6 md:py-4 flex flex-col sm:flex-row justify-between sm:items-center">
          <h2 class="text-lg md:text-xl font-medium text-white mb-2 sm:mb-0">Заявление №{{ application.id }}</h2>
          <span 
            :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium self-start sm:self-auto', 
              getStatusClass(application.status?.id)
            ]"
          >
            {{ application.status?.name || 'Неизвестный статус' }}
          </span>
        </div>
        <div class="p-4 md:p-6">
          <!-- Статус и последний комментарий -->
          <div class="mb-6 border rounded-lg overflow-hidden">
            <div class="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
              <!-- Текущий статус -->
              <div class="p-4">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-gray-900">Текущий статус</h3>
                    <div class="mt-1">
                      <span 
                        :class="[
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', 
                          getStatusClass(application.status?.id)
                        ]"
                      >
                        {{ application.status?.name || 'Неизвестный статус' }}
                      </span>
                      <p class="mt-1 text-sm text-gray-500">
                        Обновлено: {{ formatDate(application.updated_at) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Последний комментарий -->
              <div class="p-4">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-gray-900">Последний комментарий</h3>
                    <div class="mt-1">
                      <p class="text-sm text-gray-900">
                        {{ application.last_comment || 'Комментариев пока нет' }}
                      </p>
                      <p v-if="application.last_comment_date" class="mt-1 text-xs text-gray-500">
                        {{ formatDate(application.last_comment_date) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Основная информация -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div>
              <h3 class="text-gray-500 text-sm font-medium mb-1">Направление обучения</h3>
              <p class="text-gray-900 break-words">{{ application.direction?.name || 'Не указано' }}</p>
            </div>
            <div>
              <h3 class="text-gray-500 text-sm font-medium mb-1">Дата подачи</h3>
              <p class="text-gray-900">{{ formatDate(application.created_at) }}</p>
            </div>
            <div>
              <h3 class="text-gray-500 text-sm font-medium mb-1">Форма обучения</h3>
              <p class="text-gray-900">{{ getStudyFormText(application.study_form) }}</p>
            </div>
            <div>
              <h3 class="text-gray-500 text-sm font-medium mb-1">Финансирование</h3>
              <p class="text-gray-900">{{ getFundingFormText(application.funding_form) }}</p>
            </div>
          </div>
          
          <div class="flex justify-center sm:justify-end">
            <router-link 
              :to="`/dashboard/applications/${application.id}`" 
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Подробнее
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useApplicationStore } from '@/stores/application';
import { useRoute } from 'vue-router';

const route = useRoute();
const appStore = useApplicationStore();
const applications = ref([]);
const isLoading = ref(true);
const error = ref('');

// Загрузка заявлений при монтировании компонента
onMounted(async () => {
  isLoading.value = true;
  
  try {
    const success = await appStore.loadUserApplications();
    if (success) {
      applications.value = appStore.userApplications;
    } else {
      error.value = appStore.error || 'Не удалось загрузить заявления';
    }
  } catch (err) {
    console.error('Ошибка при загрузке заявлений:', err);
    error.value = err.message || 'Произошла ошибка при загрузке заявлений';
  } finally {
    isLoading.value = false;
  }
});

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return 'Не указана';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Получение текста для статуса заявления
const getStatusText = (statusId) => {
  const statusMap = {
    10: 'Подана',
    11: 'Принята',
    12: 'Отклонена'
  };
  return statusMap[statusId] || 'Неизвестный статус';
};

// Получение класса для отображения статуса
const getStatusClass = (statusId) => {
  const classMap = {
    10: 'bg-blue-100 text-blue-800',
    11: 'bg-green-100 text-green-800',
    12: 'bg-red-100 text-red-800'
  };
  return classMap[statusId] || 'bg-gray-100 text-gray-800';
};

// Получение текста для формы обучения
const getStudyFormText = (form) => {
  const formMap = {
    'full-time': 'Очная',
    'part-time': 'Заочная',
    'distance': 'Дистанционная'
  };
  return formMap[form] || 'Не указана';
};

// Получение текста для типа финансирования
const getFundingFormText = (form) => {
  const formMap = {
    'budget': 'Бюджет',
    'contract': 'Контракт'
  };
  return formMap[form] || 'Не указан';
};
</script> 