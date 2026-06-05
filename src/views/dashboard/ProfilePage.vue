<template>
  <main class="profile-page">
    <section class="profile-page__header">
      <div>
        <h1 class="profile-page__title">Личный кабинет</h1>
        <el-text type="info">
          Управляйте профилем, безопасностью аккаунта и сессией.
        </el-text>
      </div>

      <el-tag :type="authStore.isEmailConfirmed ? 'success' : 'warning'" effect="light">
        {{ authStore.isEmailConfirmed ? 'Email подтвержден' : 'Email не подтвержден' }}
      </el-tag>
    </section>

    <DashboardNavigation v-if="!authStore.isAdmin && !authStore.isReviewer" />

    <el-skeleton v-if="isLoading" :rows="8" animated />

    <el-alert
      v-else-if="error"
      type="error"
      title="Ошибка при загрузке данных"
      :description="error"
      show-icon
      :closable="false"
    />

    <div v-else class="profile-page__content">
      <ProfileForm
        :profile-data="profileData"
        :is-saving="isSavingProfile"
        @save="saveProfile"
        @resend-verification="handleResendVerification"
      />

      <el-card shadow="never" class="profile-page__card">
        <template #header>
          <div class="profile-page__card-header">
            <div>
              <h2 class="profile-page__card-title">Пароль и безопасность</h2>
              <el-text type="info">
                Измените пароль или отправьте письмо для сброса на ваш email.
              </el-text>
            </div>
          </div>
        </template>

        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-position="top"
          status-icon
          @submit.prevent="changePassword"
        >
          <div class="profile-page__password-grid">
            <el-form-item label="Текущий пароль" prop="currentPassword">
              <el-input
                v-model="passwordForm.currentPassword"
                type="password"
                autocomplete="current-password"
                placeholder="Введите текущий пароль"
                show-password
              />
            </el-form-item>

            <el-form-item label="Новый пароль" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                autocomplete="new-password"
                placeholder="Минимум 10 символов"
                show-password
              />
            </el-form-item>

            <el-form-item label="Повторите новый пароль" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                autocomplete="new-password"
                placeholder="Повторите новый пароль"
                show-password
              />
            </el-form-item>
          </div>

          <el-alert
            type="info"
            :closable="false"
            show-icon
            class="profile-page__password-hint"
          >
            Используйте надежный пароль: минимум 10 символов, без совпадения с текущим паролем.
          </el-alert>

          <div class="profile-page__actions">
            <el-button
              :loading="isSendingReset"
              @click="sendPasswordReset"
            >
              Сбросить пароль по email
            </el-button>
            <el-button
              type="primary"
              native-type="submit"
              :loading="isChangingPassword"
            >
              Изменить пароль
            </el-button>
          </div>
        </el-form>
      </el-card>

      <el-card shadow="never" class="profile-page__card">
        <template #header>
          <div class="profile-page__card-header">
            <div>
              <h2 class="profile-page__card-title">Управление аккаунтом</h2>
              <el-text type="info">
                Завершите текущую сессию, если работаете не со своего устройства.
              </el-text>
            </div>
          </div>
        </template>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="Email">
            {{ authStore.user?.email || 'Не указан' }}
          </el-descriptions-item>
          <el-descriptions-item label="Статус">
            <el-tag :type="authStore.isEmailConfirmed ? 'success' : 'warning'" effect="light">
              {{ authStore.isEmailConfirmed ? 'Подтвержден' : 'Ожидает подтверждения' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="profile-page__actions">
          <el-button type="danger" plain @click="confirmLogout">
            Выйти из аккаунта
          </el-button>
        </div>
      </el-card>
    </div>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { appApi } from '@/api/app-api'
import DashboardNavigation from '@/components/dashboard/DashboardNavigation.vue'
import ProfileForm from '@/components/profile/ProfileForm.vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(true)
const isSavingProfile = ref(false)
const isChangingPassword = ref(false)
const isSendingReset = ref(false)
const error = ref('')
const profileData = ref({})
const passwordFormRef = ref(null)

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('Повторите новый пароль'))
    return
  }

  if (value !== passwordForm.newPassword) {
    callback(new Error('Пароли не совпадают'))
    return
  }

  callback()
}

