<template>
  <header class="fixed top-0 left-0 right-0 bg-white shadow-md z-50 border-b border-gray-200">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Логотип университета -->
        <div class="flex-shrink-0">
          <router-link to="/" class="flex items-center">
            <img class="h-10 sm:h-12 w-auto transition-transform duration-300 hover:scale-105" src="@/assets/photos/gubkin_logo.png" alt="Логотип Филиала РГУ нефти и газа (НИУ) имени И.М. Губкина в городе Ташкенте">
          </router-link>
        </div>

        <!-- Навигация (Desktop) -->
        <nav class="hidden md:flex space-x-6 lg:space-x-8 items-center">
          <router-link 
            v-for="link in navigationLinks" 
            :key="link.to" 
            :to="link.to" 
            class="text-gray-600 hover:text-primary-700 hover:bg-primary-50 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 relative group"
            :class="{ 'text-primary-700 font-semibold bg-primary-50': isActive(link.to) }"
          >
            {{ link.text }}
            <span 
              class="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
              :class="{ 'scale-x-100': isActive(link.to) }"
            ></span>
          </router-link>
        </nav>

        <!-- Кнопки авторизации/пользователя (Desktop) -->
        <div class="hidden md:flex items-center space-x-3">
          <template v-if="isAuthenticated">
             <!-- Меню пользователя для Админа/Сотрудника -->
             <div v-if="authStore.isAdmin || authStore.isReviewer" class="relative user-menu-container">
               <button 
                 @click="showUserMenu = !showUserMenu"
                 class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors duration-200"
               >
                 <svg v-if="authStore.isAdmin" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                   <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                   <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                 </svg>
                 <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                   <path fill-rule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4a1 1 0 00-1 1v1a1 1 0 002 0V5a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v1a1 1 0 002 0V5a1 1 0 00-1-1zM4 9a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zM4 14a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zM10 8a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1z" clip-rule="evenodd" />
                    <path d="M5 11a1 1 0 110 2h10a1 1 0 110-2H5z" />
                 </svg>
                 <span>{{ activeUserAreaText }}</span>
                 <svg class="ml-1 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
               </button>
               <!-- Выпадающее меню -->
               <transition 
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
               >
                  <div 
                     v-if="showUserMenu" 
                     class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  >
                     <div class="py-2">
                        <router-link 
                           :to="authStore.isAdmin ? '/admin' : '/reviewer'" 
                           class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full"
                           @click="showUserMenu = false"
                         >
                           <svg v-if="authStore.isAdmin" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                           </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4a1 1 0 00-1 1v1a1 1 0 002 0V5a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v1a1 1 0 002 0V5a1 1 0 00-1-1zM4 9a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zM4 14a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zM10 8a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1z" clip-rule="evenodd" />
                              <path d="M5 11a1 1 0 110 2h10a1 1 0 110-2H5z" />
                            </svg>
                           {{ authStore.isAdmin ? 'Панель администратора' : 'Панель сотрудника' }}
                        </router-link>
                        <router-link 
                           to="/dashboard/profile" 
                           class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 w-full"
                           @click="showUserMenu = false"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                             <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                           </svg>
                           Личный кабинет
                        </router-link>
                     </div>
                  </div>
               </transition>
             </div>
             
             <!-- Отдельная кнопка Личный кабинет для абитуриентов -->
            <router-link 
              v-else 
              :to="userDashboardLink"
              class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors duration-200"
              title="Перейти в личный кабинет"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
              {{ activeUserAreaText }}
            </router-link>
            <button 
              @click="showLogoutConfirm = true"
              class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              title="Выйти из системы"
            >
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
              </svg>
              Выйти
            </button>
          </template>
          
          <template v-else>
            <router-link 
              to="/auth" 
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              Войти
            </router-link>
            <router-link 
              to="/register" 
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              Подать документы
            </router-link>
          </template>
        </div>

        <!-- Мобильное меню (кнопка) -->
        <div class="flex items-center md:hidden">
          <button 
            @click="showMobileMenu = !showMobileMenu"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none transition-colors duration-200"
            aria-label="Меню"
            :aria-expanded="showMobileMenu"
          >
            <svg v-if="!showMobileMenu" class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Мобильное меню (развернутое) -->
    <transition 
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div v-if="showMobileMenu" class="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200">
        <div class="py-2 space-y-1 px-2">
        <router-link 
            v-for="link in navigationLinks"
            :key="link.to"
            :to="link.to" 
            class="block px-3 py-2 rounded-md text-base font-medium"
            :class="[isActive(link.to) ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600']"
            @click="showMobileMenu = false"
          >
            {{ link.text }}
        </router-link>
        </div>
        <div class="pt-4 pb-3 border-t border-gray-200 px-5">
          <template v-if="isAuthenticated">
            <div class="flex items-center mb-3">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
              <div>
                <div class="text-base font-medium text-gray-800">{{ userName }}</div>
                <div class="text-sm font-medium text-gray-500">{{ activeUserAreaText }}</div>
              </div>
            </div>
            <div class="mt-3 space-y-2">
               <!-- Кнопка перехода в панель админа/сотрудника (мобильная) -->
              <button
                 v-if="authStore.isAdmin || authStore.isReviewer"
                 @click="goToAdminOrReviewerPanel(); showMobileMenu = false"
                 class="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
               >
                 <svg v-if="authStore.isAdmin" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                   <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                   <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                 </svg>
                 <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                   <path fill-rule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4a1 1 0 00-1 1v1a1 1 0 002 0V5a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v1a1 1 0 002 0V5a1 1 0 00-1-1zM4 9a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zM4 14a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zM10 8a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1z" clip-rule="evenodd" />
                    <path d="M5 11a1 1 0 110 2h10a1 1 0 110-2H5z" />
                 </svg>
                 {{ activeUserAreaText }}
               </button>

              <button 
                @click="goToDashboard(); showMobileMenu = false"
                class="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                   <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                 Личный кабинет 
              </button>
            <button 
                @click="showLogoutConfirm = true; showMobileMenu = false"
                class="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                   <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
                 </svg>
                Выйти
            </button>
            </div>
          </template>
          <template v-else>
            <div class="space-y-2">
              <button 
                @click="router.push('/auth'); showMobileMenu = false"
                class="w-full flex justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Войти
              </button>
              <button 
                @click="router.push('/register'); showMobileMenu = false"
                class="w-full flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Подать документы
              </button>
            </div>
          </template>
        </div>
      </div>
    </transition>

    <!-- Модальное окно подтверждения выхода -->
    <ConfirmModal
      :is-visible="showLogoutConfirm"
      title="Выход из системы"
      message="Вы действительно хотите выйти из системы?"
      confirm-text="Выйти"
      cancel-text="Отмена"
      @confirm="confirmLogout"
      @cancel="cancelLogout"
    />

  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';

