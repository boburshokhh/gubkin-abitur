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

    <!-- Виджет обратной связи -->
    <FeedbackWidget />
    <StaffFeedbackWidget />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import MainLayout from '@/components/layout/MainLayout.vue';
import FeedbackWidget from '@/components/feedback/feedback-widget.vue';
import StaffFeedbackWidget from '@/components/feedback/staff-feedback-widget.vue';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const showLogoutConfirm = ref(false);

onMounted(() => {
  // initAuth() уже вызван в main.js до монтирования приложения.
  // Здесь только подписываемся на событие видимости страницы.
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
      const lastRefresh = localStorage.getItem('app.auth.lastRefresh');
      
      // Обновляем не чаще чем раз в 30 секунд
      if (lastRefresh && (currentTime - parseInt(lastRefresh)) < 30000) {
        console.log('Пропускаем обновление сессии - слишком рано');
        return;
      }
      
      localStorage.setItem('app.auth.lastRefresh', currentTime.toString());
      
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