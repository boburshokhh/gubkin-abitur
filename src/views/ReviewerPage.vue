<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Верхняя панель -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-0">
            Панель сотрудника приемной комиссии
          </h1>
          <div class="flex flex-wrap items-center gap-2 sm:space-x-4">
            <span class="text-sm text-gray-600 mr-1">
              {{ authStore.profile?.first_name }} {{ authStore.profile?.last_name }}
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800">
              Сотрудник приемной комиссии
            </span>

          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Навигационные вкладки -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex -mb-px space-x-6 sm:space-x-8 overflow-x-auto">
          <button 
            @click="currentTab = 'applications'" 
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
              currentTab === 'applications'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Заявки абитуриентов
            </span>
          </button>
          
          <button
            @click="currentTab = 'feedback'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
              currentTab === 'feedback'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Обращения
              <span v-if="feedbackUnread > 0" class="ml-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {{ feedbackUnread }}
              </span>
            </span>
          </button>

          <button
            @click="currentTab = 'settings'" 
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
              currentTab === 'settings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Настройки
            </span>
          </button>
        </nav>
      </div>

      <!-- Содержимое вкладок -->
      <div v-if="currentTab === 'applications'" class="px-2 sm:px-0">
        <ApplicationsManager />
      </div>

      <div v-else-if="currentTab === 'feedback'" class="px-2 sm:px-0">
        <FeedbackInbox />
      </div>

      <div v-else-if="currentTab === 'settings'" class="px-2 sm:px-0">
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Настройки профиля</h2>
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900">Личные данные</h3>
              <p class="mt-1 text-sm text-gray-500">
                Обновите свои персональные данные и контактную информацию
              </p>
              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-3">
                  <label for="first_name" class="block text-sm font-medium text-gray-700">Имя</label>
                  <div class="mt-1">
                    <input 
                      type="text" 
                      id="first_name" 
                      v-model="profile.first_name"
                      class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                  </div>
                </div>

                <div class="sm:col-span-3">
                  <label for="last_name" class="block text-sm font-medium text-gray-700">Фамилия</label>
                  <div class="mt-1">
                    <input 
                      type="text" 
                      id="last_name" 
                      v-model="profile.last_name"
                      class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                  </div>
                </div>

                <div class="sm:col-span-4">
                  <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                  <div class="mt-1">
                    <input 
                      type="email" 
                      id="email" 
                      v-model="profile.email"
                      disabled
                      class="bg-gray-100 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                  </div>
                </div>

                <div class="sm:col-span-4">
                  <label for="phone" class="block text-sm font-medium text-gray-700">Телефон</label>
                  <div class="mt-1">
                    <input 
                      type="tel" 
                      id="phone" 
                      v-model="profile.phone"
                      class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                  </div>
          </div>
        </div>
      </div>

            <div class="pt-5">
              <div class="flex justify-end">
                <button 
                  type="button" 
                  class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Отмена
                </button>
                <button 
                  type="button" 
                  @click="updateProfile"
                  class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import { useFeedbackStore } from '@/stores/feedback';
import ApplicationsManager from '@/components/application/ApplicationsManager.vue';
import FeedbackInbox from '@/components/feedback/feedback-inbox.vue';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const feedbackStore = useFeedbackStore();
const currentTab = ref('applications');

const feedbackUnread = computed(() =>
  feedbackStore.conversations.reduce((acc, c) => acc + Number(c.unread_count || 0), 0)
);

// Профиль пользователя для редактирования
const profile = ref({
  first_name: authStore.profile?.first_name || '',
  last_name: authStore.profile?.last_name || '',
  email: authStore.profile?.email || '',
  phone: authStore.profile?.phone || ''
});

// Выход из системы
async function logout() {
  await authStore.signOut();
  router.push('/login');
}

// Обновление профиля
async function updateProfile() {
  try {
    await authStore.updateProfile({
      first_name: profile.value.first_name,
      last_name: profile.value.last_name,
      phone: profile.value.phone
    });
    
    toast.success('Профиль успешно обновлен');
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    toast.error('Не удалось обновить профиль');
  }
}
</script>

<style scoped>
/* Дополнительные стили для улучшения адаптивности */
@media (max-width: 640px) {
  /* Стили для очень маленьких экранов */
  .max-w-7xl {
    width: 100%;
  }
}
</style> 