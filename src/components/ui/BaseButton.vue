<template>
  <component
    :is="tag"
    :type="type"
    :to="to"
    :class="[
      'inline-flex items-center justify-center rounded-md font-medium focus:outline-none transition-colors',
      sizeClasses,
      variantClasses,
      {'opacity-50 cursor-not-allowed': disabled},
      {'w-full': block},
      className
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <span class="flex items-center">
      <slot name="prefix"></slot>
      <slot></slot>
      <slot name="suffix"></slot>
    </span>
    
    <span v-if="loading" class="ml-2">
      <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
  </component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  tag: {
    type: String,
    default: 'button'
  },
  type: {
    type: String,
    default: 'button'
  },
  to: {
    type: [String, Object],
    default: undefined
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
});

defineEmits(['click']);

// Классы для размера кнопки
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'px-3 py-1.5 text-sm';
    case 'lg': return 'px-6 py-3 text-lg';
    default: return 'px-4 py-2 text-base';
  }
});

// Классы для варианта (цвета) кнопки
const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm focus:ring-2 focus:ring-primary-500 focus:ring-offset-2';
    case 'secondary':
      return 'bg-gray-200 hover:bg-gray-300 text-gray-800 shadow-sm focus:ring-2 focus:ring-gray-400 focus:ring-offset-2';
    case 'success':
      return 'bg-green-600 hover:bg-green-700 text-white shadow-sm focus:ring-2 focus:ring-green-500 focus:ring-offset-2';
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-2 focus:ring-red-500 focus:ring-offset-2';
    case 'warning':
      return 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm focus:ring-2 focus:ring-amber-400 focus:ring-offset-2';
    case 'info':
      return 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:ring-offset-2';
    case 'light':
      return 'bg-gray-100 hover:bg-gray-200 text-gray-800 shadow-sm focus:ring-2 focus:ring-gray-200 focus:ring-offset-2';
    case 'dark':
      return 'bg-gray-800 hover:bg-gray-900 text-white shadow-sm focus:ring-2 focus:ring-gray-700 focus:ring-offset-2';
    case 'link':
      return 'bg-transparent hover:bg-gray-100 text-primary-600 hover:text-primary-800 focus:ring-0';
    default:
      return 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm focus:ring-2 focus:ring-primary-500 focus:ring-offset-2';
  }
});
</script> 