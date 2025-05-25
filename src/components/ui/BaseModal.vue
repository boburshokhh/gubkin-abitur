<template>
  <Teleport to="body">
    <Transition 
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="modelValue" 
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6"
      >
        <!-- Затемнение фона -->
        <div 
          class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
          @click="$emit('update:modelValue', false)"
        ></div>
        
        <!-- Контент модального окна -->
        <Transition 
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div 
            v-if="modelValue"
            class="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all mx-auto z-10 relative"
            :class="customClass"
          >
            <!-- Шапка модального окна -->
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
                <button 
                  type="button" 
                  class="text-gray-400 hover:text-gray-500" 
                  @click="$emit('update:modelValue', false); $emit('close')"
                >
                  <span class="sr-only">Закрыть</span>
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Содержимое модального окна -->
            <div class="px-6 py-4">
              <slot></slot>
            </div>
            
            <!-- Нижняя часть с действиями, если есть -->
            <div v-if="$slots.footer" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <slot name="footer"></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  customClass: {
    type: String,
    default: '',
  }
});

const emit = defineEmits(['update:modelValue', 'close']);

// Блокировать скролл при открытии модального окна
watch(() => props.modelValue, (value) => {
  if (value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

// Обработка нажатия Escape для закрытия модального окна
const handleEscape = (e) => {
  if (e.key === 'Escape' && props.modelValue) {
    emit('update:modelValue', false);
    emit('close');
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
  document.body.style.overflow = '';
});
</script> 