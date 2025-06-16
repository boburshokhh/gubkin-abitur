<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full mx-4">
      <!-- Иконка загрузки -->
      <div class="relative mb-6">
        <div class="w-16 h-16 mx-auto">
          <svg class="animate-spin w-16 h-16 text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <!-- Процент в центре -->
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-lg font-bold text-primary-600">{{ Math.round(progress) }}%</span>
          </div>
        </div>
      </div>
      
      <!-- Заголовок -->
      <h3 class="text-xl font-semibold mb-2 text-gray-900">Отправка заявления</h3>
      
      <!-- Описание -->
      <p class="text-gray-600 mb-6">
        Пожалуйста, подождите. Ваше заявление обрабатывается и документы загружаются. 
      </p>
      
      <!-- Прогресс-бар с улучшенным дизайном -->
      <div class="mb-4">
        <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            class="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
            :style="`width: ${Math.max(0, Math.min(100, progress))}%; transform: translateZ(0);`"
          >
            <!-- Анимированный блик -->
            <div class="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
          </div>
        </div>
        
        <!-- Числовой индикатор прогресса -->
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span class="font-medium text-primary-600">{{ Math.round(progress) }}%</span>
          <span>100%</span>
        </div>
      </div>
      
      <!-- Статус с иконкой -->
      <div class="flex items-center justify-center space-x-2">
        <div class="flex-shrink-0">
          <!-- Индикатор статуса -->
          <div v-if="progress < 100" class="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
          <div v-else class="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
        <p class="text-sm font-medium" :class="progress < 100 ? 'text-gray-700' : 'text-green-600'">
          {{ status || 'Загрузка...' }}
        </p>
      </div>
      
      <!-- Этапы процесса -->
      <div class="mt-6 space-y-2">
        <div class="flex justify-between items-center text-xs">
          <span class="text-gray-500">Подготовка данных</span>
          <span v-if="progress >= 10" class="text-green-500">✓</span>
          <span v-else-if="progress >= 0" class="text-primary-600">●</span>
          <span v-else class="text-gray-300">○</span>
        </div>
        <div class="flex justify-between items-center text-xs">
          <span class="text-gray-500">Создание заявления</span>
          <span v-if="progress >= 20" class="text-green-500">✓</span>
          <span v-else-if="progress >= 10" class="text-primary-600">●</span>
          <span v-else class="text-gray-300">○</span>
        </div>
        <div class="flex justify-between items-center text-xs">
          <span class="text-gray-500">Загрузка документов</span>
          <span v-if="progress >= 85" class="text-green-500">✓</span>
          <span v-else-if="progress >= 30" class="text-primary-600">●</span>
          <span v-else class="text-gray-300">○</span>
        </div>
        <div class="flex justify-between items-center text-xs">
          <span class="text-gray-500">Финализация</span>
          <span v-if="progress >= 100" class="text-green-500">✓</span>
          <span v-else-if="progress >= 90" class="text-primary-600">●</span>
          <span v-else class="text-gray-300">○</span>
        </div>
      </div>
      
      <!-- Предупреждение -->
      <div class="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div class="flex items-start space-x-2">
          <svg class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <p class="text-xs text-amber-700">
            Не закрывайте эту страницу до завершения процесса
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
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

<style scoped>
/* Дополнительные анимации для плавности */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
</style> 