<template>
  <header class="the-header">
    <div class="the-header__inner">
      <router-link to="/" class="the-header__brand" aria-label="На главную">
        <img
          class="the-header__logo"
          src="@/assets/photos/gubkin_logo.png"
          alt="Логотип Филиала РГУ нефти и газа (НИУ) имени И.М. Губкина в городе Ташкенте"
        >
      </router-link>

      <el-menu
        class="the-header__nav"
        mode="horizontal"
        :ellipsis="false"
        :default-active="activeNavigationPath"
        @select="handleNavigationSelect"
      >
        <el-menu-item
          v-for="link in navigationLinks"
          :key="link.to"
          :index="link.to"
        >
          {{ link.text }}
        </el-menu-item>
      </el-menu>

      <div class="the-header__actions">
        <template v-if="isAuthenticated">
          <el-dropdown trigger="click" @command="handleUserCommand">
            <button class="the-header__profile-trigger" type="button">
              <el-avatar :size="34" class="the-header__avatar">
                {{ userInitials }}
              </el-avatar>
              <span class="the-header__profile-text">
                <span class="the-header__profile-name">{{ userName }}</span>
                <el-tag size="small" effect="light" :type="roleTagType">
                  {{ roleLabel }}
                </el-tag>
              </span>
              <el-icon class="the-header__profile-arrow">
                <ArrowDown />
              </el-icon>
            </button>

            <template #dropdown>
              <el-dropdown-menu class="the-header__dropdown">
                <div class="the-header__dropdown-user">
                  <el-avatar :size="42" class="the-header__avatar">
                    {{ userInitials }}
                  </el-avatar>
                  <div class="the-header__dropdown-user-info">
                    <strong>{{ userName }}</strong>
                    <span>{{ userEmail }}</span>
                  </div>
                </div>

                <el-dropdown-item
                  v-if="hasStaffWorkspace"
                  command="workspace"
                >
                  <el-icon><Suitcase /></el-icon>
                  {{ workspaceLabel }}
                </el-dropdown-item>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  Личный кабинет
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  Выйти
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>

        <template v-else>
          <el-button @click="goTo('/auth')">
            Войти
          </el-button>
          <el-button
            v-if="isAdmissionOpen"
            type="primary"
            @click="goTo('/register')"
          >
            Подать документы
          </el-button>
          <el-button v-else disabled>
            Прием закрыт
          </el-button>
        </template>
      </div>

      <el-button
        class="the-header__mobile-button"
        :icon="Menu"
        circle
        aria-label="Открыть меню"
        @click="showMobileMenu = true"
      />
    </div>

    <el-drawer
      v-model="showMobileMenu"
      direction="rtl"
      size="320px"
      :with-header="false"
      class="the-header__drawer"
    >
      <div class="the-header__drawer-content">
        <div class="the-header__drawer-top">
          <router-link
            to="/"
            class="the-header__drawer-brand"
            @click="showMobileMenu = false"
          >
            <img
              class="the-header__drawer-logo"
              src="@/assets/photos/gubkin_logo.png"
              alt="Логотип Филиала РГУ нефти и газа (НИУ) имени И.М. Губкина в городе Ташкенте"
            >
          </router-link>
          <el-button
            :icon="Close"
            circle
            aria-label="Закрыть меню"
            @click="showMobileMenu = false"
          />
        </div>

        <el-menu
          class="the-header__drawer-menu"
          :default-active="activeNavigationPath"
          @select="handleNavigationSelect"
        >
          <el-menu-item
            v-for="link in navigationLinks"
            :key="link.to"
            :index="link.to"
          >
            {{ link.text }}
          </el-menu-item>
        </el-menu>

        <div v-if="isAuthenticated" class="the-header__mobile-account">
          <div class="the-header__mobile-user">
            <el-avatar :size="48" class="the-header__avatar">
              {{ userInitials }}
            </el-avatar>
            <div>
              <strong>{{ userName }}</strong>
              <span>{{ userEmail }}</span>
              <el-tag size="small" effect="light" :type="roleTagType">
                {{ roleLabel }}
              </el-tag>
            </div>
          </div>

          <el-button
            v-if="hasStaffWorkspace"
            class="the-header__mobile-action"
            @click="goToWorkspace"
          >
            <el-icon><Suitcase /></el-icon>
            {{ workspaceLabel }}
          </el-button>
          <el-button class="the-header__mobile-action" @click="goToProfile">
            <el-icon><User /></el-icon>
            Личный кабинет
          </el-button>
          <el-button
            class="the-header__mobile-action"
            type="danger"
            plain
            @click="confirmLogout"
          >
            <el-icon><SwitchButton /></el-icon>
            Выйти
          </el-button>
        </div>

        <div v-else class="the-header__mobile-account">
          <el-button class="the-header__mobile-action" @click="goTo('/auth')">
            Войти
          </el-button>
          <el-button
            v-if="isAdmissionOpen"
            class="the-header__mobile-action"
            type="primary"
            @click="goTo('/register')"
          >
            Подать документы
          </el-button>
          <el-button v-else class="the-header__mobile-action" disabled>
            Прием закрыт
          </el-button>
        </div>
      </div>
    </el-drawer>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import {
  ArrowDown,
  Close,
  Menu,
  Suitcase,
  SwitchButton,
  User
} from '@element-plus/icons-vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const showMobileMenu = ref(false)
const isAdmissionOpen = import.meta.env.VITE_ADMISSION_OPEN === 'true'

const navigationLinks = [
  { to: '/', text: 'Главная' },
  { to: '/admission2025', text: 'Прием 2025' },
  { to: '/faq', text: 'Вопросы и ответы' },
  { to: '/statistics', text: 'Статистика' }
]

