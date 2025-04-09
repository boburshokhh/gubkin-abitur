<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img 
        class="mx-auto h-24 w-auto" 
        src="@/assets/logo.svg" 
        alt="Логотип" 
      />
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {{ success ? 'Успешно!' : 'Обработка...' }}
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        {{ success ? 'Ваша учетная запись успешно подтверждена' : 'Пожалуйста, подождите...' }}
      </p>
      
      <div v-if="loading" class="flex justify-center mt-6">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
      
      <div v-if="error" class="mt-6 bg-red-50 border border-red-200 rounded-md p-4 max-w-md mx-auto">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Ошибка аутентификации</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading" class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex flex-col space-y-4">
        <BaseButton v-if="success" tag="router-link" to="/" class="w-full mx-auto sm:w-64">
          Перейти на главную
        </BaseButton>
        <BaseButton v-else tag="router-link" to="/auth" variant="outline" class="w-full mx-auto sm:w-64">
          Вернуться к авторизации
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/api/supabase';
import { BaseButton } from '@/components/ui';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const success = ref(false);
const error = ref('');

onMounted(async () => {
  try {
    // Проверяем наличие token_hash в URL для подтверждения email
    const queryParams = new URLSearchParams(window.location.search);
    const tokenHash = queryParams.get('token_hash');
    const type = queryParams.get('type');
    const redirectTo = queryParams.get('redirectTo') || '/';
    
    if (tokenHash && type) {
      // Обрабатываем подтверждение email
      const { error: verifyError } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash
      });
      
      if (verifyError) {
        error.value = `Ошибка подтверждения: ${verifyError.message}`;
        success.value = false;
        return;
      }
    }
    
    // Обновляем данные пользователя из сессии
    const { error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      error.value = sessionError.message;
      success.value = false;
      return;
    }
    
    // Обновляем данные пользователя в store
    await authStore.initAuth();
    success.value = true;
    
    // Перенаправляем на главную страницу через 2 секунды
    setTimeout(() => {
      router.push(redirectTo);
    }, 2000);
  } catch (err) {
    console.error('Ошибка при обработке callback:', err);
    error.value = 'Что-то пошло не так при обработке аутентификации';
    success.value = false;
  } finally {
    loading.value = false;
  }
});
</script> 