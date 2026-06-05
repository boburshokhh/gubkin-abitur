<template>
  <el-container class="admin-page">
    <el-header class="admin-page__header">
      <div class="admin-page__header-inner">
        <el-page-header title="" content="Панель администратора" />

        <el-space wrap>
          <el-text>
            {{ authStore.profile?.first_name }} {{ authStore.profile?.last_name }}
          </el-text>
          <el-tag :type="authStore.isReviewer ? 'warning' : 'primary'" effect="light">
            {{ getRoleName() }}
          </el-tag>
        </el-space>
      </div>
    </el-header>

    <el-main class="admin-page__main">
      <el-card shadow="never" class="admin-page__card">
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

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const tabs = computed(() => {
  const baseTabs = [
    { id: 'applications', name: 'Заявки абитуриентов' },
    { id: 'educational-programs', name: 'Образовательные программы' },
  ];
  
  if (authStore.isAdmin && !authStore.isReviewer) {
    baseTabs.push({ id: 'users', name: 'Управление пользователями' });
    baseTabs.push({ id: 'invitations', name: 'Приглашения' });
  }
  
  return baseTabs;
});

const currentTab = ref('applications');

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

.admin-page__header {
  height: auto;
  padding: 16px 24px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
}

.admin-page__header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: 1280px;
  margin: 0 auto;
}

.admin-page__main {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
}

.admin-page__card {
  border-radius: 12px;
}

.admin-page__tabs :deep(.el-tabs__header) {
  margin-bottom: 24px;
}

@media (max-width: 640px) {
  .admin-page__header-inner {
    align-items: flex-start;
    flex-direction: column;
  }

  .admin-page__main {
    padding: 12px;
  }
}
</style>
