<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Новый пароль
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Задайте новый пароль для вашего аккаунта
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form v-if="token && !isSuccess" class="space-y-6" @submit.prevent="handleSubmit">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Новый пароль</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              minlength="10"
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              :disabled="isLoading"
            />
            <p class="mt-1 text-xs text-gray-500">Минимум 10 символов, буквы и цифры.</p>
          </div>

          <div>
            <label for="passwordConfirm" class="block text-sm font-medium text-gray-700">Повторите пароль</label>
            <input
              id="passwordConfirm"
              v-model="passwordConfirm"
              type="password"
              required
              minlength="10"
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              :disabled="isLoading"
            />
          </div>

          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

          <BaseButton type="submit" class="w-full" :disabled="isLoading">
            {{ isLoading ? 'Сохранение...' : 'Сохранить пароль' }}
          </BaseButton>
        </form>

        <div v-else class="space-y-4 text-center">
          <p :class="isSuccess ? 'text-green-700' : 'text-red-600'">
            {{ isSuccess ? 'Пароль успешно обновлен.' : 'Ссылка сброса пароля некорректна.' }}
          </p>
          <BaseButton tag="router-link" to="/auth" class="w-full">
            Перейти к авторизации
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { BaseButton } from '@/components/ui';

const route = useRoute();
const authStore = useAuthStore();

const token = ref(route.query.token || '');
const password = ref('');
const passwordConfirm = ref('');
const error = ref('');
const isLoading = ref(false);
const isSuccess = ref(false);

async function handleSubmit() {
  error.value = '';

  if (password.value !== passwordConfirm.value) {
    error.value = 'Пароли не совпадают';
    return;
  }

  isLoading.value = true;
  try {
    const result = await authStore.resetPasswordWithToken({
      token: token.value,
      password: password.value
    });

    if (!result.success) {
      error.value = result.error || 'Не удалось обновить пароль';
      return;
    }

    isSuccess.value = true;
  } finally {
    isLoading.value = false;
  }
}
</script>
