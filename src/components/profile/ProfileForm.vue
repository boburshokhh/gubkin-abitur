<template>
  <el-card shadow="never" class="profile-form">
    <template #header>
      <div class="profile-form__header">
        <div>
          <h2 class="profile-form__title">Профиль</h2>
          <p class="profile-form__subtitle">
            Управляйте контактными данными, которые используются в личном кабинете.
          </p>
        </div>
        <el-tag
          v-if="showEmailInfo"
          :type="emailStatusType"
          effect="light"
          round
        >
          {{ authStore.isEmailConfirmed ? 'Email подтвержден' : 'Email не подтвержден' }}
        </el-tag>
      </div>
    </template>

    <div class="profile-form__layout">
      <aside class="profile-form__account">
        <el-avatar :size="72" class="profile-form__avatar">
          {{ userInitials }}
        </el-avatar>
        <div class="profile-form__account-info">
          <h3>{{ displayName }}</h3>
          <el-text type="info">
            {{ authStore.user?.email || 'Email не указан' }}
          </el-text>
        </div>

        <el-alert
          v-if="showEmailInfo"
          :type="authStore.isEmailConfirmed ? 'success' : 'warning'"
          :closable="false"
          show-icon
          class="profile-form__email"
        >
          <template #title>
            {{ authStore.isEmailConfirmed ? 'Аккаунт подтвержден' : 'Требуется подтверждение email' }}
          </template>
          <template #default>
            <p class="profile-form__email-text">
              {{
                authStore.isEmailConfirmed
                  ? 'Вы можете пользоваться всеми возможностями личного кабинета.'
                  : 'Подтвердите email, чтобы защитить аккаунт и получать важные уведомления.'
              }}
            </p>
            <el-button
              v-if="!authStore.isEmailConfirmed && authStore.user?.email"
              type="warning"
              plain
              size="small"
              :loading="isResendingVerification"
              @click="resendVerification"
            >
              Отправить код
            </el-button>
          </template>
        </el-alert>

        <el-divider />

        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="Статус">
            <el-tag effect="light" type="success">
              Активный профиль
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Телефон">
            {{ localForm.phone || 'Не указан' }}
          </el-descriptions-item>
        </el-descriptions>
      </aside>

      <el-form
        ref="profileFormRef"
        :model="localForm"
        :rules="rules"
        label-position="top"
        status-icon
        class="profile-form__form"
        @submit.prevent="submitForm"
      >
        <div class="profile-form__section">
          <h3 class="profile-form__section-title">Личные данные</h3>
          <p class="profile-form__section-text">
            Укажите данные так, как они должны отображаться в системе.
          </p>
        </div>

        <div class="profile-form__fields">
          <el-form-item label="Имя" prop="first_name">
            <el-input
              v-model.trim="localForm.first_name"
              :disabled="disabled"
              autocomplete="given-name"
              placeholder="Например, Иван"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="Фамилия" prop="last_name">
            <el-input
              v-model.trim="localForm.last_name"
              :disabled="disabled"
              autocomplete="family-name"
              placeholder="Например, Иванов"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="Отчество" prop="middle_name">
            <el-input
              v-model.trim="localForm.middle_name"
              :disabled="disabled"
              placeholder="Если есть"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="Телефон" prop="phone">
            <el-input
              v-model.trim="localForm.phone"
              type="tel"
              :disabled="disabled"
              autocomplete="tel"
              placeholder="+998 90 123 45 67"
            >
              <template #prefix>
                <el-icon><Phone /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </div>

        <el-alert
          v-if="!hasChanges"
          type="info"
          :closable="false"
          class="profile-form__hint"
        >
          Измените данные в форме, чтобы сохранить профиль.
        </el-alert>

        <div class="profile-form__actions">
          <el-button
            :disabled="disabled || isSaving || !hasChanges"
            @click="resetForm"
          >
            Отменить изменения
          </el-button>
          <el-button
            type="primary"
            native-type="submit"
            :loading="isSaving"
            :disabled="disabled || !hasChanges"
          >
            Сохранить профиль
          </el-button>
        </div>
      </el-form>
    </div>
  </el-card>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Phone, User } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

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
})

const emit = defineEmits(['save', 'resend-verification'])

const authStore = useAuthStore()
const profileFormRef = ref(null)
const isResendingVerification = ref(false)

const localForm = reactive({
  first_name: '',
  last_name: '',
  middle_name: '',
  phone: ''
})

const normalizeProfile = (profile) => ({
  first_name: profile?.first_name?.trim() || '',
  last_name: profile?.last_name?.trim() || '',
  middle_name: profile?.middle_name?.trim() || '',
  phone: profile?.phone?.trim() || ''
})

