import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import 'flowbite'
import { useAuthStore } from './stores/auth'

// Импорт и стили для Vue-Toastification
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Создаем экземпляр Pinia и добавляем плагин для сохранения состояния
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// Опции для уведомлений
const toastOptions = {
  transition: 'Vue-Toastification__bounce',
  maxToasts: 3,
  newestOnTop: true,
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
}

// Создаем приложение и подключаем плагины
const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)
app.use(ElementPlus)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Обработка ошибок
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Global Error:', err)
  console.error('Error Info:', info)
}

// Инициализация аутентификации перед маунтом приложения
const authStore = useAuthStore(pinia)
authStore.initAuth().finally(() => {
  app.mount('#app')
}) 