<template>
  <component
    :is="tag"
    :to="to"
    :class="[
      'inline-flex items-center justify-center rounded-md font-medium transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      sizeClasses[size],
      variantClasses[variant],
      { 'opacity-50 cursor-not-allowed': disabled }
    ]"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  tag: {
    type: String,
    default: 'button'
  },
  to: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'light', 'outline'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};

const variantClasses = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  light: 'bg-white text-primary-600 hover:bg-gray-50 focus:ring-primary-500 border border-primary-600',
  outline: 'bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-primary-500 border border-primary-600'
};
</script> 