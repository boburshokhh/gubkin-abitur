<template>
  <el-header class="the-header">
    <div class="the-header__inner">
      <router-link to="/" class="the-header__logo-link" aria-label="На главную">
        <img
          class="the-header__logo"
          src="@/assets/photos/gubkin_logo.png"
          alt="Логотип Филиала РГУ нефти и газа (НИУ) имени И.М. Губкина в городе Ташкенте"
        >
      </router-link>

      <el-menu
        class="the-header__menu"
        mode="horizontal"
        :ellipsis="false"
        :default-active="activeNavigationPath"
        @select="goTo"
      >
        <el-menu-item
          v-for="link in navigationLinks"
          :key="link.to"
          :index="link.to"
        >
          {{ link.text }}
        </el-menu-item>
      </el-menu>

      <el-space class="the-header__actions">
        <template v-if="isAuthenticated">
          <el-dropdown
            trigger="click"
            @command="handleUserCommand"
          >
            <button class="the-header__profile" type="button" aria-label="Открыть меню профиля">
              <el-avatar :size="32">{{ userInitials }}</el-avatar>
              <div class="the-header__profile-info">
                <el-text class="the-header__profile-name" truncated>
                  {{ userName }}
                </el-text>
                <el-tag size="small" :type="roleTagType" effect="light">
                  {{ roleLabel }}
                </el-tag>
              </div>
              <el-icon class="the-header__profile-arrow">
                <ArrowDown />
              </el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  Личный кабинет
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="hasStaffWorkspace"
                  command="workspace"
                >
                  {{ workspaceLabel }}
                </el-dropdown-item>
                <el-dropdown-item disabled>
                  Статус: {{ accountStatusLabel }}
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  Выйти
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>

        <template v-else>
          <el-button @click="goTo('/auth')">Войти</el-button>
          <el-button
            v-if="isAdmissionOpen"
            type="primary"
            @click="goTo('/register')"
          >
            Подать документы
          </el-button>
          <el-button v-else disabled>Прием 2026 закрыт</el-button>
        </template>
      </el-space>

      <el-button
        class="the-header__mobile-button"
        :icon="Menu"
        text
        aria-label="Открыть меню"
        @click="isMobileMenuOpen = true"
      />
    </div>

    <el-drawer
      v-model="isMobileMenuOpen"
      title="Меню"
      direction="rtl"
      size="280px"
    >
      <el-menu
        :default-active="activeNavigationPath"
        @select="goTo"
      >
        <el-menu-item
          v-for="link in navigationLinks"
          :key="link.to"
          :index="link.to"
        >
          {{ link.text }}
        </el-menu-item>
      </el-menu>

      <el-divider />

      <el-space direction="vertical" fill class="the-header__drawer-actions">
        <template v-if="isAuthenticated">
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item label="Email">
              {{ userEmail }}
            </el-descriptions-item>
            <el-descriptions-item label="Роль">
              <el-tag size="small" :type="roleTagType" effect="light">
                {{ roleLabel }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Статус">
              <el-tag size="small" :type="accountStatusType" effect="light">
                {{ accountStatusLabel }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>

          <el-button
            v-if="hasStaffWorkspace"
            @click="goToWorkspace"
          >
            {{ workspaceLabel }}
          </el-button>
          <el-button @click="goToProfile">Личный кабинет</el-button>
          <el-button type="danger" plain @click="confirmLogout">
            Выйти
          </el-button>
        </template>

        <template v-else>
          <el-button @click="goTo('/auth')">Войти</el-button>
          <el-button
            v-if="isAdmissionOpen"
            type="primary"
            @click="goTo('/register')"
          >
            Подать документы
          </el-button>
          <el-button v-else disabled>Прием 2026 закрыт</el-button>
        </template>
      </el-space>
    </el-drawer>
  </el-header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { ArrowDown, Menu } from '@element-plus/icons-vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const isMobileMenuOpen = ref(false)
const isAdmissionOpen = import.meta.env.VITE_ADMISSION_OPEN === 'true'

const navigationLinks = [
  { to: '/', text: 'Главная' },
  { to: '/admission2025', text: 'Прием 2025' },
  { to: '/faq', text: 'Вопросы и ответы' },
  { to: '/statistics', text: 'Статистика' }
]

const isAuthenticated = computed(() => authStore.isAuthenticated)
const hasStaffWorkspace = computed(() => authStore.isAdmin || authStore.isReviewer)
const workspacePath = computed(() => (authStore.isAdmin ? '/admin' : '/reviewer'))
const workspaceLabel = computed(() => (
  authStore.isAdmin ? 'Панель администратора' : 'Панель сотрудника'
))
const userEmail = computed(() => authStore.user?.email || 'Email не указан')

const roleLabel = computed(() => {
  if (authStore.isAdmin) return 'Администратор'
  if (authStore.isReviewer) return 'Сотрудник'
  return 'Абитуриент'
})

const roleTagType = computed(() => {
  if (authStore.isAdmin) return 'danger'
  if (authStore.isReviewer) return 'warning'
  return 'primary'
})

const accountStatusLabel = computed(() => (
  authStore.isEmailConfirmed ? 'Подтвержден' : 'Не подтвержден'
))

const accountStatusType = computed(() => (
  authStore.isEmailConfirmed ? 'success' : 'warning'
))

const userName = computed(() => {
  const profileName = [
    authStore.profile?.first_name,
    authStore.profile?.last_name
  ].filter(Boolean).join(' ')

  if (profileName) return profileName
  if (authStore.user?.email) return authStore.user.email.split('@')[0]

  return 'Пользователь'
})

const userInitials = computed(() => userName.value.slice(0, 1).toUpperCase())

const activeNavigationPath = computed(() => {
  const activeLink = navigationLinks
    .filter(link => link.to !== '/')
    .find(link => route.path.startsWith(link.to))

  return activeLink?.to || (route.path === '/' ? '/' : '')
})

const goTo = (path) => {
  isMobileMenuOpen.value = false
  if (route.path !== path) router.push(path)
}

const goToProfile = () => {
  goTo('/dashboard/profile')
}

const goToWorkspace = () => {
  goTo(workspacePath.value)
}

const handleUserCommand = (command) => {
  if (command === 'profile') goToProfile()
  if (command === 'workspace') goToWorkspace()
  if (command === 'logout') confirmLogout()
}

const logout = async () => {
  try {
    await authStore.logout()
    goTo('/')
    toast.success('Вы успешно вышли из системы')
  } catch (error) {
    console.error('Ошибка при выходе:', error)
    toast.error('Не удалось выйти из системы')
  }
}

const confirmLogout = async () => {
  isMobileMenuOpen.value = false

  try {
    await ElMessageBox.confirm(
      'Вы действительно хотите выйти из системы?',
      'Выход из системы',
      {
        confirmButtonText: 'Выйти',
        cancelButtonText: 'Отмена',
        type: 'warning'
      }
    )
    await logout()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') console.error('Ошибка подтверждения выхода:', error)
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
  height: 64px;
  padding: 0;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
}

.the-header__inner {
  display: flex;
  align-items: center;
  gap: 20px;
  width: min(1180px, calc(100% - 32px));
  height: 100%;
  margin: 0 auto;
}

.the-header__logo-link {
  flex: 0 0 auto;
}

.the-header__logo {
  width: auto;
  height: 44px;
}

.the-header__menu {
  flex: 1 1 auto;
  justify-content: center;
  min-width: 0;
  border-bottom: 0;
}

.the-header__actions {
  flex: 0 0 auto;
  min-width: 0;
}

.the-header__profile {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  max-width: 300px;
  padding: 4px 8px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.the-header__profile:hover,
.the-header__profile:focus-visible {
  border-color: var(--el-color-primary);
  outline: none;
}

.the-header__profile-info {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.the-header__profile-name {
  max-width: 220px;
  font-size: 13px;
  line-height: 1.2;
  font-weight: 600;
}

.the-header__profile-arrow {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
}

.the-header__mobile-button {
  display: none;
  margin-left: auto;
}

.the-header__drawer-actions {
  width: 100%;
}

@media (max-width: 1100px) {
  .the-header__menu,
  .the-header__actions {
    display: none;
  }

  .the-header__mobile-button {
    display: inline-flex;
  }
}
</style>