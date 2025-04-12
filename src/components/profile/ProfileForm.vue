<template>
  <div class="bg-white shadow rounded-lg overflow-hidden">
    <div class="bg-primary-600 px-4 py-3 md:px-6 md:py-4">
      <h2 class="text-lg md:text-xl font-medium text-white">Основная информация</h2>
    </div>
    <div class="p-4 md:p-6">
      <div v-if="showEmailInfo" class="mb-6 grid grid-cols-1 gap-4 md:gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div class="flex flex-col sm:flex-row sm:items-center">
            <span class="text-gray-900">{{ authStore.user?.email }}</span>
            <span 
              v-if="authStore.user?.email" 
              :class="[
                'mt-1 sm:mt-0 sm:ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', 
                authStore.isEmailConfirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              ]"
            >
              {{ authStore.isEmailConfirmed ? 'Подтвержден' : 'Не подтвержден' }}
            </span>
            <button 
              v-if="!authStore.isEmailConfirmed && authStore.user?.email"
              @click="resendVerification"
              class="mt-2 sm:mt-0 sm:ml-2 text-xs text-primary-600 hover:text-primary-800"
              :disabled="isResendingVerification"
            >
              {{ isResendingVerification ? 'Отправка...' : 'Отправить код подтверждения' }}
            </button>
          </div>
        </div>
      </div>

      <form @submit.prevent="submitForm">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label for="first_name" class="block text-sm font-medium text-gray-700">Имя</label>
            <input 
              id="first_name" 
              v-model="localForm.first_name" 
              type="text" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              :disabled="disabled"
            />
          </div>
          
          <div>
            <label for="last_name" class="block text-sm font-medium text-gray-700">Фамилия</label>
            <input 
              id="last_name" 
              v-model="localForm.last_name" 
              type="text" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              :disabled="disabled"
            />
          </div>
          
          <div>
            <label for="middle_name" class="block text-sm font-medium text-gray-700">Отчество</label>
            <input 
              id="middle_name" 
              v-model="localForm.middle_name" 
              type="text" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              :disabled="disabled"
            />
          </div>
          
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">Телефон</label>
            <input 
              id="phone" 
              v-model="localForm.phone" 
              type="tel" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              :disabled="disabled"
            />
          </div>
        </div>

        <div class="mt-6 flex justify-center sm:justify-end">
          <button 
            type="submit" 
            class="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            :disabled="isSaving || disabled"
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
</template>

<script setup>
import { ref, reactive, watch, defineProps, defineEmits } from 'vue';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
  profileData: {
    type: Object,
    default: () => ({ first_name: '', last_name: '', middle_name: '', phone: '' })
  },
  isSaving: {
    type: Boolean,
    default: false
  },
  showEmailInfo: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['save', 'resend-verification']);

const authStore = useAuthStore();
const isResendingVerification = ref(false);

// Локальная форма для избежания прямой мутации props
const localForm = reactive({
  first_name: '',
  last_name: '',
  middle_name: '',
  phone: ''
});

// Синхронизация локальной формы с props при их изменении
watch(() => props.profileData, (newData) => {
  if (newData) {
    localForm.first_name = newData.first_name || '';
    localForm.last_name = newData.last_name || '';
    localForm.middle_name = newData.middle_name || '';
    localForm.phone = newData.phone || '';
  }
}, { immediate: true, deep: true });

const submitForm = () => {
  emit('save', { ...localForm });
};

const resendVerification = async () => {
  if (isResendingVerification.value) return;
  isResendingVerification.value = true;
  emit('resend-verification');
  // Добавим небольшую задержку для визуальной обратной связи
  await new Promise(resolve => setTimeout(resolve, 1000)); 
  isResendingVerification.value = false;
};

</script> 