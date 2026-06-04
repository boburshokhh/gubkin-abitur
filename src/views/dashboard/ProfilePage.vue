<template>
  <main class="container mx-auto px-4 py-6 md:py-8">
    <h1 class="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Мой профиль</h1>

    <!-- Навигационные кнопки (только для абитуриентов) -->
    <DashboardNavigation v-if="!authStore.isAdmin && !authStore.isReviewer" />

    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 md:p-6 mb-6 md:mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center">
        <svg class="h-6 w-6 text-red-600 mr-3 mb-2 sm:mb-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="text-lg font-medium">Ошибка при загрузке данных</h3>
          <p class="mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-else>
      <!-- Основная информация о профиле -->
      <ProfileForm 
        :profile-data="profileData" 
        :is-saving="isSavingProfile" 
        @save="saveProfile"
        @resend-verification="handleResendVerification"
        class="mb-6 md:mb-8"
      />

      <!-- Изменение пароля -->
      <div class="bg-white shadow rounded-lg overflow-hidden mb-6 md:mb-8">
        <div class="bg-primary-600 px-4 py-3 md:px-6 md:py-4">
          <h2 class="text-lg md:text-xl font-medium text-white">Изменение пароля</h2>
        </div>
        <div class="p-4 md:p-6">
          <form @submit.prevent="changePassword">
            <div class="grid grid-cols-1 gap-4 md:gap-6">
              <div>
                <label for="current_password" class="block text-sm font-medium text-gray-700">Текущий пароль</label>
                <input 
                  id="current_password" 
                  v-model="passwordForm.current_password" 
                  type="password" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              
              <div class="h-4"></div>
              
              <div>
                <label for="new_password" class="block text-sm font-medium text-gray-700">Новый пароль</label>
                <input 
                  id="new_password" 
                  v-model="passwordForm.new_password" 
                  type="password" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label for="confirm_password" class="block text-sm font-medium text-gray-700">Подтверждение пароля</label>
                <input 
                  id="confirm_password" 
                  v-model="passwordForm.confirm_password" 
                  type="password" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div v-if="passwordError" class="mt-4 text-red-600 text-sm">
              {{ passwordError }}
            </div>

            <div class="mt-6 flex justify-center sm:justify-end">
              <button 
                type="submit" 
                class="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                :disabled="isChangingPassword"
              >
                <svg v-if="isChangingPassword" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isChangingPassword ? 'Изменение...' : 'Изменить пароль' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Управление аккаунтом -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="bg-primary-600 px-4 py-3 md:px-6 md:py-4">
          <h2 class="text-lg md:text-xl font-medium text-white">Управление аккаунтом</h2>
        </div>
        <div class="p-4 md:p-6">
          <div class="space-y-4">
            <div>
              <p class="text-gray-700 mb-2">Выход из системы</p>
              <button 
                @click="logout" 
                class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Выйти из аккаунта
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Сообщение об успешном сохранении -->
    <div 
      v-if="showSuccessMessage" 
      class="fixed inset-x-0 bottom-0 sm:inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
    >
      <div class="max-w-sm w-full bg-green-100 shadow-lg rounded-lg pointer-events-auto overflow-hidden">
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button 
                @click="showSuccessMessage = false" 
                class="bg-green-100 rounded-md inline-flex text-green-500 hover:text-green-700 focus:outline-none"
              >
                <span class="sr-only">Закрыть</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { appApi } from '@/api/app-api';
import DashboardNavigation from '@/components/dashboard/DashboardNavigation.vue';
import ProfileForm from '@/components/profile/ProfileForm.vue';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(true);
const isSavingProfile = ref(false);
const isChangingPassword = ref(false);
const error = ref('');
const passwordError = ref('');
const showSuccessMessage = ref(false);
const successMessage = ref('');

// Реактивные данные для формы профиля
const profileData = ref({});

// Форма для изменения пароля
const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
});

// Загрузка данных профиля
onMounted(async () => {
  try {
    if (!authStore.profile) {
      await authStore.initAuth();
    }
    
    if (authStore.profile) {
      // Передаем копию, чтобы избежать прямой мутации
      profileData.value = { ...authStore.profile }; 
    } else {
      error.value = 'Не удалось загрузить данные профиля';
    }
  } catch (err) {
    console.error('Ошибка при загрузке профиля:', err);
    error.value = 'Не удалось загрузить данные профиля';
  } finally {
    isLoading.value = false;
  }
});

// Сохранение данных профиля (обработчик события от ProfileForm)
const saveProfile = async (formData) => {
  isSavingProfile.value = true;
  try {
    const result = await authStore.updateProfile(formData);
    
    if (result.success) {
      // Обновляем локальные данные после успешного сохранения
      profileData.value = { ...formData }; 
      showSuccessNotification('Данные профиля успешно сохранены');
    } else {
      error.value = result.error || 'Не удалось сохранить данные профиля';
    }
  } catch (err) {
    console.error('Ошибка при сохранении профиля:', err);
    error.value = 'Не удалось сохранить данные профиля';
  } finally {
    isSavingProfile.value = false;
  }
};

// Изменение пароля
const changePassword = async () => {
  // Валидация
  if (!passwordForm.current_password) {
    passwordError.value = 'Введите текущий пароль';
    return;
  }
  
  if (!passwordForm.new_password) {
    passwordError.value = 'Введите новый пароль';
    return;
  }
  
  if (passwordForm.new_password.length < 10) {
    passwordError.value = 'Пароль должен содержать минимум 10 символов';
    return;
  }
  
  if (passwordForm.new_password !== passwordForm.confirm_password) {
    passwordError.value = 'Пароли не совпадают';
    return;
  }
  
  passwordError.value = '';
  isChangingPassword.value = true;
  
  try {
    const { error: updateError } = await appApi.auth.updateUser({
      password: passwordForm.new_password,
      currentPassword: passwordForm.current_password
    });
    
    if (updateError) {
      passwordError.value = updateError.message || 'Не удалось изменить пароль';
      return;
    }
    
    // Сбрасываем форму
    passwordForm.current_password = '';
    passwordForm.new_password = '';
    passwordForm.confirm_password = '';
    
    showSuccessNotification('Пароль успешно изменен');
  } catch (err) {
    console.error('Ошибка при изменении пароля:', err);
    passwordError.value = 'Не удалось изменить пароль';
  } finally {
    isChangingPassword.value = false;
  }
};

// Отправка кода подтверждения email (обработчик события от ProfileForm)
const handleResendVerification = async () => {
  if (!authStore.user?.email) return;
  
  try {
    const result = await authStore.sendVerificationEmail(authStore.user.email);
    
    if (result.success) {
      showSuccessNotification('Код подтверждения отправлен на ваш email');
    } else {
      error.value = result.error || 'Не удалось отправить код подтверждения';
    }
  } catch (err) {
    console.error('Ошибка при отправке кода подтверждения:', err);
    error.value = 'Не удалось отправить код подтверждения';
  }
};

// Выход из системы
const logout = async () => {
  try {
    const result = await authStore.logout();
    
    if (result.success) {
      router.push('/');
    } else {
      error.value = result.error || 'Не удалось выйти из системы';
    }
  } catch (err) {
    console.error('Ошибка при выходе из системы:', err);
    error.value = 'Не удалось выйти из системы';
  }
};

// Показать уведомление об успешном действии
const showSuccessNotification = (message) => {
  successMessage.value = message;
  showSuccessMessage.value = true;
  
  // Скрыть уведомление через 5 секунд
  setTimeout(() => {
    showSuccessMessage.value = false;
  }, 5000);
};
</script> 