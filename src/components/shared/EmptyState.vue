<template>
  <el-card shadow="never" class="empty-state">
    <el-empty description="У вас пока нет заявлений">
      <el-text type="info" class="empty-state__text">
        Подайте документы для поступления, заполнив форму.
      </el-text>

      <div class="empty-state__actions">
        <router-link v-if="isAdmissionOpen" custom to="/register" v-slot="{ navigate }">
          <el-button type="primary" @click="navigate">
            Подать заявление
          </el-button>
        </router-link>

        <el-button v-else type="info" disabled>
          Прием 2026 закрыт
        </el-button>
      </div>
    </el-empty>
  </el-card>
</template>

<script setup>
import { useAdmissionStatus } from '@/composables/useAdmissionStatus'

const { isAdmissionOpen } = useAdmissionStatus()
</script> 

<style scoped>
.empty-state {
  text-align: center;
}

.empty-state__text {
  display: block;
  margin-bottom: 16px;
}

.empty-state__actions {
  display: flex;
  justify-content: center;
}
</style>