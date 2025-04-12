<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Верхняя панель -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-0">
            Панель администратора
          </h1>
          <div class="flex flex-wrap items-center gap-2 sm:space-x-4">
            <span class="text-sm text-gray-600 mr-1">
              {{ authStore.profile?.first_name }} {{ authStore.profile?.last_name }}
            </span>
            <span 
              class="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
              :class="{
                'bg-purple-100 text-purple-800': authStore.isReviewer,
                'bg-blue-100 text-blue-800': authStore.isAdmin && !authStore.isReviewer
              }"
            >
              {{ getRoleName() }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      <!-- Навигация -->
      <div class="mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto">
        <nav class="-mb-px flex space-x-4 sm:space-x-8 pb-1" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id"
            class="whitespace-nowrap py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex-shrink-0"
            :class="[
              currentTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Содержимое вкладок -->
      <div v-if="currentTab === 'dashboard'" class="px-2 py-4 sm:px-0 sm:py-6">
        <div class="border-4 border-dashed border-gray-200 rounded-lg h-64 sm:h-96 flex items-center justify-center">
          <div class="text-center px-4">
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Панель управления
            </h3>
            <p class="text-gray-500 text-sm sm:text-base">
              Здесь будет размещен основной функционал панели администратора
            </p>
          </div>
        </div>
      </div>

      <div v-else-if="currentTab === 'statistics'" class="px-2 py-4 sm:px-0 sm:py-6">
        <StatisticsView />
      </div>

      <div v-else-if="currentTab === 'users'" class="px-2 sm:px-0">
        <UsersManagement />
      </div>

      <div v-else-if="currentTab === 'educational-programs'" class="px-2 sm:px-0">
        <EducationalProgramsManager />
      </div>

      <div v-else-if="currentTab === 'applications'" class="px-2 py-4 sm:px-0 sm:py-6">
        <div class="border-4 border-dashed border-gray-200 rounded-lg h-64 sm:h-96 flex items-center justify-center">
          <div class="text-center px-4">
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Управление заявками
            </h3>
            <p class="text-gray-500 text-sm sm:text-base">
              Здесь будет размещен функционал управления заявками абитуриентов
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import UsersManagement from './admin/UsersManagement.vue';
import StatisticsView from './admin/StatisticsView.vue';
import EducationalProgramsManager from './admin/educational-programs/EducationalProgramsManager.vue';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

// Определение доступных вкладок
const tabs = computed(() => {
  const baseTabs = [
    { id: 'dashboard', name: 'Панель управления' },
    { id: 'statistics', name: 'Статистика' },
    { id: 'applications', name: 'Заявки абитуриентов' },
    { id: 'educational-programs', name: 'Образовательные программы' },
  ];
  
  // Вкладка управления пользователями доступна только для администраторов
  if (authStore.isAdmin && !authStore.isReviewer) {
    baseTabs.push({ id: 'users', name: 'Управление пользователями' });
  }
  
  return baseTabs;
});

// Текущая активная вкладка
const currentTab = ref('dashboard');

// Функция для получения названия роли
const getRoleName = () => {
  if (authStore.isReviewer) return 'Сотрудник приемной комиссии';
  if (authStore.isAdmin) return 'Администратор';
  return 'Пользователь';
};

// Проверяем права доступа при монтировании компонента
onMounted(async () => {
  // Загружаем профиль и роль пользователя
  await authStore.initAuth();
  
  if (!authStore.isAdmin && !authStore.isReviewer) {
    toast.error('У вас нет прав для доступа к панели администратора');
    router.push('/');
  } else {
    toast.success(`Добро пожаловать, ${getRoleName()}!`);
  }
});
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
