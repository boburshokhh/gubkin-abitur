<template>
  <div
    :style="customStyle"
    :class="[
      'animate-pulse bg-gray-200 rounded',
      { 'rounded-full': circle },
      className
    ]"
  >
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  width: {
    type: [String, Number],
    default: '100%'
  },
  height: {
    type: [String, Number],
    default: '1rem'
  },
  circle: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
});

// Установка размеров элемента
const customStyle = computed(() => {
  const style = {};
  
  // Добавляем единицы измерения к числовым значениям
  if (typeof props.width === 'number') {
    style.width = `${props.width}px`;
  } else {
    style.width = props.width;
  }
  
  if (typeof props.height === 'number') {
    style.height = `${props.height}px`;
  } else {
    style.height = props.height;
  }
  
  // Если установлен круглый скелетон, делаем равную ширину и высоту
  if (props.circle && typeof props.width === 'number') {
    style.height = style.width;
  }
  
  return style;
});
</script> 