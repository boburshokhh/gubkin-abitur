<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Принять приглашение
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Завершите регистрацию для доступа к системе
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div v-if="isLoadingInvitation" class="text-center text-sm text-gray-600">
          Проверяем приглашение...
        </div>

        <div v-else-if="invitationError" class="space-y-4 text-center">
          <p class="text-sm text-red-600">{{ invitationError }}</p>
          <BaseButton tag="router-link" to="/auth" class="w-full">Перейти к авторизации</BaseButton>
        </div>

        <form v-else class="space-y-6" @submit.prevent="handleSubmit">
          <div class="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
            Приглашение для <strong>{{ invitation.email }}</strong>, роль: <strong>{{ invitation.role_name }}</strong>
          </div>

          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700">Имя</label>
            <input id="firstName" v-model="form.firstName" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
          </div>

          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700">Фамилия</label>
            <input id="lastName" v-model="form.lastName" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">Телефон</label>
            <input id="phone" v-model="form.phone" type="tel" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Пароль</label>
            <input id="password" v-model="form.password" type="password" required minlength="10" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
            <p class="mt-1 text-xs text-gray-500">Минимум 10 символов, буквы и цифры.</p>
          </div>

          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

          <BaseButton type="submit" class="w-full" :disabled="isSubmitting">
            {{ isSubmitting ? 'Создание аккаунта...' : 'Принять приглашение' }}
          </BaseButton>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { BaseButton } from '@/components/ui';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const token = ref(route.query.token || '');
const invitation = ref(null);
const invitationError = ref('');
const error = ref('');
const isLoadingInvitation = ref(true);
const isSubmitting = ref(false);

const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  password: ''
});

onMounted(async () => {
  if (!token.value) {
    invitationError.value = 'Ссылка приглашения некорректна';
    isLoadingInvitation.value = false;
    return;
  }

  const result = await authStore.validateInvitation(token.value);
  if (!result.success) {
    invitationError.value = result.error;
  } else {
    invitation.value = result.data;
  }

  isLoadingInvitation.value = false;
});

async function handleSubmit() {
  error.value = '';
  isSubmitting.value = true;

  try {
    const result = await authStore.acceptInvitation({
      token: token.value,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      password: form.password
    });

    if (!result.success) {
      error.value = result.error || 'Не удалось принять приглашение';
      return;
    }

    const roleId = result.data?.user?.role_id;
    if (roleId === 2) router.push('/admin');
    else if (roleId === 3) router.push('/reviewer');
    else router.push('/dashboard');
  } finally {
    isSubmitting.value = false;
  }
}
</script>
