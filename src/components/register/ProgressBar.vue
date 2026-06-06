<template>
  <div class="mb-10 rounded-xl bg-white p-4 shadow-sm">
    <el-steps :active="currentStep - 1" finish-status="success" align-center>
      <el-step
        v-for="step in steps"
        :key="step.title"
        :title="step.title"
      />
    </el-steps>
    <el-progress
      class="mt-5"
      :percentage="Math.round((currentStep / totalSteps) * 100)"
      :stroke-width="10"
      striped
      striped-flow
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';

defineProps({
  currentStep: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    required: true
  }
});

const steps = computed(() => [
  { title: 'Личные данные' },
  { title: 'Паспорт' },
  { title: 'Образование' },
  { title: 'Программы' },
  { title: 'Проверка' }
]);
</script> 