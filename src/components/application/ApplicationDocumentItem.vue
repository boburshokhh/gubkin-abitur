<template>
  <div class="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
    <div class="flex items-center">
      <svg class="h-8 w-8 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      <div>
        <h4 class="text-sm font-medium text-gray-900">{{ document.document_type?.name || 'Документ' }}</h4>
        <p class="text-xs text-gray-500">{{ document.file_name }} ({{ formattedFileSize }})</p>
      </div>
    </div>
    <div class="flex items-center space-x-2">
      <a 
        :href="documentUrl" 
        target="_blank" 
        download
        class="inline-flex items-center px-3 py-1 border border-gray-300 text-xs rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        Скачать
      </a>
      <a 
        :href="documentUrl" 
        target="_blank" 
        class="inline-flex items-center px-3 py-1 border border-gray-300 text-xs rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        Просмотреть
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { supabase } from '@/api/supabase';

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
});

// Вычисляем URL документа
const documentUrl = computed(() => {
  if (props.document.publicUrl) {
    return props.document.publicUrl;
  }
  
  // Создаем URL для скачивания из Supabase
  try {
    // Проверяем наличие необходимых данных
    if (!props.document.file_path) {
      console.error('Отсутствует путь к файлу:', props.document);
      return '#';
    }
    
    // Используем getPublicUrl вместо signed URL для простоты и прямого доступа
    const { data } = supabase.storage
      .from('application_documents') // Именно application_documents, а не documents!
      .getPublicUrl(props.document.file_path);
    
    // Выводим URL в консоль для отладки
    console.log('Получен URL файла:', data?.publicUrl);
    
    return data?.publicUrl || '#';
  } catch (error) {
    console.error('Ошибка при получении URL файла:', error);
    return '#';
  }
});

// Форматированный размер файла
const formattedFileSize = computed(() => {
  const bytes = props.document.file_size;
  if (!bytes) return '0 Байт';
  
  const k = 1024;
  const sizes = ['Байт', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});
</script> 