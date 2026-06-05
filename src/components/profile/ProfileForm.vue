<template>
  <el-card shadow="never" class="profile-form">
    <template #header>
      <h2 class="profile-form__title">Основная информация</h2>
    </template>

    <el-alert
      v-if="showEmailInfo"
      type="info"
      :closable="false"
      class="profile-form__email"
    >
      <template #title>
        <el-space wrap>
          <span>Email: {{ authStore.user?.email || 'Не указан' }}</span>
          <el-tag
            v-if="authStore.user?.email"
            :type="authStore.isEmailConfirmed ? 'success' : 'warning'"
            effect="light"
          >
            {{ authStore.isEmailConfirmed ? 'Подтвержден' : 'Не подтвержден' }}
          </el-tag>
          <el-button
            v-if="!authStore.isEmailConfirmed && authStore.user?.email"
            type="primary"
            link
            :loading="isResendingVerification"
            @click="resendVerification"
          >
            Отправить код подтверждения
          </el-button>
        </el-space>
      </template>
    </el-alert>

    <el-form :model="localForm" label-position="top" @submit.prevent="submitForm">
      <div class="profile-form__fields">
        <el-form-item label="Имя">
          <el-input v-model="localForm.first_name" :disabled="disabled" />
        </el-form-item>

        <el-form-item label="Фамилия">
          <el-input v-model="localForm.last_name" :disabled="disabled" />
        </el-form-item>

        <el-form-item label="Отчество">
          <el-input v-model="localForm.middle_name" :disabled="disabled" />
        </el-form-item>

        <el-form-item label="Телефон">
          <el-input v-model="localForm.phone" type="tel" :disabled="disabled" />
        </el-form-item>
      </div>

      <div class="profile-form__actions">
        <el-button
          type="primary"
          native-type="submit"
          :loading="isSaving"
          :disabled="disabled"
        >
          Сохранить изменения
        </el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
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

<style scoped>
.profile-form__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.profile-form__email {
  margin-bottom: 24px;
}

.profile-form__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 16px;
}

.profile-form__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

@media (max-width: 640px) {
  .profile-form__fields {
    grid-template-columns: 1fr;
  }

  .profile-form__actions .el-button {
    width: 100%;
  }
}
</style>