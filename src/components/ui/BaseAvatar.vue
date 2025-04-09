<template>
  <div
    :class="[
      'inline-flex items-center justify-center overflow-hidden bg-gray-100',
      sizeClasses,
      { 'rounded-full': rounded, 'rounded': !rounded },
      { 'border border-gray-300': bordered },
      { 'ring-2 ring-primary-500': active },
      { 'ring-2 ring-red-500': status === 'danger' },
      { 'ring-2 ring-green-500': status === 'success' },
      { 'ring-2 ring-yellow-500': status === 'warning' },
      className
    ]"
  >
    <!-- Если есть изображение, отображаем его -->
    <img
      v-if="src && !error"
      :src="src"
      :alt="alt"
      class="h-full w-full object-cover"
      @error="handleError"
    />
    
    <!-- Если есть имя и нет изображения или ошибка загрузки - показываем инициалы -->
    <span
      v-else-if="name && !src || error"
      :class="[
        'font-medium text-gray-800',
        textSizeClasses
      ]"
    >
      {{ initials }}
    </span>
    
    <!-- Если нет ни изображения, ни имени, показываем иконку пользователя -->
    <svg
      v-else
      :class="iconSizeClasses"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
    
    <!-- Индикатор статуса (онлайн/офлайн и др.) -->
    <span
      v-if="showStatus && status"
      :class="[
        'absolute right-0 bottom-0 block rounded-full ring-2 ring-white',
        statusSizeClasses,
        { 'bg-green-500': status === 'success' },
        { 'bg-red-500': status === 'danger' },
        { 'bg-yellow-500': status === 'warning' },
        { 'bg-gray-500': status === 'offline' }
      ]"
    ></span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: 'Аватар'
  },
  name: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  rounded: {
    type: Boolean,
    default: true
  },
  bordered: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: '',
    validator: (value) => ['', 'success', 'danger', 'warning', 'offline'].includes(value)
  },
  showStatus: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
});

// Обработка ошибки загрузки изображения
const error = ref(false);
const handleError = () => {
  error.value = true;
};

// Вычисление инициалов пользователя
const initials = computed(() => {
  if (!props.name) return '';
  
  const names = props.name.split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
});

// Классы для размера аватара
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'h-6 w-6';
    case 'sm': return 'h-8 w-8';
    case 'md': return 'h-10 w-10';
    case 'lg': return 'h-12 w-12';
    case 'xl': return 'h-16 w-16';
    default: return 'h-10 w-10';
  }
});

// Классы для размера текста инициалов
const textSizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'text-xs';
    case 'sm': return 'text-sm';
    case 'md': return 'text-base';
    case 'lg': return 'text-lg';
    case 'xl': return 'text-xl';
    default: return 'text-base';
  }
});

// Классы для размера иконки
const iconSizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'h-4 w-4';
    case 'sm': return 'h-5 w-5';
    case 'md': return 'h-6 w-6';
    case 'lg': return 'h-7 w-7';
    case 'xl': return 'h-8 w-8';
    default: return 'h-6 w-6';
  }
});

// Классы для размера индикатора статуса
const statusSizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'h-1.5 w-1.5';
    case 'sm': return 'h-2 w-2';
    case 'md': return 'h-2.5 w-2.5';
    case 'lg': return 'h-3 w-3';
    case 'xl': return 'h-3.5 w-3.5';
    default: return 'h-2.5 w-2.5';
  }
});
</script> 