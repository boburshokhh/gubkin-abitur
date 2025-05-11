<template>
  <div v-if="show" class="fixed inset-0 overflow-y-auto z-[100]">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>
      
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      
      <div 
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        <div class="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900" id="modal-headline">
            Заявка №{{ application?.id.substring(0, 8) }}
          </h3>
          <button 
            @click="close" 
            type="button" 
            class="text-gray-400 hover:text-gray-500"
          >
            <span class="sr-only">Закрыть</span>
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <div class="mb-4">
                <h4 class="font-medium text-gray-700 mb-2">Информация о заявителе</h4>
                <div class="text-sm text-gray-600">
                  <p><span class="font-medium">ФИО:</span> {{ getUserFullName(application?.user) }}</p>
                  <p><span class="font-medium">Email:</span> {{ application?.user?.email || 'Не указан' }}</p>
                  <p><span class="font-medium">Телефон:</span> {{ application?.user?.phone || 'Не указан' }}</p>
                </div>
              </div>
              
              <div class="mb-4">
                <h4 class="font-medium text-gray-700 mb-2">Информация о заявке</h4>
                <div class="text-sm text-gray-600">
                  <p><span class="font-medium">Направление:</span> {{ application?.direction?.name || 'Не указано' }}</p>
                  <p><span class="font-medium">Статус:</span> 
                    <span 
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getStatusClass(application?.status_id)"
                    >
                      {{ getStatusName(application?.status_id) }}
                    </span>
                  </p>
                  <p><span class="font-medium">Дата подачи:</span> {{ formatDate(application?.created_at) }}</p>
                </div>
              </div>
              
              <!-- Добавляем секцию для файлов -->
              <div class="mb-4" v-if="application?.documents?.length">
                <h4 class="font-medium text-gray-700 mb-2">Загруженные документы</h4>
                <div class="border rounded-md divide-y">
                  <div v-for="(doc, index) in application.documents" :key="index" class="px-4 py-3 flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                      <DocumentTextIcon class="h-5 w-5 text-gray-500" />
                      <div>
                        <span class="text-sm font-medium text-gray-700">{{ doc.document_type?.name || doc.document_type_name || `Документ ${index + 1}` }}</span>
                        <div class="text-xs text-gray-500 mt-1">
                          {{ doc.file_name || 'Без названия' }} ({{ formatFileSize(doc.file_size) }})
                          <div class="mt-0.5 text-xs text-gray-400">ID: {{ doc.id.substring(0, 8) }}</div>
                        </div>
                      </div>
                    </div>
                    <div class="flex space-x-2">
                      <button 
                        @click="viewDocument(doc)" 
                        class="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                        title="Просмотреть документ"
                      >
                        <EyeIcon class="h-4 w-4" />
                      </button>
                      <button 
                        @click="downloadDocument(doc)" 
                        class="text-xs px-2 py-1 rounded bg-gray-50 text-gray-600 hover:bg-gray-100"
                        title="Скачать документ"
                      >
                        <ArrowDownTrayIcon class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div class="mt-2 text-xs text-gray-500">
                  <p>Всего документов: {{ application.documents.length }}</p>
                </div>
              </div>
              <div class="mb-4" v-else>
                <h4 class="font-medium text-gray-700 mb-2">Загруженные документы</h4>
                <p class="text-sm text-gray-500 italic">Нет загруженных документов</p>
              </div>
              
              <div class="mt-6">
                <h4 class="font-medium text-gray-700 mb-2">Обновление статуса</h4>
                <div class="space-y-4">
                  <div>
                    <label for="status" class="block text-sm font-medium text-gray-700">Новый статус</label>
                    <select 
                      id="status" 
                      v-model="statusId" 
                      class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    >
                      <option :value="null" disabled>Выберите статус</option>
                      <option 
                        v-for="status in statuses" 
                        :key="status.id" 
                        :value="status.id"
                      >
                        {{ status.name }}
                      </option>
                    </select>
                  </div>
                  
                  <div>
                    <label for="comment" class="block text-sm font-medium text-gray-700">Комментарий</label>
                    <textarea 
                      id="comment" 
                      v-model="comment" 
                      rows="3" 
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Добавьте комментарий к изменению статуса..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button 
            @click="updateStatus"
            type="button"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
            :disabled="isUpdating || !statusId"
          >
            <svg v-if="isUpdating" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isUpdating ? 'Обновление...' : 'Обновить статус' }}
          </button>
          <button 
            @click="close"
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Модальное окно для просмотра документа -->
  <div v-if="showDocumentModal" class="fixed inset-0 overflow-y-auto z-[200]">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>
      
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      
      <div 
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
        role="dialog"
        aria-modal="true"
      >
        <div class="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            {{ selectedDocument?.name || 'Просмотр документа' }}
          </h3>
          <button 
            @click="closeDocumentModal" 
            type="button" 
            class="text-gray-400 hover:text-gray-500"
          >
            <span class="sr-only">Закрыть</span>
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="bg-white p-6 max-h-[80vh] overflow-auto">
          <div v-if="documentLoading" class="flex justify-center items-center h-64">
            <svg class="animate-spin h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          
          <div v-else-if="documentError" class="text-center py-10">
            <XCircleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки документа</h3>
            <p class="text-sm text-gray-500">{{ documentError }}</p>
          </div>
          
          <div v-else>
            <!-- Отображение документа в зависимости от типа -->
            <div v-if="isPdf" class="h-[70vh]">
              <iframe :src="documentUrl" class="w-full h-full" frameborder="0"></iframe>
            </div>
            
            <div v-else-if="isImage" class="flex justify-center">
              <img :src="documentUrl" class="max-w-full max-h-[70vh] object-contain" alt="Документ" />
            </div>
            
            <div v-else class="text-center py-10">
              <DocumentTextIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">Предпросмотр недоступен</h3>
              <p class="text-sm text-gray-500 mb-4">Документ данного формата нельзя просмотреть в браузере</p>
              <button 
                @click="downloadDocument(selectedDocument)" 
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
                Скачать документ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { supabase, documents } from '@/api/supabase';