const passwordRules = {
  currentPassword: [
    { required: true, message: 'Введите текущий пароль', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: 'Введите новый пароль', trigger: 'blur' },
    { min: 10, message: 'Пароль должен содержать минимум 10 символов', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const loadProfile = async () => {
  try {
    if (!authStore.profile) await authStore.initAuth()

    if (!authStore.profile) {
      error.value = 'Не удалось загрузить данные профиля'
      return
    }

    profileData.value = { ...authStore.profile }
  } catch (err) {
    console.error('Ошибка при загрузке профиля:', err)
    error.value = 'Не удалось загрузить данные профиля'
  } finally {
    isLoading.value = false
  }
}

const saveProfile = async (formData) => {
  isSavingProfile.value = true
  error.value = ''

  try {
    const result = await authStore.updateProfile(formData)

    if (!result.success) {
      error.value = result.error || 'Не удалось сохранить данные профиля'
      ElMessage.error(error.value)
      return
    }

    profileData.value = { ...formData }
    ElMessage.success('Данные профиля успешно сохранены')
  } catch (err) {
    console.error('Ошибка при сохранении профиля:', err)
    error.value = 'Не удалось сохранить данные профиля'
    ElMessage.error(error.value)
  } finally {
    isSavingProfile.value = false
  }
}

const resetPasswordForm = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.clearValidate()
}

const changePassword = async () => {
  const isValid = await passwordFormRef.value?.validate().catch(() => false)
  if (!isValid) return

  isChangingPassword.value = true
  error.value = ''

  try {
    const { error: updateError } = await appApi.auth.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })

    if (updateError) {
      ElMessage.error(updateError.message || 'Не удалось изменить пароль')
      return
    }

    resetPasswordForm()
    ElMessage.success('Пароль успешно изменен')
  } catch (err) {
    console.error('Ошибка при изменении пароля:', err)
    ElMessage.error('Не удалось изменить пароль')
  } finally {
    isChangingPassword.value = false
  }
}

const sendPasswordReset = async () => {
  if (!authStore.user?.email) {
    ElMessage.warning('Email пользователя не найден')
    return
  }

  isSendingReset.value = true

  try {
    const { error: resetError } = await appApi.auth.resetPasswordForEmail(authStore.user.email)

    if (resetError) {
      ElMessage.error(resetError.message || 'Не удалось отправить письмо для сброса пароля')
      return
    }

    ElMessage.success('Письмо для сброса пароля отправлено на email')
  } catch (err) {
    console.error('Ошибка при отправке сброса пароля:', err)
    ElMessage.error('Не удалось отправить письмо для сброса пароля')
  } finally {
    isSendingReset.value = false
  }
}

const handleResendVerification = async () => {
  if (!authStore.user?.email) return

  try {
    const result = await authStore.sendVerificationEmail(authStore.user.email)

    if (!result.success) {
      error.value = result.error || 'Не удалось отправить код подтверждения'
      ElMessage.error(error.value)
      return
    }

    ElMessage.success('Код подтверждения отправлен на ваш email')
  } catch (err) {
    console.error('Ошибка при отправке кода подтверждения:', err)
    error.value = 'Не удалось отправить код подтверждения'
    ElMessage.error(error.value)
  }
}

const logout = async () => {
  try {
    const result = await authStore.logout()

    if (!result.success) {
      error.value = result.error || 'Не удалось выйти из системы'
      ElMessage.error(error.value)
      return
    }

    router.push('/')
  } catch (err) {
    console.error('Ошибка при выходе из системы:', err)
    error.value = 'Не удалось выйти из системы'
    ElMessage.error(error.value)
  }
}

const confirmLogout = async () => {
  try {
    await ElMessageBox.confirm(
      'Вы действительно хотите выйти из аккаунта?',
      'Выход из системы',
      {
        confirmButtonText: 'Выйти',
        cancelButtonText: 'Отмена',
        type: 'warning'
      }
    )
    await logout()
  } catch (err) {
    if (err !== 'cancel' && err !== 'close') console.error('Ошибка подтверждения выхода:', err)
  }
}

loadProfile()
</script>

<style scoped>
.profile-page {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 32px 0;
}

.profile-page__header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.profile-page__title {
  margin: 0 0 6px;
  color: var(--el-text-color-primary);
  font-size: 28px;
  font-weight: 700;
}

.profile-page__content {
  display: grid;
  gap: 24px;
}

.profile-page__card {
  border-radius: 18px;
}

.profile-page__card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.profile-page__card-title {
  margin: 0 0 6px;
  color: var(--el-text-color-primary);
  font-size: 20px;
  font-weight: 700;
}

.profile-page__password-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 18px;
}

.profile-page__password-hint {
  margin-top: 4px;
}

.profile-page__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 22px;
}

@media (max-width: 900px) {
  .profile-page__password-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .profile-page {
    width: min(100% - 24px, 1180px);
    padding: 24px 0;
  }

  .profile-page__header,
  .profile-page__card-header,
  .profile-page__actions {
    display: grid;
  }

  .profile-page__actions .el-button {
    width: 100%;
    margin-left: 0;
  }
}
</style>