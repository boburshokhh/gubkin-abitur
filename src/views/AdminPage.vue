<template>
  <el-container class="admin-page">
    <el-main class="admin-page__main">
      <el-card shadow="never" class="admin-page__card">
        <template #header>
          <div class="admin-page__card-header">
            <div>
              <h1 class="admin-page__title">Администрирование</h1>
              <el-text type="info">
                Управление заявками, программами и пользователями
              </el-text>
            </div>

            <el-space wrap>
              <el-text>
                {{ adminName }}
              </el-text>
              <el-tag :type="authStore.isReviewer ? 'warning' : 'primary'" effect="light">
                {{ getRoleName() }}
              </el-tag>
            </el-space>
          </div>
        </template>

        <el-tabs v-model="currentTab" class="admin-page__tabs">
          <el-tab-pane
            v-for="tab in tabs"
            :key="tab.id"
            :label="tab.name"
            :name="tab.id"
          />
        </el-tabs>

        <UsersManagement v-if="currentTab === 'users'" />
        <InvitationsManagement v-else-if="currentTab === 'invitations'" />
        <EducationalProgramsManager v-else-if="currentTab === 'educational-programs'" />
        <ApplicationsManager v-else-if="currentTab === 'applications'" />
        <ContentManager v-else-if="currentTab === 'content'" />
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import UsersManagement from './admin/UsersManagement.vue';
import InvitationsManagement from './admin/InvitationsManagement.vue';
import EducationalProgramsManager from './admin/educational-programs/EducationalProgramsManager.vue';
import ApplicationsManager from '@/components/application/ApplicationsManager.vue';
import ContentManager from './admin/content/ContentManager.vue';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const tabs = computed(() => {
  const baseTabs = [
    { id: 'applications', name: 'Заявки абитуриентов' },
    { id: 'educational-programs', name: 'Образовательные программы' },
  ];
  
  if (authStore.isAdmin && !authStore.isReviewer) {
    baseTabs.push({ id: 'content', name: 'Контент сайта' });
    baseTabs.push({ id: 'users', name: 'Управление пользователями' });
    baseTabs.push({ id: 'invitations', name: 'Приглашения' });
  }
  
  return baseTabs;
});

const currentTab = ref('applications');

const adminName = computed(() => {
  const profileName = [
    authStore.profile?.first_name,
    authStore.profile?.last_name
  ].filter(Boolean).join(' ');

  if (profileName) return profileName;
  if (authStore.user?.email) return authStore.user.email;

  return 'Пользователь';
});

const getRoleName = () => {
  if (authStore.isReviewer) return 'Сотрудник приемной комиссии';
  if (authStore.isAdmin) return 'Администратор';
  return 'Пользователь';
};

onMounted(async () => {
  await authStore.initAuth();
  
  if (!authStore.isAdmin && !authStore.isReviewer) {
    toast.error('У вас нет прав для доступа к панели администратора');
    router.push('/');
  } else {
    toast.success(`Добро пожаловать, ${getRoleName()}!`);
  }
});
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: var(--el-bg-color-page);
}

.admin-page__main {
  width: 100%;
  padding: 24px;
}

.admin-page__card {
  width: 100%;
  border-radius: 12px;
}

.admin-page__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.admin-page__title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.admin-page__tabs :deep(.el-tabs__header) {
  margin-bottom: 24px;
}

@media (max-width: 640px) {
  .admin-page__card-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .admin-page__main {
    padding: 12px;
  }
}
</style>
