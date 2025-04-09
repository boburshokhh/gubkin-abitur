import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomePage from '@/views/HomePage.vue'
import DirectionsPage from '@/views/DirectionsPage.vue'
import DirectionDetailsPage from '@/views/DirectionDetailsPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import FaqPage from '@/views/FaqPage.vue'
import NotFoundPage from '@/views/NotFoundPage.vue'
import AuthPage from '@/views/AuthPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: {
      title: 'Главная - Приёмная кампания Губкинского университета'
    }
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthPage,
    meta: {
      title: 'Авторизация - Приёмная кампания Губкинского университета',
      guestOnly: true
    }
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: () => import('@/views/VerifyEmailPage.vue'),
    meta: {
      title: 'Подтверждение email - Приёмная кампания Губкинского университета'
    }
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: () => import('@/views/AuthCallbackPage.vue'),
    meta: {
      title: 'Подтверждение авторизации - Приёмная кампания Губкинского университета'
    }
  },
  {
    path: '/directions',
    name: 'directions',
    component: DirectionsPage,
    meta: {
      title: 'Направления обучения - Приёмная кампания Губкинского университета'
    }
  },
  {
    path: '/directions/:id',
    name: 'direction-details',
    component: DirectionDetailsPage,
    meta: {
      title: 'Детали направления - Приёмная кампания Губкинского университета'
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: {
      title: 'Подать документы - Приёмная кампания Губкинского университета',
      requiresAuth: true
    }
  },
  {
    path: '/faq',
    name: 'faq',
    component: FaqPage,
    meta: {
      title: 'Вопросы и ответы - Приёмная кампания Губкинского университета'
    }
  },
  // Маршруты личного кабинета (требуют авторизации)
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/DashboardPage.vue'),
    meta: {
      title: 'Личный кабинет - Приёмная комиссия Губкинского университета',
      requiresAuth: true
    }
  },
  {
    path: '/dashboard/applications',
    name: 'dashboard-applications',
    component: () => import('@/views/dashboard/ApplicationsPage.vue'),
    meta: {
      title: 'Мои заявки - Приёмная кампания Губкинского университета',
      requiresAuth: true
    }
  },
  {
    path: '/dashboard/applications/:id',
    name: 'dashboard-application-details',
    component: () => import('@/views/dashboard/ApplicationDetailsPage.vue'),
    meta: {
      title: 'Детали заявки - Приёмная кампания Губкинского университета',
      requiresAuth: true
    }
  },
  {
    path: '/dashboard/profile',
    name: 'dashboard-profile',
    component: () => import('@/views/dashboard/ProfilePage.vue'),
    meta: {
      title: 'Мой профиль - Приёмная кампания Губкинского университета',
      requiresAuth: true
    }
  },
  // Маршрут для страницы "Не найдено"
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage,
    meta: {
      title: 'Страница не найдена - Приёмная кампания Губкинского университета'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // Всегда прокручиваем страницу в верх при переходе
    return { top: 0 }
  }
})

// Защита маршрутов и обновление заголовка страницы
router.beforeEach(async (to, from, next) => {
  // Устанавливаем заголовок страницы
  document.title = to.meta.title || 'Приёмная кампания Губкинского университета'
  
  // Проверка требований аутентификации и прав доступа
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const authStore = useAuthStore();
    
    // Если не авторизован, перенаправляем на страницу входа
    if (!authStore.isAuthenticated) {
      next({
        path: '/auth',
        query: { redirect: to.fullPath }
      });
      return;
    }
  }
  
  // Если маршрут только для гостей, и пользователь авторизован
  if (to.matched.some(record => record.meta.guestOnly)) {
    const authStore = useAuthStore();
    if (authStore.isAuthenticated) {
      next('/dashboard');
      return;
    }
  }
  
  next();
});

export default router 