import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import HomePage from '@/views/HomePage.vue'
import AuthPage from '@/views/AuthPage.vue'
import NotFoundPage from '@/views/NotFoundPage.vue'
import { watch } from 'vue'

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
    },
    beforeEnter: (to, from, next) => {
      console.log('Обработка auth callback маршрута');
      next();
    }
  },
  {
    path: '/directions',
    name: 'directions',
    component: () => import('@/views/DirectionsPage.vue'),
    meta: {
      title: 'Направления обучения - Приёмная кампания Губкинского университета'
    }
  },
  {
    path: '/directions/:id',
    name: 'direction-details',
    component: () => import('@/views/DirectionDetailsPage.vue'),
    meta: {
      title: 'Детали направления - Приёмная кампания Губкинского университета'
    }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterPage.vue'),
    meta: {
      title: 'Подать документы - Приёмная кампания Губкинского университета',
      requiresAuth: true
    }
  },
  {
    path: '/faq',
    name: 'faq',
    component: () => import('@/views/FaqPage.vue'),
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
  // Маршруты для админ-панели
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminPage.vue'),
    meta: {
      title: 'Панель администратора - Приёмная кампания Губкинского университета',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  // Маршрут для панели сотрудника приемной комиссии
  {
    path: '/reviewer',
    name: 'reviewer',
    component: () => import('@/views/ReviewerPage.vue'),
    meta: {
      title: 'Панель сотрудника приемной комиссии - Приёмная кампания Губкинского университета',
      requiresAuth: true,
      requiresReviewer: true
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
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// --- Восстанавливаем исходный beforeEach хук (или модифицированный без isRouteLoading) ---
router.beforeEach(async (to, from, next) => {
  // Устанавливаем заголовок страницы
  document.title = to.meta.title || 'Приёмная кампания Губкинского университета';
  
  const authStore = useAuthStore();
  const toast = useToast();
  
  // Ожидание инициализации аутентификации (если нужно)
  if (authStore.loading) {
    console.log('Ожидание инициализации аутентификации...')
    await new Promise(resolve => {
        const checkLoading = setInterval(() => {
            if (!authStore.loading) {
                clearInterval(checkLoading);
                resolve();
            }
        }, 50);
    });
    console.log('Инициализация аутентификации завершена');
  }
  
  // Перед проверкой доступа обновляем сессию, если пользователь уже авторизован
  if (authStore.isAuthenticated) {
    try {
      const { success } = await authStore.refreshSession();
      
      if (!success || !authStore.isAuthenticated) {
        console.log('Сессия недействительна, необходимо войти заново');
        localStorage.removeItem('supabase.auth.token');
        toast.error('Сессия истекла. Пожалуйста, войдите снова.');
        
        return next({
          path: '/auth',
          query: { redirect: to.fullPath }
        });
      }
    } catch (err) {
      console.error('Ошибка проверки сессии:', err);
    }
  }
  
  // Проверка требований аутентификации
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      console.log('Доступ запрещен: требуется авторизация');
      toast.error('Необходимо войти в систему');
      return next({
        path: '/auth',
        query: { redirect: to.fullPath }
      });
    }
  }
  
  // Проверка прав администратора
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!authStore.isAdmin) {
      toast.error('У вас нет прав администратора для доступа к этой странице');
      return next('/');
    }
  }
  
  // Проверка прав сотрудника приемной комиссии
  if (to.matched.some(record => record.meta.requiresReviewer)) {
    if (!authStore.isReviewer) {
      toast.error('У вас нет прав сотрудника для доступа к этой странице');
      return next('/');
    }
  }
  
  // Если маршрут только для гостей, и пользователь авторизован
  if (to.matched.some(record => record.meta.guestOnly)) {
    if (authStore.isAuthenticated) {
      // Перенаправляем на дашборд или соответствующую страницу по роли
      if (authStore.isAdmin) {
        return next('/admin');
      } else if (authStore.isReviewer) {
        return next('/reviewer');
      } else {
        return next('/dashboard');
      }
    }
  }

  // Если все проверки пройдены
  next();
});

export default router 