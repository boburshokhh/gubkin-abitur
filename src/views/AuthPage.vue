<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {{ isLogin ? 'Вход в систему' : 'Регистрация' }}
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div v-if="!isLogin">
            <label for="firstName" class="block text-sm font-medium text-gray-700">
              Имя
            </label>
            <div class="mt-1">
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <div v-if="!isLogin">
            <label for="lastName" class="block text-sm font-medium text-gray-700">
              Фамилия
            </label>
            <div class="mt-1">
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Пароль
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <div>
            <BaseButton
              type="submit"
              class="w-full"
              :disabled="loading"
            >
              {{ isLogin ? 'Войти' : 'Зарегистрироваться' }}
            </BaseButton>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">
                {{ isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?' }}
              </span>
            </div>
          </div>

          <div class="mt-6">
            <BaseButton
              variant="outline"
              class="w-full"
              @click="toggleMode"
            >
              {{ isLogin ? 'Зарегистрироваться' : 'Войти' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import BaseButton from '@/components/ui/BaseButton.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isLogin = ref(true);
const loading = ref(false);
const error = ref('');

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: ''
});

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  error.value = '';
  // Очищаем форму при переключении
  Object.keys(form).forEach(key => form[key] = '');
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';

  try {
    let result;

    if (isLogin.value) {
      // Авторизация
      result = await authStore.login({
        email: form.email,
        password: form.password
      });
    } else {
      // Регистрация
      result = await authStore.register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName
      });

      // Если регистрация успешна и требуется подтверждение email
      if (result.success && result.needsEmailVerification) {
        router.push({
          path: '/verify-email',
          query: { email: form.email }
        });
        return;
      }
    }

    if (result.success) {
      // После успешной авторизации/регистрации перенаправляем пользователя
      const redirectPath = route.query.redirect || '/';
      router.push(redirectPath);
    } else {
      error.value = result.error || 'Произошла ошибка. Пожалуйста, попробуйте снова.';
    }
  } catch (err) {
    console.error('Error:', err);
    error.value = 'Что-то пошло не так. Пожалуйста, попробуйте снова.';
  } finally {
    loading.value = false;
  }
};
</script> 