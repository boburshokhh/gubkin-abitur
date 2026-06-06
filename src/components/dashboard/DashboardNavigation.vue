<template>
  <el-card shadow="never" class="dashboard-navigation">
    <el-space wrap>
      <el-button
        :type="isApplicationsActive ? 'primary' : 'default'"
        @click="router.push('/dashboard/applications')"
      >
        <el-icon><Document /></el-icon>
        Мои заявления
      </el-button>

      <el-button
        :type="isProfileActive ? 'primary' : 'default'"
        @click="router.push('/dashboard/profile')"
      >
        <el-icon><User /></el-icon>
        Мой профиль
      </el-button>

      <el-button
        v-if="isAdmissionOpen"
        type="success"
        @click="router.push('/register')"
      >
        <el-icon><Plus /></el-icon>
        Подать новое заявление
      </el-button>
      <el-button v-else disabled>
        Прием 2026 закрыт
      </el-button>
    </el-space>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Document, Plus, User } from '@element-plus/icons-vue'
import { useAdmissionStatus } from '@/composables/useAdmissionStatus'

const route = useRoute()
const router = useRouter()

const { isAdmissionOpen } = useAdmissionStatus()

const isApplicationsActive = computed(() => route.path.includes('/dashboard/applications'))
const isProfileActive = computed(() => route.path === '/dashboard/profile')
</script>

<style scoped>
.dashboard-navigation {
  margin-bottom: 24px;
  border-radius: 18px;
}

@media (max-width: 640px) {
  .dashboard-navigation :deep(.el-space),
  .dashboard-navigation :deep(.el-space__item),
  .dashboard-navigation .el-button {
    width: 100%;
  }

  .dashboard-navigation :deep(.el-space__item) {
    margin-right: 0 !important;
  }
}
</style>