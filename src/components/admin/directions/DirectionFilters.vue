<template>
  <div class="bg-white shadow rounded-lg p-4 mb-6">
    <h2 class="text-xl font-bold mb-2 text-gray-900">{{ title }}</h2>
    <p class="text-gray-600 mb-4">{{ description }}</p>
    
    <div class="flex flex-wrap justify-between items-center gap-2 mb-4">
      <slot name="actions">
        <BaseButton @click="$emit('add')" variant="primary" class="w-full sm:w-auto">
          <span class="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
          Добавить направление
          </span>
        </BaseButton>
      </slot>
      
      <p class="text-sm text-gray-500 mt-2 sm:mt-0">
        Всего направлений: {{ totalCount }}
      </p>
    </div>
    
    <!-- Фильтры и поиск -->
    <div class="flex flex-wrap gap-4 mb-4">
      <div class="w-full sm:w-auto">
        <label class="block text-sm font-medium text-gray-700 mb-1">Тип программы</label>
        <select 
          :value="modelValue.programType" 
          @change="updateFilter('programType', $event.target.value)"
          class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        >
          <option value="">Все</option>
          <option value="bachelor">Бакалавриат</option>
          <option value="specialist">Специалитет</option>
        </select>
      </div>
      
      <div class="w-full sm:w-auto">
        <label class="block text-sm font-medium text-gray-700 mb-1">Область</label>
        <select 
          :value="modelValue.field" 
          @change="updateFilter('field', $event.target.value)"
          class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        >
          <option value="">Все</option>
          <option v-for="field in fields" :key="field.value" :value="field.value">
            {{ field.label }}
          </option>
        </select>
      </div>
      
      <div class="w-full sm:w-auto flex-grow sm:max-w-sm">
        <label class="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
        <input 
          :value="modelValue.search" 
          @input="updateFilter('search', $event.target.value)"
          type="text" 
          class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          placeholder="Поиск по названию или коду"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      programType: '',
      field: '',
      search: ''
    })
  },
  fields: {
    type: Array,
    default: () => []
  },
  totalCount: {
    type: Number,
    default: 0
  },
  title: {
    type: String,
    default: 'Управление направлениями подготовки'
  },
  description: {
    type: String,
    default: 'Добавление, редактирование и удаление направлений бакалавриата и специалитета.'
  }
});

const emit = defineEmits(['update:modelValue', 'add']);

const updateFilter = (key, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  });
};
</script> 