import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import HomePage from '@/views/HomePage.vue'
import AuthPage from '@/views/AuthPage.vue'
import VerifyEmailPage from '@/views/VerifyEmailPage.vue'
import AuthCallbackPage from '@/views/AuthCallbackPage.vue'
import NotFoundPage from '@/views/NotFoundPage.vue'

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
    path: '/admission2025',
    name: 'admission2025',
    component: () => import('@/views/Admission2025Page.vue'),
    meta: {
      title: 'Приёмная кампания 2025/2026 - Филиал Губкинского университета в Ташкенте'
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
    component: VerifyEmailPage,
    meta: {
      title: 'Подтверждение email - Приёмная кампания Губкинского университета'
    }
  },
  {
    path: '/auth/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/ForgotPasswordPage.vue'),
    meta: {
      title: 'Восстановление пароля - Приёмная кампания Губкинского университета',
      guestOnly: true
    }
  },
  {
    path: '/auth/reset-password',
    name: 'reset-password',
    component: () => import('@/views/ResetPasswordPage.vue'),
    meta: {
      title: 'Сброс пароля - Приёмная кампания Губкинского университета',
      guestOnly: true
    }
  },
  {
    path: '/auth/accept-invitation',
    name: 'accept-invitation',
    component: () => import('@/views/AcceptInvitationPage.vue'),
    meta: {
      title: 'Принять приглашение - Приёмная кампания Губкинского университета',
      guestOnly: true
    }
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: AuthCallbackPage,
    meta: {
      title: 'Подтверждение авторизации - Приёмная кампания Губкинского университета'
    },
    beforeEnter: (to, from, next) => {
      console.log('Обработка auth callback маршрута');
      next();
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
  {
    path: '/statistics',
    name: 'statistics',
    component: () => import('@/views/StatisticsOverview.vue'),
    meta: {
      title: 'Статистика приёмной кампании - Приёмная кампания Губкинского университета'
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

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title || 'Приёмная кампания Губкинского университета'

  const authStore = useAuthStore()
  const toast = useToast()

  // Ждём завершения initAuth() из main.js (только при первой загрузке)
  if (authStore.loading) {
    await new Promise(resolve => {
      const check = setInterval(() => {
        if (!authStore.loading) { clearInterval(check); resolve() }
      }, 50)
    })
  }

  // Проверка требований аутентификации
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      toast.error('Необходимо войти в систему')
      return next({ path: '/auth', query: { redirect: to.fullPath } })
    }
  }

  // Проверка прав администратора
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!authStore.isAdmin) {
      toast.error('У вас нет прав администратора для доступа к этой странице')
      return next('/')
    }
  }

  // Проверка прав сотрудника приемной комиссии
  if (to.matched.some(record => record.meta.requiresReviewer)) {
    if (!authStore.isReviewer) {
      toast.error('У вас нет прав сотрудника для доступа к этой странице')
      return next('/')
    }
  }

  // Маршрут только для гостей — перенаправляем авторизованного пользователя
  if (to.matched.some(record => record.meta.guestOnly)) {
    if (authStore.isAuthenticated) {
      if (authStore.isAdmin) return next('/admin')
      if (authStore.isReviewer) return next('/reviewer')
      return next('/dashboard')
    }
  }

  next()
})

export default router 