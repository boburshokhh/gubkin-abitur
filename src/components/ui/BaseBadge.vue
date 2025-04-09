<template>
  <component
    :is="tag"
    :class="[
      'inline-flex items-center rounded-full font-medium',
      sizeClasses,
      variantClasses,
      { 'cursor-pointer hover:opacity-80': clickable },
      className
    ]"
    v-bind="$attrs"
  >
    <!-- Иконка слева -->
    <slot name="prefix"></slot>

    <!-- Основной текст -->
    <span v-if="$slots.default || text">{{ text }}</span>
    
    <!-- Иконка справа или кнопка закрытия -->
    <slot name="suffix">
      <button 
        v-if="dismissible"
        type="button"
        class="ml-1 -mr-0.5 flex-shrink-0 rounded-full p-0.5 inline-flex items-center justify-center hover:bg-opacity-25 hover:bg-gray-900 focus:outline-none"
        @click="dismiss"
      >
        <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </slot>
  </component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => [
      'primary', 'secondary', 'success', 'danger', 
      'warning', 'info', 'dark', 'light'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  tag: {
    type: String,
    default: 'span'
  },
  dismissible: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['dismiss']);

// Классы для размера бейджа
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'px-2 py-0.5 text-xs';
    case 'md': return 'px-2.5 py-0.5 text-sm';
    case 'lg': return 'px-3 py-1 text-base';
    default: return 'px-2.5 py-0.5 text-sm';
  }
});

// Классы для варианта бейджа (цветовая схема)
const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-primary-100 text-primary-800';
    case 'secondary':
      return 'bg-gray-100 text-gray-800';
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'danger':
      return 'bg-red-100 text-red-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'info':
      return 'bg-blue-100 text-blue-800';
    case 'dark':
      return 'bg-gray-800 text-white';
    case 'light':
      return 'bg-gray-100 text-gray-800 border border-gray-200';
    default:
      return 'bg-primary-100 text-primary-800';
  }
});

// Функция закрытия бейджа
const dismiss = () => {
  emit('dismiss');
};
</script> 