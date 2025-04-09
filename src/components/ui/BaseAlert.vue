<template>
  <div
    v-if="isVisible"
    class="rounded-md p-4 mb-4"
    :class="typeClasses"
    role="alert"
  >
    <div class="flex">
      <div class="flex-shrink-0">
        <!-- Иконка для типа сообщения -->
        <svg v-if="type === 'success'" class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <svg v-else-if="type === 'danger'" class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <svg v-else-if="type === 'warning'" class="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <svg v-else-if="type === 'info'" class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
      </div>
      
      <div class="ml-3 flex-1">
        <h3 v-if="title" class="text-sm font-medium" :class="textColorClass">
          {{ title }}
        </h3>
        <div class="text-sm" :class="[textColorClass, {'mt-2': title}]">
          <slot>{{ message }}</slot>
        </div>
      </div>
      
      <!-- Кнопка закрытия -->
      <div v-if="dismissible" class="ml-auto pl-3">
        <div class="-mx-1.5 -my-1.5">
          <button
            @click="dismiss"
            class="inline-flex rounded-md p-1.5"
            :class="dismissButtonClass"
          >
            <span class="sr-only">Закрыть</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'info', 'warning', 'danger'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  dismissible: {
    type: Boolean,
    default: false
  },
  timeout: {
    type: Number,
    default: 0 // 0 означает, что алерт не будет автоматически скрыт
  }
});

const isVisible = ref(true);

// Закрыть алерт
const dismiss = () => {
  isVisible.value = false;
};

// Классы для фона алерта в зависимости от типа
const typeClasses = computed(() => {
  switch (props.type) {
    case 'success': return 'bg-green-50 border border-green-100';
    case 'danger': return 'bg-red-50 border border-red-100';
    case 'warning': return 'bg-amber-50 border border-amber-100';
    case 'info': return 'bg-blue-50 border border-blue-100';
    default: return 'bg-blue-50';
  }
});

// Класс для цвета текста
const textColorClass = computed(() => {
  switch (props.type) {
    case 'success': return 'text-green-700';
    case 'danger': return 'text-red-700';
    case 'warning': return 'text-amber-700';
    case 'info': return 'text-blue-700';
    default: return 'text-blue-700';
  }
});

// Класс для кнопки закрытия
const dismissButtonClass = computed(() => {
  switch (props.type) {
    case 'success': return 'bg-green-50 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500';
    case 'danger': return 'bg-red-50 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500';
    case 'warning': return 'bg-amber-50 text-amber-500 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500';
    case 'info': return 'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
    default: return 'bg-blue-50 text-blue-500 hover:bg-blue-100';
  }
});

// Если установлен таймаут, автоматически скрываем алерт
if (props.timeout > 0) {
  setTimeout(() => {
    isVisible.value = false;
  }, props.timeout);
}
</script>