const isAuthenticated = computed(() => authStore.isAuthenticated)
const hasStaffWorkspace = computed(() => authStore.isAdmin || authStore.isReviewer)

const userEmail = computed(() => authStore.user?.email || 'Email не указан')

const userName = computed(() => {
  const profileName = [
    authStore.profile?.first_name,
    authStore.profile?.last_name
  ].filter(Boolean).join(' ')

  if (profileName) return profileName
  if (authStore.user?.user_metadata?.first_name) return authStore.user.user_metadata.first_name
  if (authStore.user?.name) return authStore.user.name
  if (authStore.user?.email) return authStore.user.email.split('@')[0]

  return 'Пользователь'
})

const userInitials = computed(() => {
  const parts = userName.value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)

  if (!parts.length) return 'П'

  return parts.map(part => part[0]).join('').toUpperCase()
})

const roleLabel = computed(() => {
  if (authStore.isAdmin) return 'Администратор'
  if (authStore.isReviewer) return 'Сотрудник'
  return 'Абитуриент'
})

const roleTagType = computed(() => {
  if (authStore.isAdmin) return 'danger'
  if (authStore.isReviewer) return 'warning'
  return 'success'
})

const workspaceLabel = computed(() => (
  authStore.isAdmin ? 'Панель администратора' : 'Панель сотрудника'
))

const workspacePath = computed(() => (authStore.isAdmin ? '/admin' : '/reviewer'))

const activeNavigationPath = computed(() => {
  const activeLink = navigationLinks
    .filter(link => link.to !== '/')
    .find(link => route.path.startsWith(link.to))

  return activeLink?.to || (route.path === '/' ? '/' : '')
})

const goTo = (path) => {
  showMobileMenu.value = false
  if (route.path !== path) router.push(path)
}

const goToProfile = () => {
  goTo('/dashboard/profile')
}

const goToWorkspace = () => {
  goTo(workspacePath.value)
}

const handleNavigationSelect = (path) => {
  goTo(path)
}

const handleUserCommand = (command) => {
  if (command === 'workspace') {
    goToWorkspace()
    return
  }

  if (command === 'profile') {
    goToProfile()
    return
  }

  if (command === 'logout') confirmLogout()
}

const logout = async () => {
  try {
    await authStore.logout()
    showMobileMenu.value = false
    router.push('/')
    toast.success('Вы успешно вышли из системы')
  } catch (error) {
    console.error('Ошибка при выходе:', error)
    toast.error('Не удалось выйти из системы')
  }
}

const confirmLogout = async () => {
  showMobileMenu.value = false

  try {
    await ElMessageBox.confirm(
      'Вы действительно хотите выйти из системы?',
      'Выход из системы',
      {
        confirmButtonText: 'Выйти',
        cancelButtonText: 'Отмена',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    await logout()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('Ошибка подтверждения выхода:', error)
    }
  }
}
</script>

<style scoped>
.the-header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 50;
  border-bottom: 1px solid var(--el-border-color-light);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(12px);
}

.the-header__inner {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 24px;
  align-items: center;
  width: min(1180px, calc(100% - 32px));
  height: 72px;
  margin: 0 auto;
}

.the-header__brand,
.the-header__drawer-brand {
  display: inline-flex;
  align-items: center;
}

.the-header__logo {
  width: auto;
  height: 48px;
  transition: transform 0.2s ease;
}

.the-header__logo:hover {
  transform: scale(1.03);
}

.the-header__nav {
  min-width: 0;
  border-bottom: 0;
  background: transparent;
}

.the-header__nav :deep(.el-menu-item) {
  height: 72px;
  color: var(--el-text-color-regular);
  font-weight: 600;
}

.the-header__nav :deep(.el-menu-item.is-active) {
  color: var(--el-color-primary);
}

.the-header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.the-header__profile-trigger {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  max-width: 280px;
  padding: 6px 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 999px;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.the-header__profile-trigger:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 6px 18px rgba(64, 158, 255, 0.14);
}

.the-header__avatar {
  flex: 0 0 auto;
  color: var(--el-color-white);
  font-weight: 700;
  background: linear-gradient(135deg, var(--el-color-primary), #0f766e);
}

.the-header__profile-text {
  display: grid;
  gap: 2px;
  min-width: 0;
  text-align: left;
}

.the-header__profile-name {
  overflow: hidden;
  max-width: 150px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.the-header__profile-arrow {
  color: var(--el-text-color-secondary);
}

.the-header__dropdown {
  width: 280px;
}

.the-header__dropdown-user {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
}

.the-header__dropdown-user-info {
  display: grid;
  min-width: 0;
}

.the-header__dropdown-user-info strong,
.the-header__dropdown-user-info span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.the-header__dropdown-user-info span {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.the-header__mobile-button {
  display: none;
}

.the-header__drawer-content {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.the-header__drawer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.the-header__drawer-logo {
  width: auto;
  height: 42px;
}

.the-header__drawer-menu {
  border-right: 0;
}

.the-header__mobile-account {
  display: grid;
  gap: 12px;
  margin-top: auto;
  padding-top: 24px;
}

.the-header__mobile-user {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  background: var(--el-fill-color-lighter);
}

.the-header__mobile-user > div {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.the-header__mobile-user span {
  overflow: hidden;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.the-header__mobile-action {
  justify-content: flex-start;
  width: 100%;
  margin-left: 0;
}

@media (max-width: 900px) {
  .the-header__inner {
    grid-template-columns: auto auto;
    justify-content: space-between;
    height: 64px;
  }

  .the-header__logo {
    height: 42px;
  }

  .the-header__nav,
  .the-header__actions {
    display: none;
  }

  .the-header__mobile-button {
    display: inline-flex;
  }
}
</style>