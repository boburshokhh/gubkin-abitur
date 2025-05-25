<template>
  <div>
    <label 
      v-if="label" 
      :for="id" 
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="relative">
      <!-- Иконка слева -->
      <div v-if="$slots.prefix || prefixIcon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <slot name="prefix">
          <svg 
            v-if="prefixIcon" 
            class="h-5 w-5 text-gray-400" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path :d="getIconPath(prefixIcon)" />
          </svg>
        </slot>
      </div>
      
      <!-- Поле ввода -->
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :min="min"
        :max="max"
        :maxlength="maxlength"
        :pattern="pattern"
        :autocomplete="autocomplete"
        :class="[
          'form-input',
          { 'pl-10': $slots.prefix || prefixIcon },
          { 'pr-10': $slots.suffix || suffixIcon },
          { 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500': error },
          { 'opacity-75 cursor-not-allowed bg-gray-100': disabled },
          inputClass
        ]"
        @input="onInput"
        @blur="onBlur"
        @focus="$emit('focus', $event)"
      />
      
      <!-- Иконка справа -->
      <div v-if="$slots.suffix || suffixIcon" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <slot name="suffix">
          <svg 
            v-if="suffixIcon" 
            class="h-5 w-5 text-gray-400" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path :d="getIconPath(suffixIcon)" />
          </svg>
        </slot>
      </div>
    </div>
    
    <!-- Текст ошибки -->
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    
    <!-- Вспомогательный текст -->
    <p v-else-if="helperText" class="mt-1 text-sm text-gray-500">{{ helperText }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substring(2, 9)}`
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => [
      'text', 'password', 'email', 'number', 
      'date', 'tel', 'url', 'search', 'time'
    ].includes(value)
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  helperText: {
    type: String,
    default: ''
  },
  prefixIcon: {
    type: String,
    default: ''
  },
  suffixIcon: {
    type: String,
    default: ''
  },
  min: {
    type: [String, Number],
    default: undefined
  },
  max: {
    type: [String, Number],
    default: undefined
  },
  maxlength: {
    type: [String, Number],
    default: undefined
  },
  pattern: {
    type: String,
    default: undefined
  },
  autocomplete: {
    type: String,
    default: 'off'
  },
  inputClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

// Обработка ввода
const onInput = (event) => {
  let value = event.target.value;
  
  // Для числовых полей, конвертируем строку в число
  if (props.type === 'number' && value !== '') {
    value = Number(value);
  }
  
  emit('update:modelValue', value);
};

// Обработка потери фокуса
const onBlur = (event) => {
  emit('blur', event);
};

// Получение иконки по имени (простая реализация)
const getIconPath = (iconName) => {
  const icons = {
    user: 'M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z',
    email: 'M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z',
    lock: 'M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    calendar: 'M3 10h18M7 3v2M17 3v2M6 20h12a3 3 0 003-3V9a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.05 11.05 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  };
  
  return icons[iconName] || '';
};
</script> 