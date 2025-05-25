<template>
  <div
    v-if="loading"
    :class="[
      'flex items-center justify-center',
      fullScreen ? 'fixed inset-0 bg-gray-900 bg-opacity-50 z-50' : ''
    ]"
  >
    <div
      :class="[
        'flex flex-col items-center',
        fullScreen ? 'bg-white rounded-lg shadow-xl p-6' : '',
        className
      ]"
    >
      <!-- Индикатор загрузки в виде спиннера -->
      <svg
        class="animate-spin"
        :class="[
          sizeClasses,
          'text-' + color + '-600'
        ]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>

      <!-- Текст загрузки, если он передан -->
      <span
        v-if="text"
        class="mt-3 text-center"
        :class="[
          textSizeClasses,
          'text-' + textColor + '-700'
        ]"
      >
        {{ text }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: true
  },
  fullScreen: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'gray', 'red', 'green', 'blue', 'indigo', 'purple', 'pink', 'amber'].includes(value)
  },
  text: {
    type: String,
    default: ''
  },
  textColor: {
    type: String,
    default: 'gray',
    validator: (value) => ['primary', 'gray', 'red', 'green', 'blue', 'indigo', 'purple', 'pink', 'amber'].includes(value)
  },
  className: {
    type: String,
    default: ''
  }
});

// Классы для размера спиннера
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'h-5 w-5';
    case 'md': return 'h-8 w-8';
    case 'lg': return 'h-12 w-12';
    case 'xl': return 'h-16 w-16';
    default: return 'h-8 w-8';
  }
});

// Классы для размера текста
const textSizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'text-xs';
    case 'md': return 'text-sm';
    case 'lg': return 'text-base';
    case 'xl': return 'text-lg';
    default: return 'text-sm';
  }
});
</script> 