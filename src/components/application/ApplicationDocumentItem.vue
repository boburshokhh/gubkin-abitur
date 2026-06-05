<template>
  <el-card shadow="never" class="application-document-item">
    <div class="application-document-item__content">
      <el-space>
        <el-icon size="28" color="var(--el-text-color-secondary)">
          <Document />
        </el-icon>
        <div>
          <el-text tag="h4" class="application-document-item__title">
            {{ document.document_type?.name || 'Документ' }}
          </el-text>
          <el-text type="info" size="small">
            {{ document.file_name }} ({{ formattedFileSize }})
          </el-text>
        </div>
      </el-space>

      <el-space wrap>
        <el-button
          type="info"
          plain
          size="small"
          :icon="Download"
          tag="a"
          :href="documentUrl"
          target="_blank"
          download
        >
          Скачать
        </el-button>
        <el-button
          type="primary"
          plain
          size="small"
          :icon="View"
          tag="a"
          :href="documentUrl"
          target="_blank"
        >
          Просмотреть
        </el-button>
      </el-space>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue';
import { appApi } from '@/api/app-api';
import { Document, Download, View } from '@element-plus/icons-vue';

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
  
  // Создаем URL для скачивания из API
  try {
    // Проверяем наличие необходимых данных
    if (!props.document.file_path) {
      console.error('Отсутствует путь к файлу:', props.document);
      return '#';
    }
    
    // Используем getPublicUrl вместо signed URL для простоты и прямого доступа
    const { data } = appApi.storage
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

<style scoped>
.application-document-item__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.application-document-item__title {
  display: block;
  margin: 0;
  font-weight: 600;
}

@media (max-width: 640px) {
  .application-document-item__content {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>