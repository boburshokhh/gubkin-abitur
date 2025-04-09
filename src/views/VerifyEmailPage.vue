<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img 
        class="mx-auto h-24 w-auto" 
        src="@/assets/logo.svg" 
        alt="Логотип" 
      />
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Подтверждение Email
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        На ваш email был отправлен код подтверждения
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form v-if="!verified" @submit.prevent="verifyCode" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email адрес
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                readonly
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700">
              Код подтверждения
            </label>
            <div class="mt-1">
              <input
                id="code"
                v-model="code"
                name="code"
                type="text"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Введите код из email"
              />
            </div>
            <p class="mt-2 text-sm text-gray-500">
              Введите код, который был отправлен на ваш email. 
              Если вы не получили код, проверьте папку "Спам" или нажмите на кнопку "Отправить код повторно".
            </p>
          </div>
          
          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <div class="flex items-center justify-between">
            <div class="text-sm">
              <button 
                @click.prevent="resendCode" 
                type="button"
                class="font-medium text-primary-600 hover:text-primary-500"
                :disabled="isResending"
              >
                {{ isResending ? 'Отправка...' : 'Отправить код повторно' }}
              </button>
            </div>
          </div>

          <div>
            <BaseButton
              type="submit"
              class="w-full"
              :disabled="isVerifying"
            >
              {{ isVerifying ? 'Проверка...' : 'Подтвердить' }}
            </BaseButton>
          </div>
        </form>

        <div v-else class="text-center">
          <div class="rounded-full bg-green-100 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900">Email подтвержден</h3>
          <p class="mt-2 text-sm text-gray-500">
            Ваш email был успешно подтвержден. Теперь вы можете продолжить работу с системой.
          </p>
          <div class="mt-6">
            <BaseButton tag="router-link" to="/" class="w-full">
              Вернуться на главную
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { BaseButton } from '@/components/ui';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const code = ref('');
const error = ref('');
const isVerifying = ref(false);
const isResending = ref(false);
const verified = ref(false);

// При загрузке компонента проверяем наличие email в store или в query параметрах
onMounted(() => {
  if (authStore.emailToVerify) {
    email.value = authStore.emailToVerify;
  } else if (route.query.email) {
    email.value = route.query.email;
    authStore.emailToVerify = route.query.email;
  } else {
    // Если email нет ни в store, ни в query параметрах, перенаправляем на страницу входа
    router.push('/auth/login');
  }
});

// Отправка кода подтверждения
async function resendCode() {
  if (!email.value) return;
  
  isResending.value = true;
  
  try {
    // Используем новый метод sendOtpCode вместо sendVerificationEmail
    const result = await authStore.sendOtpCode(email.value);
    
    if (!result.success) {
      error.value = result.error || 'Не удалось отправить код подтверждения';
    } else {
      error.value = '';
    }
  } catch (err) {
    console.error('Ошибка при отправке кода:', err);
    error.value = err.message || 'Произошла ошибка при отправке кода';
  } finally {
    isResending.value = false;
  }
}

// Проверка кода подтверждения
async function verifyCode() {
  if (!email.value || !code.value) return;
  
  isVerifying.value = true;
  
  try {
    const result = await authStore.verifyEmail(email.value, code.value);
    
    if (!result.success) {
      error.value = result.error || 'Неверный код подтверждения';
    } else {
      verified.value = true;
      error.value = '';
      // Перенаправляем на главную страницу через 2 секунды
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  } catch (err) {
    console.error('Ошибка при проверке кода:', err);
    error.value = err.message || 'Произошла ошибка при проверке кода';
  } finally {
    isVerifying.value = false;
  }
}
</script> 