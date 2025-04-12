<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
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

// Функция для декодирования сообщений об ошибках
const formatErrorMessage = (message) => {
  if (!message) return 'Неизвестная ошибка';
  
  // Проверяем, если сообщение содержит +, то оно, возможно, закодировано
  if (message.includes('+')) {
    try {
      // Пробуем декодировать
      return decodeURIComponent(message.replace(/\+/g, ' '));
    } catch (e) {
      console.error('Ошибка при декодировании сообщения:', e);
      return message;
    }
  }
  
  return message;
};

// Функция для извлечения и обработки параметров из хэша URL
const parseHashParams = (hashStr) => {
  const params = {};
  if (!hashStr) return params;
  
  try {
    const parts = hashStr.split('&');
    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key && value) {
        // Используем декодирование для всех значений
        params[key] = decodeURIComponent(value.replace(/\+/g, ' '));
      }
    }
  } catch (e) {
    console.error('Ошибка при обработке хэш-параметров:', e);
  }
  
  return params;
};

onMounted(async () => {
  try {
    console.log('Начало обработки callback');
    console.log('URL:', window.location.href);
    
    // Извлекаем хэш из URL, пропуская первый символ '#'
    const hashStr = window.location.hash.substring(1);
    console.log('Исходный хэш:', hashStr);
    
    // Используем улучшенную функцию для парсинга хэш-параметров
    const hashParams = parseHashParams(hashStr);
    
    const accessToken = hashParams.access_token;
    const refreshToken = hashParams.refresh_token;
    const type = hashParams.type;
    const errorCode = hashParams.error_code;
    const errorDescription = hashParams.error_description;
    
    console.log('Обработанные хэш параметры:', { 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken,
      type,
      errorCode: errorCode || 'нет',
      errorDesc: errorDescription ? '(присутствует)' : 'нет'
    });
    
    // Проверяем наличие ошибок в hash
    if (errorCode || errorDescription) {
      console.error('Получена ошибка аутентификации:', errorCode, errorDescription);
      // Используем форматированное сообщение об ошибке
      error.value = formatErrorMessage(errorDescription) || 'Произошла ошибка при аутентификации';
      loading.value = false;
      return;
    }
    
    // Получаем query параметры
    const queryParams = new URLSearchParams(window.location.search);
    const tokenHash = queryParams.get('token_hash');
    const queryType = queryParams.get('type');
    const queryErrorCode = queryParams.get('error_code');
    const queryErrorDescription = queryParams.get('error_description');
    
    // Проверяем наличие ошибок в query
    if (queryErrorCode || queryErrorDescription) {
      console.error('Получена ошибка в query:', queryErrorCode, queryErrorDescription);
      // Также форматируем сообщение об ошибке из query-параметров
      error.value = formatErrorMessage(queryErrorDescription) || 'Произошла ошибка при аутентификации';
      loading.value = false;
      return;
    }
    
    console.log('Query параметры:', {
      hasTokenHash: !!tokenHash,
      type: queryType
    });
    
    // Обрабатываем разные сценарии аутентификации
    if (accessToken) {
      console.log('Обработка сценария с access_token');
      
      // Устанавливаем токены в сессию
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (sessionError) {
        console.error('Ошибка установки сессии:', sessionError);
        throw sessionError;
      }
      
      console.log('Сессия успешно установлена');
      
      // Обновляем данные пользователя в store
      await authStore.initAuth();
      success.value = true;
      
      // Перенаправляем на главную страницу через 2 секунды
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } else if (tokenHash && queryType) {
      console.log('Обработка верификации через token_hash');
      
      // Обрабатываем подтверждение email
      const { error: verifyError } = await supabase.auth.verifyOtp({
        type: queryType,
        token_hash: tokenHash
      });
      
      if (verifyError) {
        console.error('Ошибка верификации:', verifyError);
        // Форматируем сообщение об ошибке верификации
        error.value = formatErrorMessage(verifyError.message) || 'Ошибка подтверждения email';
        throw verifyError;
      }
      
      console.log('Email успешно подтвержден');
      
      // Обновляем данные пользователя из сессии
      await authStore.initAuth();
      success.value = true;
      
      // Перенаправляем на главную страницу через 2 секунды
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } else {
      console.error('Не найдены необходимые параметры для аутентификации');
      error.value = 'Ссылка аутентификации некорректна или устарела';
    }
  } catch (err) {
    console.error('Ошибка при обработке callback:', err);
    // Форматируем сообщение об ошибке из исключения
    error.value = formatErrorMessage(err.message) || 'Что-то пошло не так при обработке аутентификации';
    success.value = false;
  } finally {
    loading.value = false;
  }
});
</script> 