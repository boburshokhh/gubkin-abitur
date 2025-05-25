<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full">
      <BaseLoader size="lg" class="mx-auto mb-4" />
      <h3 class="text-xl font-semibold mb-2 text-gray-900">Отправка заявления</h3>
      <p class="text-gray-600">
        Пожалуйста, подождите. Ваше заявление обрабатывается и документы загружаются. 
        Это может занять несколько минут.
      </p>
      <div class="mt-4 w-full bg-gray-200 rounded-full h-2">
        <div class="bg-primary-600 h-2 rounded-full" :style="`width: ${progress}%`"></div>
      </div>
      <p class="mt-2 text-sm text-gray-500">{{ status }}</p>
    </div>
  </div>
</template>

<script setup>
import { BaseLoader } from '@/components/ui';

defineProps({
  progress: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'Загрузка...'
  }
});
</script> 