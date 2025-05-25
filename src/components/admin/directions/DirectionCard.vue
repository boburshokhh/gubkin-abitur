<template>
  <div class="flex flex-col bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden h-full">
    <!-- Шапка карточки с кодом и статусом -->
    <div class="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div class="font-medium text-gray-900 text-lg">{{ direction.code }}</div>
      <span class="px-3 py-1 text-xs rounded-full"
        :class="direction.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
        {{ direction.is_active ? 'Активно' : 'Неактивно' }}
      </span>
    </div>
    
    <!-- Основной контент карточки -->
    <div class="flex-grow p-5">
      <h3 class="text-lg font-medium text-gray-900 mb-4">{{ direction.name }}</h3>
      
      <div class="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
        <div>
          <div class="text-gray-500 text-sm font-medium mb-1">Тип:</div>
          <div class="text-base">{{ programTypeText }}</div>
        </div>
        <div>
          <div class="text-gray-500 text-sm font-medium mb-1">Область:</div>
          <div class="text-base">{{ fieldName }}</div>
        </div>
      </div>
      
      <div class="mb-3">
        <div class="text-gray-500 text-sm font-medium mb-1">Предметы:</div>
        <div class="text-base">
          <span v-if="subjectsCount > 0">
            {{ subjectsList }}
          </span>
          <span v-else class="text-gray-400 italic">Нет предметов</span>
        </div>
      </div>
    </div>
    
    <!-- Кнопки действий -->
    <div class="mt-auto flex border-t border-gray-200">
      <button 
        @click="$emit('edit')" 
        class="flex-1 py-3 text-primary-600 hover:bg-primary-50 transition-colors text-base"
      >
        <span class="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Редактировать
        </span>
      </button>
      <div class="w-px bg-gray-200"></div>
      <button 
        @click="$emit('delete')" 
        class="flex-1 py-3 text-red-600 hover:bg-red-50 transition-colors text-base"
      >
        <span class="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Удалить
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  direction: {
    type: Object,
    required: true
  },
  fieldMapping: {
    type: Object,
    default: () => ({})
  },
  subjectsCount: {
    type: Number,
    default: 0
  },
  subjectsList: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['edit', 'delete']);

// Вычисляемые свойства
const programTypeText = computed(() => 
  props.direction.program_type === 'bachelor' ? 'Бакалавриат' : 'Специалитет'
);

const fieldName = computed(() => {
  const fieldId = props.direction.field;
  return props.fieldMapping[fieldId] || fieldId;
});
</script> 