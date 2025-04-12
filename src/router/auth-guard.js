import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

// Функция для проверки перед переходом
export default async function authGuard(to, from, next) {
  const authStore = useAuthStore()
  const toast = useToast()
  
  try {
    // Перед проверкой доступа обновляем сессию
    if (authStore.isAuthenticated) {
      const { success, authenticated, error } = await authStore.refreshSession()
      
      if (!success || !authenticated) {
        // Если сессия устарела или была аннулирована
        toast.error(error || 'Сессия истекла. Пожалуйста, войдите заново.')
        
        // Перенаправляем на страницу входа
        return next({
          path: '/auth',
          query: { 
            redirect: to.fullPath,
            session_expired: 'true' 
          }
        })
      }
    }
    
    // Если маршрут требует авторизации и пользователь не авторизован
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      toast.error('Для доступа к этой странице необходимо войти в систему')
      
      return next({
        path: '/auth',
        query: { redirect: to.fullPath }
      })
    }
    
    // Проверка доступа по ролям
    if (to.meta.roles && authStore.isAuthenticated) {
      const requiredRoles = Array.isArray(to.meta.roles) ? to.meta.roles : [to.meta.roles]
      
      const hasRole = requiredRoles.some(role => {
        if (role === 'admin') return authStore.isAdmin
        if (role === 'reviewer') return authStore.isReviewer
        if (role === 'applicant') return authStore.isApplicant
        return false
      })
      
      if (!hasRole) {
        toast.error('У вас недостаточно прав для доступа к этой странице')
        return next('/')
      }
    }
    
    // Если маршрут только для гостей и пользователь авторизован
    if (to.meta.guestOnly && authStore.isAuthenticated) {
      return next('/')
    }
    
    // Во всех остальных случаях разрешаем переход
    return next()
  } catch (err) {
    console.error('Ошибка в auth-guard:', err)
    toast.error('Произошла ошибка при проверке доступа')
    return next('/auth')
  }
} 