<template>
  <footer class="bg-gray-800 mt-auto text-gray-300">
    <div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Первая колонка - контактная информация -->
        <div>
          <h3 class="text-lg font-medium text-gray-100 mb-4">Контактная информация</h3>
          <ul class="space-y-2">
            <li class="flex items-start">
              <svg class="h-5 w-5 text-primary-400 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>
                100125, г.Ташкент Мирзо-Улугбекский район, ул. Дурмон йули, д. 34
              </span>
            </li>
            <li class="flex items-start">
              <svg class="h-5 w-5 text-primary-400 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+998 71 200-01-56</span>
            </li>
            <li class="flex items-start">
              <svg class="h-5 w-5 text-primary-400 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>info@gubkin.uz</span>
            </li>
          </ul>
        </div>

        <!-- Вторая колонка - полезные ссылки -->
        <div>
          <h3 class="text-lg font-medium text-gray-100 mb-4">Полезные ссылки</h3>
          <ul class="space-y-2">
            <li>
              <a href="https://gubkin.uz" target="_blank" class="hover:text-white transition-colors duration-200">
                Официальный сайт
              </a>
            </li>
            <li>
              <router-link to="/admission2025" class="hover:text-white transition-colors duration-200">
                Прием 2026
              </router-link>
            </li>
            <li>
              <router-link to="/faq" class="hover:text-white transition-colors duration-200">
                Вопросы и ответы
              </router-link>
            </li>
            <li>
              <router-link to="/statistics" class="hover:text-white transition-colors duration-200">
                Статистика
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Третья колонка - социальные сети -->
        <div>
          <h3 class="text-lg font-medium text-gray-100 mb-4">Мы в социальных сетях</h3>
          <div class="flex space-x-4">
            <a href="https://t.me/gubkin_uz" target="_blank" class="hover:text-white transition-colors duration-200">
              <span class="sr-only">Telegram</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.067l-1.68 7.95c-.12.542-.5.737-.992.458l-2.73-2.013-1.323 1.272c-.15.15-.274.274-.55.274l.188-2.803 5.073-4.583c.225-.2-.05-.312-.336-.112l-6.262 3.95-2.715-.9c-.575-.175-.587-.575.125-.85l10.662-4.108c.487-.175.912.112.738.737z" fill-rule="evenodd"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/gubkin_uz" target="_blank" class="hover:text-white transition-colors duration-200">
              <span class="sr-only">Instagram</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/gubkinuztashkent" target="_blank" class="hover:text-white transition-colors duration-200">
              <span class="sr-only">Facebook</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/>
              </svg>
            </a>
          </div>
          

        </div>
      </div>
      
      <div class="mt-8 pt-8 border-t border-gray-700">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p class="text-sm text-gray-500">
            &copy; {{ new Date().getFullYear() }} Ташкентский филиал Университета Губкина. Все права защищены.
          </p>
          <div class="mt-4 md:mt-0 flex space-x-6">
            <router-link to="/privacy" class="text-sm text-gray-400 hover:text-white transition-colors duration-200">
              Политика конфиденциальности
            </router-link>
            <router-link to="/terms" class="text-sm text-gray-400 hover:text-white transition-colors duration-200">
              Условия использования
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue';

const email = ref('');

const subscribe = () => {
  // Здесь будет логика для подписки на рассылку
  alert(`Спасибо за подписку: ${email.value}`);
  email.value = '';
};
</script> 