<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="transform opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="closeOnBackdrop && close()"
      >
        <!-- Затемнение фона -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <div
            class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all"
            :class="[
              sizeClass,
              {'border border-gray-200': bordered},
              className
            ]"
          >
            <!-- Заголовок модального окна -->
            <div v-if="title || $slots.header" class="border-b border-gray-200 p-4">
              <slot name="header">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
                  <button
                    v-if="closeButton"
                    type="button"
                    class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    @click="close"
                  >
                    <span class="sr-only">Закрыть</span>
                    <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </slot>
            </div>

            <!-- Основное содержимое -->
            <div :class="['p-4', contentClass]">
              <slot></slot>
            </div>

            <!-- Футер модального окна -->
            <div v-if="$slots.footer" class="border-t border-gray-200 p-4">
              <slot name="footer"></slot>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value)
  },
  bordered: {
    type: Boolean,
    default: false
  },
  closeButton: {
    type: Boolean,
    default: true
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  },
  contentClass: {
    type: String,
    default: ''
  },
  className: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'close']);

// Закрытие модального окна
const close = () => {
  emit('update:modelValue', false);
  emit('close');
};

// Классы для размера модального окна
const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'max-w-md';
    case 'md': return 'max-w-lg';
    case 'lg': return 'max-w-2xl';
    case 'xl': return 'max-w-4xl';
    case 'full': return 'max-w-full mx-4';
    default: return 'max-w-lg';
  }
});
</script> 