<template>
  <div class="mb-10">
    <div class="flex justify-between mb-2">
      <span class="text-sm font-medium">Этап {{ currentStep }} из {{ totalSteps }}</span>
      <span class="text-sm font-medium">{{ Math.round((currentStep / totalSteps) * 100) }}% завершено</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2">
      <div 
        class="bg-primary-600 h-2 rounded-full transition-all duration-500" 
        :style="`width: ${(currentStep / totalSteps) * 100}%`"
      ></div>
    </div>
  </div>
</template>

<script setup>
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
</script> 