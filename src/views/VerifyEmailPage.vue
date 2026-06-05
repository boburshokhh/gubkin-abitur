<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Подтверждение Email
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        {{ pageDescription }}
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="text-center">
          <div class="rounded-full bg-blue-100 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div class="space-y-4">
            <div>
              <p class="text-lg font-medium text-gray-900">
                Проверьте вашу почту
              </p>
              <p class="mt-1 text-sm text-gray-500">
                Мы отправили ссылку для подтверждения на адрес:
              </p>
              <p class="mt-2 font-medium text-gray-900">{{ email }}</p>
            </div>

            <div class="bg-gray-50 p-4 rounded-md">
              <h4 class="text-sm font-medium text-gray-900">Не получили письмо?</h4>
              <ul class="mt-2 text-sm text-gray-500 list-disc list-inside space-y-1">
                <li>Проверьте папку "Спам" или "Нежелательная почта"</li>
                <li>Убедитесь, что указан правильный email</li>
                <li>Подождите несколько минут и проверьте почту снова</li>
              </ul>
            </div>

            <div v-if="error" class="text-red-600 text-sm">
              {{ error }}
            </div>

            <div class="flex flex-col space-y-4">
              <BaseButton
                @click="resendVerificationEmail"
                :disabled="isResending"
                variant="outline"
                class="w-full"
              >
                {{ isResending ? 'Отправка...' : 'Отправить ссылку повторно' }}
              </BaseButton>

              <BaseButton
                tag="router-link"
                to="/auth"
                variant="link"
                class="w-full"
              >
                Вернуться к авторизации
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { BaseButton } from '@/components/ui';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const email = ref('');
const error = ref('');
const isResending = ref(false);

const pageDescription = computed(() => {
  if (route.query.reason === 'email_not_verified') {
    return 'Ваш аккаунт найден, но email ещё не подтверждён. Мы отправили новую ссылку для подтверждения.';
  }

  if (route.query.reason === 'resend_requested') {
    return 'Мы отправили ссылку для подтверждения на указанный email.';
  }

  return 'На ваш email была отправлена ссылка для подтверждения';
});

// При загрузке компонента проверяем наличие email в store или в query параметрах
onMounted(() => {
  if (authStore.emailToVerify) {
    email.value = authStore.emailToVerify;
  } else if (route.query.email) {
    email.value = route.query.email;
    authStore.emailToVerify = route.query.email;
  } else {
    // Если email нет ни в store, ни в query параметрах, перенаправляем на страницу входа
    router.push('/auth');
  }
});

// Повторная отправка письма с подтверждением
async function resendVerificationEmail() {
  if (!email.value) return;
  
  isResending.value = true;
  error.value = '';
  
  try {
    const result = await authStore.sendVerificationEmail(email.value);
    
    if (result.success) {
      toast.success('Новое письмо с подтверждением отправлено');
    } else {
      error.value = result.error || 'Не удалось отправить письмо';
      toast.error(error.value);
    }
  } catch (err) {
    console.error('Ошибка при отправке письма:', err);
    error.value = err.message || 'Произошла ошибка при отправке письма';
    toast.error(error.value);
  } finally {
    isResending.value = false;
  }
}
</script> 