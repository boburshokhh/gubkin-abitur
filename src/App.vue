<template>
  <div id="app" class="min-h-screen flex flex-col">
    <!-- Используем MainLayout напрямую -->
    <MainLayout>
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </MainLayout>
    <vue-toastification />
    
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import MainLayout from '@/components/layout/MainLayout.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const showLogoutConfirm = ref(false);

// Инициализация аутентификации при загрузке приложения
onMounted(async () => {
  // Проверяем, есть ли признаки наличия сессии в localStorage, 
  // но при этом пользователь не считается авторизованным
  const hasLocalToken = localStorage.getItem('supabase.auth.token');
  const isAuthenticated = !!authStore.user || authStore.isAuthenticated;
  
  console.log('App mounted', {
    hasToken: !!hasLocalToken,
    isAuthenticated,
    isLoading: authStore.loading
  });
  
  // Инициализируем состояние аутентификации
  try {
    await authStore.initAuth();
    console.log('Auth initialized');
    
    // Проверяем состояние после инициализации
    if (hasLocalToken && !authStore.isAuthenticated) {
      console.warn('После инициализации токен есть, но пользователь не авторизован. Проверяем дополнительно...');
      
      // Если после инициализации по-прежнему есть несоответствие,
      // пробуем еще раз обновить сессию напрямую
      try {
        const { success, authenticated } = await authStore.refreshSession();
        if (success && authenticated) {
          console.log('Сессия успешно восстановлена');
          toast.success('Сессия восстановлена');
        } else if (hasLocalToken) {
          // Если не удалось восстановить сессию, но токен есть,
          // возможно, токен стал недействительным или произошла ошибка
          console.warn('Не удалось восстановить сессию, возможно, требуется повторный вход');
        }
      } catch (refreshError) {
        console.error('Ошибка при обновлении сессии:', refreshError);
      }
    }
  } catch (err) {
    console.error('Ошибка инициализации аутентификации:', err);
  }
  
  // Слушаем события изменения видимости страницы
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      refreshUserData();
    }
  });
});

// Обработчик выхода из системы
const handleLogout = async () => {
  try {
    const { success } = await authStore.logout();
    if (success) {
      router.push('/');
      toast.success('Вы успешно вышли из системы');
    }
  } catch (error) {
    console.error('Ошибка при выходе из системы:', error);
    toast.error('Не удалось выйти из системы');
  }
};

// Обновление данных пользователя при переходе между маршрутами
let refreshTimeout = null;
const refreshUserData = async () => {
  // Добавляем debounce для предотвращения частых вызовов
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }
  
  refreshTimeout = setTimeout(async () => {
    if (!authStore.isAuthenticated || authStore.loading) {
      return;
    }
    
    try {
      // Проверяем, нужно ли обновлять сессию
      const currentTime = Date.now();
      const lastRefresh = localStorage.getItem('supabase.auth.lastRefresh');
      
      // Обновляем не чаще чем раз в 30 секунд
      if (lastRefresh && (currentTime - parseInt(lastRefresh)) < 30000) {
        console.log('Пропускаем обновление сессии - слишком рано');
        return;
      }
      
      localStorage.setItem('supabase.auth.lastRefresh', currentTime.toString());
      
      const { success, authenticated } = await authStore.refreshSession();
      
      if (success && !authenticated) {
        // Сессия истекла или пользователь вышел в другой вкладке
        toast.info('Сессия завершена. Пожалуйста, войдите снова.');
        router.push('/auth');
      }
    } catch (error) {
      console.error('Ошибка при обновлении данных пользователя:', error);
    }
  }, 500); // Debounce 500ms
};

// Обновляем данные пользователя при изменении маршрута
// только когда маршрут требует авторизации или проверки роли
watch(() => router.currentRoute.value, (newRoute, oldRoute) => {
  // Пропускаем если маршрут не изменился или не требует авторизации
  if (!newRoute.meta.requiresAuth && !newRoute.meta.roles) {
    return;
  }
  
  // Пропускаем если переходим с одного защищенного маршрута на другой
  if (oldRoute && (oldRoute.meta.requiresAuth || oldRoute.meta.roles)) {
    console.log('Пропускаем обновление при переходе между защищенными маршрутами');
    return;
  }
  
  refreshUserData();
});

// Подтверждение выхода из системы
const confirmLogout = () => {
  showLogoutConfirm.value = false;
};

// Отмена выхода из системы
const cancelLogout = () => {
  showLogoutConfirm.value = false;
};
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style> 