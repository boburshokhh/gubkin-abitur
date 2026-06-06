<template>
  <el-dialog
    model-value
    title="Отправка заявления"
    width="420px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    align-center
  >
    <div class="space-y-5 text-center">
      <el-progress
        type="circle"
        :percentage="safeProgress"
        :status="safeProgress >= 100 ? 'success' : undefined"
      />
      <div>
        <p class="font-medium text-gray-900">{{ status || 'Загрузка...' }}</p>
        <p class="mt-1 text-sm text-gray-500">Не закрывайте страницу до завершения процесса.</p>
      </div>
      <el-progress :percentage="safeProgress" :stroke-width="10" striped striped-flow />
      <el-steps :active="activeStep" finish-status="success" simple>
        <el-step title="Данные" />
        <el-step title="Заявление" />
        <el-step title="Файлы" />
        <el-step title="Отправка" />
      </el-steps>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  progress: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'Загрузка...'
  }
});

const safeProgress = computed(() => Math.max(0, Math.min(100, Math.round(props.progress))));

const activeStep = computed(() => {
  if (safeProgress.value >= 90) return 3;
  if (safeProgress.value >= 30) return 2;
  if (safeProgress.value >= 20) return 1;
  return 0;
});
</script>
