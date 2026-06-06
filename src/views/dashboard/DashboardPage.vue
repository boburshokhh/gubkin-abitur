<template>
  <main class="dashboard-page">
    <el-card shadow="never" class="dashboard-page__header-card">
      <div class="dashboard-page__header">
        <div>
          <el-text tag="h1" class="dashboard-page__title">Личный кабинет</el-text>
          <el-text type="info" class="dashboard-page__subtitle">
            Управляйте профилем, безопасностью аккаунта и переходите к заявлениям.
          </el-text>
        </div>
        <el-tag :type="authStore.isEmailConfirmed ? 'success' : 'warning'" effect="light" size="large">
          {{ authStore.isEmailConfirmed ? 'Email подтвержден' : 'Email не подтвержден' }}
        </el-tag>
      </div>
    </el-card>

    <DashboardNavigation />

    <el-card v-if="isLoading" shadow="never" class="dashboard-page__state-card">
      <el-skeleton :rows="8" animated />
    </el-card>

    <el-alert
      v-else-if="error"
      title="Ошибка при загрузке данных"
      :description="error"
      type="error"
      show-icon
      class="dashboard-page__alert"
    />

    <div v-else class="dashboard-page__grid">
      <el-card shadow="never">
        <template #header>
          <div class="dashboard-page__card-header">
            <span>Основная информация</span>
            <el-tag :type="authStore.isEmailConfirmed ? 'success' : 'warning'" effect="light">
              {{ authStore.user?.email || 'Email не указан' }}
            </el-tag>
          </div>
        </template>

        <el-alert
          v-if="!authStore.isEmailConfirmed"
          title="Подтвердите email"
          description="Для полной работы личного кабинета подтвердите адрес электронной почты."
          type="warning"
          show-icon
          :closable="false"
          class="dashboard-page__inner-alert"
        >
          <template #default>
            <el-button
              class="mt-3"
              size="small"
              type="warning"
              :loading="isResendingVerification"
              @click="resendVerification"
            >
              Отправить код подтверждения
            </el-button>
          </template>
        </el-alert>

        <el-form label-position="top" @submit.prevent="saveProfile">
          <div class="dashboard-page__form-grid">
            <el-form-item label="Имя">
              <el-input v-model="form.first_name" placeholder="Введите имя" clearable />
            </el-form-item>
            <el-form-item label="Фамилия">
              <el-input v-model="form.last_name" placeholder="Введите фамилию" clearable />
            </el-form-item>
            <el-form-item label="Отчество">
              <el-input v-model="form.middle_name" placeholder="Введите отчество" clearable />
            </el-form-item>
            <el-form-item label="Телефон">
              <el-input v-model="form.phone" placeholder="+998 90 123 45 67" clearable />
            </el-form-item>
          </div>

          <div class="dashboard-page__actions">
            <el-button type="primary" native-type="submit" :loading="isSaving">
              Сохранить изменения
            </el-button>
          </div>
        </el-form>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <span>Изменение пароля</span>
        </template>

        <el-form label-position="top" @submit.prevent="changePassword">
          <el-form-item label="Текущий пароль" :error="passwordError && !passwordForm.current_password ? passwordError : ''">
            <el-input
              v-model="passwordForm.current_password"
              type="password"
              autocomplete="current-password"
              show-password
              placeholder="Введите текущий пароль"
            />
          </el-form-item>
          <el-form-item label="Новый пароль" :error="passwordError && passwordForm.new_password && passwordForm.new_password.length < 10 ? passwordError : ''">
            <el-input
              v-model="passwordForm.new_password"
              type="password"
              autocomplete="new-password"
              show-password
              placeholder="Минимум 10 символов"
            />
          </el-form-item>
          <el-form-item label="Подтверждение пароля" :error="passwordError && passwordForm.new_password !== passwordForm.confirm_password ? passwordError : ''">
            <el-input
              v-model="passwordForm.confirm_password"
              type="password"
              autocomplete="new-password"
              show-password
              placeholder="Повторите новый пароль"
            />
          </el-form-item>

          <el-alert
            v-if="passwordError"
            :title="passwordError"
            type="error"
            show-icon
            class="dashboard-page__inner-alert"
          />

          <div class="dashboard-page__actions">
            <el-button type="primary" native-type="submit" :loading="isChangingPassword">
              Изменить пароль
            </el-button>
          </div>
        </el-form>
      </el-card>

      <el-card shadow="never" class="dashboard-page__account-card">
        <template #header>
          <span>Управление аккаунтом</span>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Email">{{ authStore.user?.email || 'Не указан' }}</el-descriptions-item>
          <el-descriptions-item label="Статус email">
            <el-tag :type="authStore.isEmailConfirmed ? 'success' : 'warning'" effect="light">
              {{ authStore.isEmailConfirmed ? 'Подтвержден' : 'Не подтвержден' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="dashboard-page__actions dashboard-page__actions--left">
          <el-button @click="logout">Выйти из аккаунта</el-button>
        </div>
      </el-card>
    </div>
  </main>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { appApi } from '@/api/app-api'
import DashboardNavigation from '@/components/dashboard/DashboardNavigation.vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(true)
const isSaving = ref(false)
const isChangingPassword = ref(false)
const isResendingVerification = ref(false)
const error = ref('')
const passwordError = ref('')

const form = reactive({
  first_name: '',
  last_name: '',
  middle_name: '',
  phone: ''
})

const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

onMounted(async () => {
  try {
    if (authStore.profile) {
      initForm(authStore.profile)
      return
    }

    await authStore.initAuth()
    if (authStore.profile) {
      initForm(authStore.profile)
      return
    }

    error.value = 'Не удалось загрузить данные профиля'
  } catch (err) {
    console.error('Ошибка при загрузке профиля:', err)
    error.value = 'Не удалось загрузить данные профиля'
  } finally {
    isLoading.value = false
  }
})

function initForm(profile) {
  form.first_name = profile.first_name || ''
  form.last_name = profile.last_name || ''
  form.middle_name = profile.middle_name || ''
  form.phone = profile.phone || ''
}

async function saveProfile() {
  isSaving.value = true
  error.value = ''

  try {
    const result = await authStore.updateProfile(form)
    if (!result.success) {
      error.value = result.error || 'Не удалось сохранить данные профиля'
      return
    }

    ElMessage.success('Данные профиля успешно сохранены')
  } catch (err) {
    console.error('Ошибка при сохранении профиля:', err)
    error.value = 'Не удалось сохранить данные профиля'
  } finally {
    isSaving.value = false
  }
}

async function changePassword() {
  if (!passwordForm.current_password) {
    passwordError.value = 'Введите текущий пароль'
    return
  }

  if (!passwordForm.new_password) {
    passwordError.value = 'Введите новый пароль'
    return
  }

  if (passwordForm.new_password.length < 10) {
    passwordError.value = 'Пароль должен содержать минимум 10 символов'
    return
  }

  if (passwordForm.new_password !== passwordForm.confirm_password) {
    passwordError.value = 'Пароли не совпадают'
    return
  }

  passwordError.value = ''
  isChangingPassword.value = true

  try {
    const { error: updateError } = await appApi.auth.updateUser({
      password: passwordForm.new_password,
      currentPassword: passwordForm.current_password
    })

    if (updateError) {
      passwordError.value = updateError.message || 'Не удалось изменить пароль'
      return
    }

    passwordForm.current_password = ''
    passwordForm.new_password = ''
    passwordForm.confirm_password = ''
    ElMessage.success('Пароль успешно изменен')
  } catch (err) {
    console.error('Ошибка при изменении пароля:', err)
    passwordError.value = 'Не удалось изменить пароль'
  } finally {
    isChangingPassword.value = false
  }
}

async function resendVerification() {
  if (!authStore.user?.email || isResendingVerification.value) return

  isResendingVerification.value = true

  try {
    const result = await authStore.sendVerificationEmail(authStore.user.email)
    if (!result.success) {
      error.value = result.error || 'Не удалось отправить код подтверждения'
      return
    }

    ElMessage.success('Код подтверждения отправлен на ваш email')
  } catch (err) {
    console.error('Ошибка при отправке кода подтверждения:', err)
    error.value = 'Не удалось отправить код подтверждения'
  } finally {
    isResendingVerification.value = false
  }
}

async function logout() {
  try {
    const result = await authStore.logout()
    if (result.success) {
      router.push('/')
      return
    }

    error.value = result.error || 'Не удалось выйти из системы'
  } catch (err) {
    console.error('Ошибка при выходе из системы:', err)
    error.value = 'Не удалось выйти из системы'
  }
}
</script>

<style scoped>
.dashboard-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px 16px;
}

.dashboard-page__header-card,
.dashboard-page__state-card,
.dashboard-page__alert {
  margin-bottom: 24px;
}

.dashboard-page__header,
.dashboard-page__card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.dashboard-page__title {
  display: block;
  margin: 0 0 8px;
  color: var(--el-text-color-primary);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.dashboard-page__subtitle {
  display: block;
}

.dashboard-page__grid {
  display: grid;
  gap: 20px;
}

.dashboard-page__form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 18px;
}

.dashboard-page__inner-alert {
  margin-bottom: 18px;
}

.dashboard-page__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.dashboard-page__actions--left {
  justify-content: flex-start;
  margin-top: 18px;
}

@media (max-width: 640px) {
  .dashboard-page {
    padding: 16px 12px;
  }

  .dashboard-page__header,
  .dashboard-page__card-header {
    flex-direction: column;
  }

  .dashboard-page__title {
    font-size: 24px;
  }

  .dashboard-page__form-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-page__actions .el-button {
    width: 100%;
  }
}
</style>
