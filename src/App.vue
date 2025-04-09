<template>
  <div class="min-h-screen flex flex-col">
    <!-- Шапка сайта -->
    <header class="bg-white shadow">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Логотип -->
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="flex items-center">
              <div class="text-xl font-semibold text-primary-700">
                <div>РГУНГ</div>
                <div class="text-xs font-normal">Ташкентский филиал</div>
              </div>
            </router-link>
          </div>
          
          <!-- Навигация -->
          <nav class="hidden md:flex space-x-8">
            <router-link to="/" class="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium text-sm">
              Главная
            </router-link>
            <router-link to="/directions" class="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium text-sm">
              Направления
            </router-link>
            <router-link to="/faq" class="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium text-sm">
              Вопросы и ответы
            </router-link>
            <router-link to="/contacts" class="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium text-sm">
              Контакты
            </router-link>
          </nav>
          
          <!-- Кнопка подачи заявления -->
          <div class="hidden md:flex items-center space-x-4">
            <template v-if="authStore.isAuthenticated">
              <BaseButton tag="router-link" to="/dashboard" variant="outline" class="mr-2">
                Личный кабинет
              </BaseButton>
              <BaseButton @click="handleLogout" variant="text" class="text-gray-600">
                Выйти
              </BaseButton>
            </template>
            <template v-else>
              <BaseButton tag="router-link" to="/auth" variant="outline" class="mr-2">
                Войти
              </BaseButton>
              <BaseButton tag="router-link" to="/register" variant="primary">
                Подать документы
              </BaseButton>
            </template>
          </div>
          
          <!-- Мобильное меню (кнопка) -->
          <div class="md:hidden">
            <button 
              @click="mobileMenuOpen = !mobileMenuOpen" 
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none"
            >
              <svg 
                class="h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  v-if="!mobileMenuOpen"
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
                <path 
                  v-else
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Мобильное меню (выпадающее) -->
      <div v-if="mobileMenuOpen" class="md:hidden">
        <div class="pt-2 pb-4 space-y-1">
          <router-link 
            to="/" 
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium" 
            :class="[$route.path === '/' ? 'border-primary-500 text-primary-600 bg-primary-50' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300']"
            @click="mobileMenuOpen = false"
          >
            Главная
          </router-link>
          <router-link 
            to="/directions" 
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium" 
            :class="[$route.path.startsWith('/directions') ? 'border-primary-500 text-primary-600 bg-primary-50' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300']"
            @click="mobileMenuOpen = false"
          >
            Направления
          </router-link>
          <router-link 
            to="/faq" 
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium" 
            :class="[$route.path === '/faq' ? 'border-primary-500 text-primary-600 bg-primary-50' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300']"
            @click="mobileMenuOpen = false"
          >
            Вопросы и ответы
          </router-link>
          <router-link 
            to="/contacts" 
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium" 
            :class="[$route.path === '/contacts' ? 'border-primary-500 text-primary-600 bg-primary-50' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300']"
            @click="mobileMenuOpen = false"
          >
            Контакты
          </router-link>
          <div class="mt-4 mx-4">
            <template v-if="authStore.isAuthenticated">
              <BaseButton 
                tag="router-link" 
                to="/dashboard" 
                variant="outline" 
                class="w-full text-center mb-2" 
                size="lg"
                @click="mobileMenuOpen = false"
              >
                Личный кабинет
              </BaseButton>
              <BaseButton 
                @click="handleLogout" 
                variant="text" 
                class="w-full text-center text-gray-600" 
                size="lg"
              >
                Выйти
              </BaseButton>
            </template>
            <template v-else>
              <BaseButton 
                tag="router-link" 
                to="/auth" 
                variant="outline" 
                class="w-full text-center mb-2" 
                size="lg"
                @click="mobileMenuOpen = false"
              >
                Войти
              </BaseButton>
              <BaseButton 
                tag="router-link" 
                to="/register" 
                variant="primary" 
                class="w-full text-center" 
                size="lg"
                @click="mobileMenuOpen = false"
              >
                Подать документы
              </BaseButton>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- Основное содержимое -->
    <main class="flex-grow">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Подвал сайта -->
    <footer class="bg-gray-800 text-white pt-12 pb-8">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <!-- Информация о вузе -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Ташкентский филиал Университета Губкина</h3>
            <p class="text-gray-300 mb-4">
              Филиал Российского государственного университета нефти и газа (НИУ) имени И.М. Губкина в Ташкенте
            </p>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-300 hover:text-white">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path 
                    fill-rule="evenodd" 
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" 
                    clip-rule="evenodd" 
                  />
                </svg>
              </a>
              <a href="#" class="text-gray-300 hover:text-white">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path 
                    d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" 
                  />
                </svg>
              </a>
              <a href="#" class="text-gray-300 hover:text-white">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path 
                    fill-rule="evenodd" 
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" 
                    clip-rule="evenodd" 
                  />
                </svg>
              </a>
              <a href="#" class="text-gray-300 hover:text-white">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path 
                    d="M19.82 4.358a.5.5 0 01.308.541l-2 12a.5.5 0 01-.47.393l-7.5.75a.5.5 0 01-.534-.31l-3-7a.5.5 0 01.076-.543l13-6a.5.5 0 01.62.169z" 
                    clip-rule="evenodd" 
                  />
                </svg>
              </a>
            </div>
          </div>
          
          <!-- Ссылки -->
          <div class="grid grid-cols-2">
            <div>
              <h3 class="text-lg font-semibold mb-4">Информация</h3>
              <ul class="space-y-2">
                <li>
                  <router-link to="/directions" class="text-gray-300 hover:text-white">
                    Направления обучения
                  </router-link>
                </li>
                <li>
                  <router-link to="/faq" class="text-gray-300 hover:text-white">
                    Вопросы и ответы
                  </router-link>
                </li>
                <li>
                  <a href="#" class="text-gray-300 hover:text-white">О филиале</a>
                </li>
                <li>
                  <a href="#" class="text-gray-300 hover:text-white">Новости</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-4">Абитуриентам</h3>
              <ul class="space-y-2">
                <li>
                  <router-link to="/register" class="text-gray-300 hover:text-white">
                    Подать документы
                  </router-link>
                </li>
                <li>
                  <a href="#" class="text-gray-300 hover:text-white">Стоимость обучения</a>
                </li>
                <li>
                  <a href="#" class="text-gray-300 hover:text-white">Экзамены и тесты</a>
                </li>
                <li>
                  <a href="#" class="text-gray-300 hover:text-white">Общежитие</a>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Контакты -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Контакты</h3>
            <ul class="space-y-3">
              <li class="flex">
                <svg class="w-5 h-5 mr-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="text-gray-300">
                  100125, Республика Узбекистан, г. Ташкент, Мирзо-Улугбекский район, ул. Дурмон йули, 34
                </span>
              </li>
              <li class="flex">
                <svg class="w-5 h-5 mr-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span class="text-gray-300">+998 71 262-71-01</span>
              </li>
              <li class="flex">
                <svg class="w-5 h-5 mr-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span class="text-gray-300">info@gubkin.uz</span>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Копирайт -->
        <div class="border-t border-gray-700 pt-6">
          <p class="text-sm text-gray-400 text-center">
            © {{ new Date().getFullYear() }} Ташкентский филиал РГУ нефти и газа (НИУ) имени И.М. Губкина. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { BaseButton } from '@/components/ui';

const route = useRoute();
const router = useRouter();
const mobileMenuOpen = ref(false);
const authStore = useAuthStore();

// Инициализация аутентификации при загрузке приложения
onMounted(async () => {
  await authStore.initAuth();
});

// Обработчик выхода из системы
const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style> 