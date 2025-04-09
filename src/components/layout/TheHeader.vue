<template>
  <header class="bg-white shadow-sm">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Логотип и название университета -->
        <div class="flex items-center">
          <div class="flex-shrink-0 flex items-center">
            <img class="h-12 w-auto" src="@/assets/logo.svg" alt="Логотип университета">
            <div class="ml-3 flex flex-col">
              <h1 class="text-xl font-bold text-primary-700">Университет Губкина</h1>
              <p class="text-sm text-gray-600">Ташкентский филиал</p>
            </div>
          </div>
        </div>

        <!-- Навигация -->
        <nav class="hidden md:flex space-x-8 items-center">
          <router-link 
            to="/" 
            class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
            :class="{ 'text-primary-600': $route.path === '/' }"
          >
            Главная
          </router-link>
          <router-link 
            to="/about" 
            class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
            :class="{ 'text-primary-600': $route.path === '/about' }"
          >
            О приемной комиссии
          </router-link>
          <router-link 
            to="/directions" 
            class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
            :class="{ 'text-primary-600': $route.path === '/directions' }"
          >
            Направления обучения
          </router-link>
          <router-link 
            to="/contacts" 
            class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
            :class="{ 'text-primary-600': $route.path === '/contacts' }"
          >
            Контакты
          </router-link>
        </nav>

        <!-- Кнопки авторизации/регистрации или личный кабинет -->
        <div class="hidden md:flex items-center">
          <template v-if="isAuthenticated">
            <button 
              class="relative text-gray-700 hover:text-primary-600 p-2"
              @click="showNotifications = !showNotifications"
            >
              <span class="sr-only">Уведомления</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span v-if="unreadNotifications > 0" class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            
            <div class="ml-4 relative">
              <div>
                <button 
                  @click="showProfileMenu = !showProfileMenu"
                  class="flex items-center text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  <span>{{ userName || 'Пользователь' }}</span>
                  <svg class="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div v-if="showProfileMenu" class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div class="py-1">
                  <router-link 
                    to="/dashboard" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Личный кабинет
                  </router-link>
                  <button 
                    @click="logout"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Выйти из аккаунта
                  </button>
                </div>
              </div>
            </div>
          </template>
          
          <template v-else>
            <router-link 
              to="/auth" 
              class="btn-primary"
            >
              Войти
            </router-link>
            <router-link 
              to="/register" 
              class="ml-3 btn-primary"
            >
              Подать документы
            </router-link>
          </template>
        </div>

        <!-- Мобильное меню (кнопка) -->
        <div class="flex items-center md:hidden">
          <button 
            @click="showMobileMenu = !showMobileMenu"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100"
          >
            <span class="sr-only">Открыть меню</span>
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
    <div v-if="showMobileMenu" class="md:hidden">
      <div class="pt-2 pb-3 space-y-1">
        <router-link 
          to="/" 
          class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
          :class="{ 'text-primary-600': $route.path === '/' }"
        >
          Главная
        </router-link>
        <router-link 
          to="/about" 
          class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
          :class="{ 'text-primary-600': $route.path === '/about' }"
        >
          О приемной комиссии
        </router-link>
        <router-link 
          to="/directions" 
          class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
          :class="{ 'text-primary-600': $route.path === '/directions' }"
        >
          Направления обучения
        </router-link>
        <router-link 
          to="/contacts" 
          class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
          :class="{ 'text-primary-600': $route.path === '/contacts' }"
        >
          Контакты
        </router-link>
      </div>
      <div class="pt-4 pb-3 border-t border-gray-200">
        <div v-if="isAuthenticated" class="flex items-center px-4">
          <div class="flex-shrink-0">
            <div class="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
              {{ userInitials }}
            </div>
          </div>
          <div class="ml-3">
            <div class="text-base font-medium text-gray-800">{{ userName }}</div>
            <div class="text-sm font-medium text-gray-500">{{ userEmail }}</div>
          </div>
        </div>
        <div class="mt-3 space-y-1">
          <template v-if="isAuthenticated">
            <router-link 
              to="/dashboard" 
              class="block px-4 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              Личный кабинет
            </router-link>
            <button 
              @click="logout"
              class="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              Выйти из аккаунта
            </button>
          </template>
          <template v-else>
            <router-link 
              to="/auth" 
              class="block px-4 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              Войти
            </router-link>
            <router-link 
              to="/register" 
              class="block px-4 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              Подать документы
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Состояние UI
const showMobileMenu = ref(false);
const showProfileMenu = ref(false);
const showNotifications = ref(false);

// Авторизация
const authStore = useAuthStore();
const router = useRouter();

// Вычисляемые свойства
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userName = computed(() => authStore.user?.name || 'Пользователь');
const userEmail = computed(() => authStore.user?.email || '');
const userRole = computed(() => authStore.role);
const unreadNotifications = computed(() => 0); // Будет заменено на реальные данные

const userInitials = computed(() => {
  if (!authStore.user?.name) return 'У';
  const names = authStore.user.name.split(' ');
  return names.map(name => name.charAt(0)).join('').toUpperCase();
});

// Методы
const logout = async () => {
  await authStore.logout();
  showProfileMenu.value = false;
  showMobileMenu.value = false;
  router.push('/');
};

// Закрыть выпадающие меню при клике вне элемента
window.addEventListener('click', (event) => {
  if (showProfileMenu.value && !event.target.closest('.profile-menu')) {
    showProfileMenu.value = false;
  }
  if (showNotifications.value && !event.target.closest('.notifications-menu')) {
    showNotifications.value = false;
  }
});
</script>