const phoneValidator = (rule, value, callback) => {
  if (!value) {
    callback()
    return
  }

  const isValidPhone = /^[+\d\s()-]{7,24}$/.test(value)
  if (isValidPhone) {
    callback()
    return
  }

  callback(new Error('Введите телефон в корректном формате'))
}

const rules = {
  first_name: [
    { required: true, message: 'Укажите имя', trigger: 'blur' },
    { min: 2, max: 80, message: 'Имя должно быть от 2 до 80 символов', trigger: 'blur' }
  ],
  last_name: [
    { required: true, message: 'Укажите фамилию', trigger: 'blur' },
    { min: 2, max: 80, message: 'Фамилия должна быть от 2 до 80 символов', trigger: 'blur' }
  ],
  middle_name: [
    { max: 80, message: 'Отчество не должно быть длиннее 80 символов', trigger: 'blur' }
  ],
  phone: [
    { validator: phoneValidator, trigger: 'blur' }
  ]
}

const normalizedInitialProfile = computed(() => normalizeProfile(props.profileData))

const hasChanges = computed(() => {
  const currentProfile = normalizeProfile(localForm)
  const initialProfile = normalizedInitialProfile.value

  return Object.keys(currentProfile).some((key) => currentProfile[key] !== initialProfile[key])
})

const displayName = computed(() => {
  const formName = [localForm.first_name, localForm.last_name].filter(Boolean).join(' ')
  if (formName) return formName
  if (authStore.user?.email) return authStore.user.email.split('@')[0]

  return 'Пользователь'
})

const userInitials = computed(() => {
  const parts = displayName.value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)

  if (!parts.length) return 'П'

  return parts.map(part => part[0]).join('').toUpperCase()
})

const emailStatusType = computed(() => (
  authStore.isEmailConfirmed ? 'success' : 'warning'
))

const fillForm = (profileData) => {
  const normalizedProfile = normalizeProfile(profileData)
  localForm.first_name = normalizedProfile.first_name
  localForm.last_name = normalizedProfile.last_name
  localForm.middle_name = normalizedProfile.middle_name
  localForm.phone = normalizedProfile.phone
}

watch(() => props.profileData, (newData) => {
  fillForm(newData)
}, { immediate: true, deep: true })

const resetForm = () => {
  fillForm(props.profileData)
  profileFormRef.value?.clearValidate()
}

const submitForm = async () => {
  if (props.disabled || props.isSaving) return
  if (!hasChanges.value) {
    ElMessage.info('В профиле нет изменений')
    return
  }

  const isValid = await profileFormRef.value?.validate().catch(() => false)
  if (!isValid) return

  emit('save', normalizeProfile(localForm))
}

const resendVerification = async () => {
  if (isResendingVerification.value) return
  isResendingVerification.value = true
  emit('resend-verification')
  await new Promise(resolve => setTimeout(resolve, 1000))
  isResendingVerification.value = false
}
</script> 

<style scoped>
.profile-form {
  border-radius: 18px;
}

.profile-form :deep(.el-card__header) {
  padding: 22px 24px;
}

.profile-form :deep(.el-card__body) {
  padding: 24px;
}

.profile-form__header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
}

.profile-form__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.profile-form__subtitle,
.profile-form__section-text {
  margin: 6px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  line-height: 1.5;
}

.profile-form__layout {
  display: grid;
  grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
  gap: 28px;
}

.profile-form__account {
  align-self: start;
  padding: 20px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  background: linear-gradient(180deg, var(--el-fill-color-lighter), var(--el-bg-color));
}

.profile-form__avatar {
  color: var(--el-color-white);
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--el-color-primary), #0f766e);
}

.profile-form__account-info {
  display: grid;
  gap: 4px;
  margin-top: 14px;
}

.profile-form__account-info h3 {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 700;
}

.profile-form__email {
  margin-top: 18px;
}

.profile-form__email-text {
  margin: 0 0 10px;
  line-height: 1.5;
}

.profile-form__section {
  margin-bottom: 20px;
}

.profile-form__section-title {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 700;
}

.profile-form__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 18px 20px;
}

.profile-form__hint {
  margin-top: 4px;
}

.profile-form__actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 22px;
}

@media (max-width: 900px) {
  .profile-form__layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .profile-form :deep(.el-card__header),
  .profile-form :deep(.el-card__body) {
    padding: 18px;
  }

  .profile-form__header {
    display: grid;
  }

  .profile-form__fields {
    grid-template-columns: 1fr;
  }

  .profile-form__actions {
    display: grid;
  }

  .profile-form__actions .el-button {
    width: 100%;
    margin-left: 0;
  }
}
</style>