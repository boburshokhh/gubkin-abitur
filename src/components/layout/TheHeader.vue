<template>
  <el-header class="the-header">
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
        <el-dropdown trigger="click" @command="handleUserCommand">
          <el-button text>
            <el-avatar :size="28">{{ userInitials }}</el-avatar>
            <span class="the-header__user-name">{{ userName }}</span>
            <el-icon><ArrowDown /></el-icon>
          </el-button>

          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-if="hasStaffWorkspace"
                command="workspace"
              >
                {{ workspaceLabel }}
              </el-dropdown-item>
              <el-dropdown-item command="profile">
                Личный кабинет
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
        <el-button v-else disabled>Прием закрыт</el-button>
      </template>
    </el-space>

    <el-button
      class="the-header__mobile-button"
      :icon="Menu"
      text
      aria-label="Открыть меню"
      @click="isMobileMenuOpen = true"
    />

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
          <el-button v-else disabled>Прием закрыт</el-button>
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
  display: flex;
  align-items: center;
  gap: 24px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
}

.the-header__logo {
  width: auto;
  height: 44px;
}

.the-header__menu {
  flex: 1;
  border-bottom: 0;
}

.the-header__actions {
  margin-left: auto;
}

.the-header__user-name {
  margin: 0 6px;
}

.the-header__mobile-button {
  display: none;
  margin-left: auto;
}

.the-header__drawer-actions {
  width: 100%;
}

@media (max-width: 900px) {
  .the-header__menu,
  .the-header__actions {
    display: none;
  }

  .the-header__mobile-button {
    display: inline-flex;
  }
}
</style>