<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
      <div v-if="isUploading" class="py-10">
        <BaseLoader size="md" />
        <p class="mt-2 text-sm text-gray-500 text-center">Загрузка файла...</p>
      </div>
      <div v-else-if="preview" class="space-y-2 flex flex-col items-center">
        <img 
          v-if="preview.type && preview.type.includes('image')" 
          :src="preview.url" 
          :alt="`Предпросмотр ${label}`" 
          class="max-h-48 object-contain" />
        <div v-else class="flex items-center space-x-2 py-4">
          <svg class="h-8 w-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
          </svg>
          <span class="text-sm text-gray-600">{{ preview.name }}</span>
        </div>
        <div class="flex space-x-2">
          <button type="button" @click="$emit('view')"
                  class="text-sm text-primary-600 hover:text-primary-700">
            Открыть файл
          </button>
          <button type="button" @click="$emit('reset')"
                  class="text-sm text-red-600 hover:text-red-700">
            Удалить
          </button>
        </div>
      </div>
      <div v-else class="space-y-1 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <div class="flex text-sm text-gray-600">
          <label :for="`file-upload-${fieldName}`" class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
            <span>Загрузить файл</span>
            <input :id="`file-upload-${fieldName}`" :name="`file-upload-${fieldName}`" type="file" class="sr-only" @change="onFileChange">
          </label>
          <p class="pl-1">или перетащите сюда</p>
        </div>
        <p class="text-xs text-gray-500">
          PNG, JPG, PDF размером до 10MB
        </p>
      </div>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
import { BaseLoader } from '@/components/ui';

const props = defineProps({
  fieldName: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  isUploading: {
    type: Boolean,
    default: false
  },
  preview: {
    type: Object,
    default: null
  },
  error: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['change', 'view', 'reset']);

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    emit('change', file);
  }
};
</script> 