<template>
  <div 
    class="bg-white rounded-lg shadow overflow-hidden"
    :class="{
      'border border-gray-200': bordered,
      'hover:shadow-md transition-shadow': hover
    }"
  >
    <!-- Заголовок карточки, если он передан -->
    <div 
      v-if="$slots.header || title" 
      class="px-6 py-4 border-b border-gray-200"
      :class="headerClass"
    >
      <slot name="header">
        <h3 class="text-lg font-medium text-gray-900">
          {{ title }}
        </h3>
      </slot>
    </div>
    
    <!-- Тело карточки -->
    <div 
      class="p-6"
      :class="bodyClass"
    >
      <slot></slot>
    </div>
    
    <!-- Подвал карточки, если он передан -->
    <div 
      v-if="$slots.footer" 
      class="px-6 py-4 bg-gray-50 border-t border-gray-200"
      :class="footerClass"
    >
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  bordered: {
    type: Boolean,
    default: true
  },
  hover: {
    type: Boolean,
    default: false
  },
  headerClass: {
    type: String,
    default: ''
  },
  bodyClass: {
    type: String,
    default: ''
  },
  footerClass: {
    type: String,
    default: ''
  }
});
</script> 