import { useToast } from 'vue-toastification';
import { DocumentTextIcon, EyeIcon, ArrowDownTrayIcon, XCircleIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  application: {
    type: Object,
    default: null
  },
  statuses: {
    type: Array,
    required: true
  },
  isUpdating: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'update-status']);
const toast = useToast();

// Локальное состояние
const statusId = ref(props.application?.status_id || null);
const comment = ref(props.application?.admin_comment || '');

// Состояние для просмотра документов
const showDocumentModal = ref(false);
const selectedDocument = ref(null);
const documentUrl = ref('');
const documentLoading = ref(false);
const documentError = ref(null);

// Проверка типа документа
const isPdf = computed(() => {
  return selectedDocument.value?.type === 'application/pdf' || 
         selectedDocument.value?.name?.toLowerCase().endsWith('.pdf');
});

const isImage = computed(() => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  return imageTypes.includes(selectedDocument.value?.type) || 
         /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(selectedDocument.value?.name || '');
});

// Обновляем локальное состояние при изменении заявки
watch(() => props.application, (newApplication) => {
  if (newApplication) {
    statusId.value = newApplication.status_id;
    comment.value = newApplication.admin_comment || '';
  }
}, { deep: true });

// Закрытие модального окна
function close() {
  emit('close');
}

// Обновление статуса заявки
function updateStatus() {
  if (!statusId.value) return;
  
  emit('update-status', {
    statusId: statusId.value,
    comment: comment.value
  });
}

// Просмотр документа
async function viewDocument(documentItem) {
  selectedDocument.value = documentItem;
  showDocumentModal.value = true;
  documentLoading.value = true;
  documentError.value = null;
  documentUrl.value = '';
  
  try {
    // Получаем URL-адрес для доступа к файлу
    const { data, error } = await documents.getSignedUrl(documentItem.id);
    
    if (error) {
      console.error('Ошибка при получении URL для просмотра:', error);
      documentError.value = `Ошибка: ${error.message || 'Не удалось получить доступ к документу'}`;
      return;
    }
    
    if (!data || !data.signedUrl) {
      console.error('URL для просмотра отсутствует в ответе');
      documentError.value = 'Не удалось получить URL для просмотра документа';
      return;
    }
    
    console.log('Получен URL для просмотра:', data.signedUrl);
    documentUrl.value = data.signedUrl;
  } catch (err) {
    console.error('Ошибка при загрузке документа:', err);
    documentError.value = `Ошибка при загрузке: ${err.message || 'Неизвестная ошибка'}`;
  } finally {
    documentLoading.value = false;
  }
}

// Закрытие модального окна просмотра документа
function closeDocumentModal() {
  showDocumentModal.value = false;
  selectedDocument.value = null;
  documentUrl.value = '';
}

