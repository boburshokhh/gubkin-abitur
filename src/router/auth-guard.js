import { useAuthStore } from '@/stores/auth'

// Функция для проверки перед переходом
export default async function authGuard(to, from, next) {
  const authStore = useAuthStore()
  
  // Если маршрут требует авторизации и пользователь не авторизован
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('Доступ запрещен: требуется авторизация')
    // Перенаправляем на страницу входа
    return next({
      path: '/auth',
      query: { redirect: to.fullPath }
    })
  }
  
  // Если маршрут только для гостей и пользователь авторизован
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    console.log('Перенаправление: пользователь уже авторизован')
    // Перенаправляем на дашборд
    return next('/dashboard')
  }
  
  // Во всех остальных случаях разрешаем переход
  return next()
} 