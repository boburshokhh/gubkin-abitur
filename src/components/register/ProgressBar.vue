<template>
  <div class="mb-6 rounded-xl bg-white p-4 shadow-sm">
    <!-- Мобильный вид (<md): компактная строка с текущим шагом -->
    <div class="md:hidden">
      <div class="mb-3 flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700">
          Шаг {{ currentStep }} из {{ totalSteps }} — {{ currentStepTitle }}
        </span>
        <span class="text-sm font-semibold text-primary-600">
          {{ Math.round((currentStep / totalSteps) * 100) }}%
        </span>
      </div>
      <!-- Точки-индикаторы шагов -->
      <div class="mb-3 flex items-center gap-1.5">
        <div
          v-for="n in totalSteps"
          :key="n"
          :class="[
            'h-2 flex-1 rounded-full transition-all duration-300',
            n < currentStep ? 'bg-primary-500' :
            n === currentStep ? 'bg-primary-600' :
            'bg-gray-200'
          ]"
        />
      </div>
    </div>

    <!-- Десктопный вид (>=md): горизонтальные шаги с краткими подписями -->
    <div class="hidden md:block">
      <el-steps :active="currentStep - 1" finish-status="success" align-center class="mb-4">
        <el-step
          v-for="step in steps"
          :key="step.short"
          :title="step.short"
        />
      </el-steps>
    </div>

    <el-progress
      :percentage="Math.round((currentStep / totalSteps) * 100)"
      :stroke-width="8"
      striped
      striped-flow
      :show-text="false"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
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
  { title: 'Личные данные', short: 'Личные' },
  { title: 'Паспорт',       short: 'Паспорт' },
  { title: 'Образование',   short: 'Образование' },
  { title: 'Программы',     short: 'Программы' },
  { title: 'Проверка',      short: 'Проверка' }
]);

const currentStepTitle = computed(
  () => steps.value[props.currentStep - 1]?.title ?? ''
);
</script>

<style scoped>
:deep(.el-step__title) {
  font-size: 13px;
  line-height: 1.3;
}
</style>
