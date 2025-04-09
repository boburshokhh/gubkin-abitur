<template>
  <main class="container mx-auto px-4 py-6 md:py-8">
    <h1 class="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Мой профиль</h1>

    <!-- Навигационные кнопки -->
    <div class="bg-white shadow rounded-lg mb-6 md:mb-8 p-3 md:p-4">
      <div class="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4">
        <router-link 
          to="/dashboard/applications" 
          class="px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center sm:justify-start"
          :class="[$route.path.includes('/dashboard/applications') && !$route.params.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200']"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Мои заявления
          </span>
        </router-link>
        
        <router-link 
          to="/dashboard/profile" 
          class="px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center sm:justify-start"
          :class="[$route.path === '/dashboard/profile' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200']"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Мой профиль
          </span>
        </router-link>
        
        <router-link 
          to="/register" 
          class="px-3 md:px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center sm:justify-start"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Подать новое заявление
          </span>
        </router-link>
      </div>
    </div>

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
      <div class="bg-white shadow rounded-lg overflow-hidden mb-6 md:mb-8">
        <div class="bg-primary-600 px-4 py-3 md:px-6 md:py-4">
          <h2 class="text-lg md:text-xl font-medium text-white">Основная информация</h2>
        </div>
        <div class="p-4 md:p-6">
          <div class="mb-6 grid grid-cols-1 gap-4 md:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div class="flex flex-col sm:flex-row sm:items-center">
                <span class="text-gray-900">{{ authStore.user?.email }}</span>
                <span 
                  :class="[
                    'mt-1 sm:mt-0 sm:ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', 
                    authStore.isEmailConfirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  ]"
                >
                  {{ authStore.isEmailConfirmed ? 'Подтвержден' : 'Не подтвержден' }}
                </span>
                <button 
                  v-if="!authStore.isEmailConfirmed" 
                  @click="resendVerification" 
                  class="mt-2 sm:mt-0 sm:ml-2 text-xs text-primary-600 hover:text-primary-800"
                  :disabled="isResendingVerification"
                >
                  {{ isResendingVerification ? 'Отправка...' : 'Отправить код подтверждения' }}
                </button>
              </div>
            </div>
          </div>

          <form @submit.prevent="saveProfile">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label for="first_name" class="block text-sm font-medium text-gray-700">Имя</label>
                <input 
                  id="first_name" 
                  v-model="form.first_name" 
                  type="text" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label for="last_name" class="block text-sm font-medium text-gray-700">Фамилия</label>
                <input 
                  id="last_name" 
                  v-model="form.last_name" 
                  type="text" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label for="middle_name" class="block text-sm font-medium text-gray-700">Отчество</label>
                <input 
                  id="middle_name" 
                  v-model="form.middle_name" 
                  type="text" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700">Телефон</label>
                <input 
                  id="phone" 
                  v-model="form.phone" 
                  type="tel" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div class="mt-6 flex justify-center sm:justify-end">
              <button 
                type="submit" 
                class="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                :disabled="isSaving"
              >
                <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSaving ? 'Сохранение...' : 'Сохранить изменения' }}
              </button>
            </div>
          </form>
        </div>
      </div>

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
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/api/supabase';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isLoading = ref(true);
const isSaving = ref(false);
const isChangingPassword = ref(false);
const isResendingVerification = ref(false);
const error = ref('');
const passwordError = ref('');
const showSuccessMessage = ref(false);
const successMessage = ref('');

// Форма для данных профиля
const form = reactive({
  first_name: '',
  last_name: '',
  middle_name: '',
  phone: ''
});

// Форма для изменения пароля
const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
});

// Загрузка данных профиля
onMounted(async () => {
  try {
    // Если профиль уже есть в store, используем его
    if (authStore.profile) {
      initForm(authStore.profile);
      isLoading.value = false;
      return;
    }
    
    // Иначе загружаем профиль
    await authStore.initAuth();
    
    if (authStore.profile) {
      initForm(authStore.profile);
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

// Заполнение формы данными профиля
const initForm = (profile) => {
  form.first_name = profile.first_name || '';
  form.last_name = profile.last_name || '';
  form.middle_name = profile.middle_name || '';
  form.phone = profile.phone || '';
};

// Сохранение данных профиля
const saveProfile = async () => {
  isSaving.value = true;
  
  try {
    const result = await authStore.updateProfile(form);
    
    if (result.success) {
      showSuccessNotification('Данные профиля успешно сохранены');
    } else {
      error.value = result.error || 'Не удалось сохранить данные профиля';
    }
  } catch (err) {
    console.error('Ошибка при сохранении профиля:', err);
    error.value = 'Не удалось сохранить данные профиля';
  } finally {
    isSaving.value = false;
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
  
  if (passwordForm.new_password.length < 6) {
    passwordError.value = 'Пароль должен содержать минимум 6 символов';
    return;
  }
  
  if (passwordForm.new_password !== passwordForm.confirm_password) {
    passwordError.value = 'Пароли не совпадают';
    return;
  }
  
  passwordError.value = '';
  isChangingPassword.value = true;
  
  try {
    // Сначала входим с текущим паролем, чтобы убедиться, что он верный
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authStore.user.email,
      password: passwordForm.current_password
    });
    
    if (signInError) {
      passwordError.value = 'Неверный текущий пароль';
      return;
    }
    
    // Теперь меняем пароль
    const { error: updateError } = await supabase.auth.updateUser({
      password: passwordForm.new_password
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

// Отправка кода подтверждения email
const resendVerification = async () => {
  if (!authStore.user?.email || isResendingVerification.value) return;
  
  isResendingVerification.value = true;
  
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
  } finally {
    isResendingVerification.value = false;
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