// Состояние UI
const showMobileMenu = ref(false);
const showLogoutConfirm = ref(false);
const showUserMenu = ref(false);

// Навигация и авторизация
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

// Ссылки навигации
const navigationLinks = [
  { to: '/', text: 'Главная' },
  { to: '/directions', text: 'Направления' },
  { to: '/faq', text: 'Вопросы и ответы' },
  { to: '/contacts', text: 'Контакты' },
  { to: '/statistics', text: 'Статистика' },
];

// Вычисляемые свойства
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userName = computed(() => authStore.user?.name || 'Пользователь');

// Текст для кнопки пользователя (учитывает текущий маршрут для админа/ревьюера)
const activeUserAreaText = computed(() => {
  if (!authStore.isAdmin && !authStore.isReviewer) {
    return 'Личный кабинет'; // Для абитуриентов
  }
  
  // Для админа/ревьюера проверяем текущий маршрут
  if (route.path.startsWith('/admin')) {
      return 'Панель администратора';
  } 
  if (route.path.startsWith('/reviewer')) {
      return 'Панель сотрудника';
  }
  if (route.path.startsWith('/dashboard/profile')) {
      return 'Личный кабинет';
  }
  
  // По умолчанию показываем название панели
  return authStore.isAdmin ? 'Панель администратора' : 'Панель сотрудника';
});

const userDashboardLink = computed(() => {
  // Ссылка на профиль остается единой
  return '/dashboard/profile';
});

// Методы
const isActive = (path) => {
  // Для главной страницы точное совпадение, для остальных - startsWith
  return path === '/' ? route.path === path : route.path.startsWith(path);
};

const goToDashboard = () => {
  router.push(userDashboardLink.value);
  showMobileMenu.value = false;
};

// Метод для перехода в панель админа/сотрудника из мобильного меню
const goToAdminOrReviewerPanel = () => {
  const path = authStore.isAdmin ? '/admin' : '/reviewer';
  router.push(path);
  showMobileMenu.value = false;
};

const logout = async () => {
  try {
  await authStore.logout();
  showMobileMenu.value = false;
    showLogoutConfirm.value = false;
  router.push('/');
    toast.success('Вы успешно вышли из системы');
  } catch (error) {
    console.error('Ошибка при выходе:', error);
    toast.error('Не удалось выйти из системы');
  }
};

const confirmLogout = () => {
  logout();
};

const cancelLogout = () => {
  showLogoutConfirm.value = false;
};

// Закрыть меню при нажатии клавиши Escape
const handleEscKey = (event) => {
  if (event.key === 'Escape') {
    showMobileMenu.value = false;
    showLogoutConfirm.value = false; // Также закрываем модальное окно
    showUserMenu.value = false; // Закрываем и меню пользователя
  }
};

// Закрытие меню пользователя при клике вне его
const handleOutsideClick = (event) => {
  if (showUserMenu.value && !event.target.closest('.user-menu-container')) {
    showUserMenu.value = false;
  }
  // Добавьте сюда логику для закрытия других меню, если они есть
};

onMounted(() => {
  window.addEventListener('keydown', handleEscKey);
  window.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscKey);
  window.removeEventListener('click', handleOutsideClick);
});
</script>

<style scoped>
/* Стили для подчеркивания активной ссылки */
.group:hover .group-hover\:scale-x-100 {
  transform: scaleX(1);
}
</style>