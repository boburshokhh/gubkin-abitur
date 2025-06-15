<template>
  <div class="space-y-4">
    <!-- Информация о требованиях к паспорту -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800">Требования к документу</h3>
          <div class="mt-2 text-sm text-blue-700">
            <ul class="list-disc list-inside space-y-1">
              <li>Сканированная цветная копия оригинала первой страницы паспорта и копия нотариально заверенного перевода на кириллицу и загружайте их поотдельности</li>
              <li>Для ID-карты: лицевая и обратная стороны — в одном PDF-файле.</li>
              <li>Абитуриент должен достичь 16-летнего возраста на момент подачи документов.</li>
              <li>Если отсутствует нотариально заверенный перевод, необходимо предоставить копию свидетельства о рождении, если оно оформлено на кириллице.</li>
            </ul>
          </div>
          
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <BaseInput
          v-model="modelValue.passport_series"
          label="Серия и номер паспорта"
          placeholder="AA 1234567"
          required
          :error="errors.passport_series"
        />
      </div>
      <div>
        <BaseInput
          v-model="modelValue.passport_issue_date"
          type="date"
          label="Дата выдачи"
          required
          :error="errors.passport_issue_date"
        />
      </div>
    </div>
    
    <div>
      <BaseInput
        v-model="modelValue.passport_issued_by"
        label="Кем выдан"
        placeholder="Укажите орган, выдавший паспорт"
        required
        :error="errors.passport_issued_by"
      />
    </div>
    <p class="text-sm text-gray-500 bg-yellow-100 p-2 rounded-lg">
      <span class="font-medium">Важно:</span>
      <span>
        Названия файла должен быть в формате Ф_И_О_паспорт.pdf Пример: "Иванов_Иван_Иванович_паспорт.pdf"
      </span>
    </p>
    <FileUploadField
      fieldName="passportScan"
      label="Скан или фото паспорта/ID-карты"
      :isUploading="fileUploading.passportScan"
      :preview="filePreview.passportScan"
      :error="errors.passportScan"
      @change="(file) => $emit('file-change', file, 'passportScan')"
      @view="() => $emit('file-view', 'passportScan')"
      @reset="() => $emit('file-reset', 'passportScan')"
    />
    
    <!-- Новое поле для нотариально заверенного перевода -->
    <div class="border-t pt-4">
      <!-- <p class="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg mb-4">
        <span class="font-medium text-blue-800">Дополнительно:</span>
        <span class="text-blue-700">
          Если ваш паспорт оформлен не на кириллице, загрузите нотариально заверенный перевод документа отдельным файлом.
        </span>
      </p> -->
      <FileUploadField
        fieldName="passportTranslation"
        label="Нотариально заверенный перевод паспорта (PDF)"
        :isUploading="fileUploading.passportTranslation"
        :preview="filePreview.passportTranslation"
        :error="errors.passportTranslation"
        accept=".pdf"
        @change="(file) => $emit('file-change', file, 'passportTranslation')"
        @view="() => $emit('file-view', 'passportTranslation')"
        @reset="() => $emit('file-reset', 'passportTranslation')"
      />
    </div>
  </div>
</template>

<script setup>
import { BaseInput } from '@/components/ui';
import FileUploadField from './FileUploadField.vue';
import { watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  fileUploading: {
    type: Object,
    default: () => ({})
  },
  filePreview: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'file-change', 'file-view', 'file-reset']);


</script> 