// Скачивание документа
async function downloadDocument(documentItem) {
  try {
    // Получаем URL для скачивания с флагом download=true
    const { data, error } = await documents.getSignedUrl(documentItem.id, { download: true });
    
    if (error) {
      console.error('Ошибка при получении URL для скачивания:', error);
      toast.error(`Ошибка: ${error.message || 'Не удалось получить доступ к документу'}`);
      return;
    }
    
    if (!data || !data.signedUrl) {
      console.error('URL для скачивания отсутствует в ответе');
      toast.error('Не удалось получить URL для скачивания документа');
      return;
    }
    
    console.log('Получен URL для скачивания:', data.signedUrl);
    
    // Создаем ссылку для скачивания и имитируем клик
    const downloadLink = document.createElement('a');
    downloadLink.href = data.signedUrl;
    downloadLink.download = documentItem.file_name || `document-${Date.now()}${getFileExtension(documentItem)}`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (err) {
    console.error('Ошибка при скачивании документа:', err);
    toast.error(`Ошибка при скачивании: ${err.message || 'Неизвестная ошибка'}`);
  }
}

// Определение расширения файла на основе типа
function getFileExtension(documentItem) {
  if (documentItem.name && documentItem.name.includes('.')) {
    const parts = documentItem.name.split('.');
    return `.${parts[parts.length - 1]}`;
  }
  
  const mimeToExt = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx'
  };
  
  return mimeToExt[documentItem.type] || '';
}

// Получение полного имени пользователя
function getUserFullName(user) {
  if (!user) return 'Неизвестный пользователь';
  return `${user.last_name || ''} ${user.first_name || ''} ${user.middle_name || ''}`.trim();
}

// Форматирование даты
function formatDate(dateString) {
  if (!dateString) return 'Не указана';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}

// Получение имени статуса по ID
function getStatusName(statusId) {
  const status = props.statuses.find(s => s.id === statusId);
  return status ? status.name : 'Неизвестный статус';
}

// Получение класса для отображения статуса
function getStatusClass(statusId) {
  const status = props.statuses.find(s => s.id === statusId);
  
  if (!status) return 'bg-gray-100 text-gray-800';
  
  switch (status.name) {
    case 'Подана':
      return 'bg-blue-100 text-blue-800';
    case 'Принята':
      return 'bg-green-100 text-green-800';
    case 'Отклонена':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Получение текста для формы обучения
function getStudyFormText(form) {
  const formMap = {
    'full-time': 'Очная',
    'part-time': 'Заочная',
    'distance': 'Дистанционная'
  };
  return formMap[form] || 'Не указана';
}

// Получение текста для типа финансирования
function getFundingFormText(form) {
  const formMap = {
    'budget': 'Бюджет',
    'contract': 'Контракт'
  };
  return formMap[form] || 'Не указан';
}

// Загрузка нового документа
async function uploadNewDocument(file, documentTypeId) {
  if (!props.application?.id || !file) return;

  try {
    documentLoading.value = true;
    toast.info('Загрузка документа...');
    
    const { data, error } = await documents.upload(
      props.application.id,
      documentTypeId,
      file
    );
    
    if (error) {
      console.error('Ошибка при загрузке документа:', error);
      toast.error(`Не удалось загрузить документ: ${error.message || 'Неизвестная ошибка'}`);
      return null;
    }
    
    toast.success('Документ успешно загружен');
    
    // Обновляем список документов в заявке
    if (props.application.documents) {
      props.application.documents.push(data);
    }
    
    return data;
  } catch (err) {
    console.error('Ошибка при загрузке документа:', err);
    toast.error(`Ошибка при загрузке: ${err.message || 'Неизвестная ошибка'}`);
    return null;
  } finally {
    documentLoading.value = false;
  }
}

// Форматирование размера файла
function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '0 Б';
  
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  
  // Определяем подходящую единицу измерения
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  // Форматируем размер с одним знаком после запятой
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
</script>

<style scoped>
/* Добавляем стили для модального окна */
.fixed {
  position: fixed;
}

/* Убедимся, что модальное окно имеет высокий z-index, чтобы быть поверх Header */
.z-\[100\] {
  z-index: 100 !important; /* Используем !important для перекрытия других стилей */
}

/* Модальное окно для просмотра документов должно быть выше основного модального окна */
.z-\[200\] {
  z-index: 200 !important;
}
</style> 