<template>
  <div
    :class="[
      'bg-white rounded-lg shadow-sm border border-gray-200',
      padding ? 'p-6' : '',
      hover ? 'hover:shadow-md transition-shadow duration-200' : '',
      className
    ]"
  >
    <div v-if="$slots.header" class="mb-4">
      <slot name="header" />
    </div>
    <slot />
    <div v-if="$slots.footer" class="mt-4">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  padding: {
    type: Boolean,
    default: true
  },
  hover: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
});
</script> 