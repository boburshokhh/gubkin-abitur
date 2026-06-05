<template>
  <div class="application-stats">
    <el-card shadow="never">
      <el-statistic title="Всего заявок" :value="totalApplications" />
    </el-card>
    <el-card shadow="never">
      <el-statistic title="Новых заявок" :value="newApplicationsCount" />
    </el-card>
    <el-card shadow="never">
      <el-statistic title="Требуют внимания" :value="submittedApplicationsCount" />
    </el-card>
  </div>
</template>

<script setup>
defineProps({
  totalApplications: {
    type: Number,
    default: 0
  },
  newApplicationsCount: {
    type: Number,
    default: 0
  },
  submittedApplicationsCount: {
    type: Number,
    default: 0
  }
});
</script>

<style scoped>
.application-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 16px;
}

@media (max-width: 640px) {
  .application-stats {
    grid-template-columns: 1fr;
  }
}
</style>