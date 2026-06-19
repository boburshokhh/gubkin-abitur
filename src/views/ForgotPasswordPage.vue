<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Восстановление пароля
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Введите email, и мы отправим код для сброса пароля
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              :disabled="isLoading || isSent"
            />
          </div>

          <p v-if="message" class="text-sm text-green-700">{{ message }}</p>
          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

          <BaseButton type="submit" class="w-full" :disabled="isLoading || isSent">
            {{ isLoading ? 'Отправка...' : 'Отправить ссылку' }}
          </BaseButton>

          <BaseButton tag="router-link" to="/auth" variant="link" class="w-full">
            Вернуться к авторизации
          </BaseButton>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { BaseButton } from '@/components/ui';

const authStore = useAuthStore();
const email = ref('');
const error = ref('');
const message = ref('');
const isLoading = ref(false);
const isSent = ref(false);

async function handleSubmit() {
  error.value = '';
  message.value = '';
  isLoading.value = true;

  try {
    const result = await authStore.resetPassword(email.value);
    if (!result.success) {
      error.value = result.error || 'Не удалось отправить ссылку';
      return;
    }

    isSent.value = true;
    message.value = 'Если email существует, на него отправлен 6-значный код для сброса пароля. Перейдите на страницу смены пароля и введите полученный код.';
  } finally {
    isLoading.value = false;
  }
}
</script>
