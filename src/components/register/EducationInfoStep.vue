<template>
  <div class="space-y-6">
    <!-- Информация о требованиях к документу об образовании -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800">Обязательные документы для загрузки</h3>
          <div class="mt-2 text-sm text-blue-700">
            <ul class="list-disc list-inside space-y-1">
              <li>Фотография 3х4 см (цветное фото, на белом фоне, протокольный вид)</li>
              <li>Копия документа об образовании (аттестат о среднем образовании, диплом)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Форма данных об образовании -->
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1 required-field">Уровень образования</label>
        <select 
          v-model="modelValue.education_level" 
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          :class="{ 'border-red-500': errors.education_level }"
          required
        >
          <option value="">Выберите уровень образования</option>
          <option value="high-school">Среднее общее (11 классов)</option>
          <option value="college">Среднее профессиональное (колледж, техникум, лицей)</option>
          <option value="bachelor">Высшее - бакалавриат</option>
        </select>
        <p v-if="errors.education_level" class="mt-1 text-sm text-red-600">{{ errors.education_level }}</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <BaseInput
            v-model="modelValue.education_institution"
            label="Учебное заведение"
            placeholder="Полное название школы/колледжа/лицея"
            required
            :error="errors.education_institution"
            :class="{ 'border-red-500': errors.education_institution }"
          />
        </div>
        <div>
          <BaseInput
            v-model="modelValue.education_graduation_year"
            type="number"
            label="Год окончания"
            placeholder="2023"
            required
            :error="errors.education_graduation_year"
            :class="{ 'border-red-500': errors.education_graduation_year }"
          />
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <BaseInput
            v-model="modelValue.education_document_number"
            label="Номер документа об образовании"
            placeholder="Номер аттестата/диплома"
            required
            :error="errors.education_document_number"
            :class="{ 'border-red-500': errors.education_document_number }"
          />
        </div>
        <div>
          <BaseInput
            v-model="modelValue.education_document_date"
            type="date"
            label="Дата выдачи документа"
            required
            :error="errors.education_document_date"
            :class="{ 'border-red-500': errors.education_document_date }"
          />
        </div>
      </div>
    </div>

    <!-- Обязательные загрузки документов -->
    <div class="space-y-6 border-t pt-6">
      <h3 class="text-lg font-medium text-gray-900">Загрузка документов</h3>
      
      <!-- Фотография 3х4 -->
      <div>
        <p class="text-sm text-gray-500 bg-yellow-100 p-2 rounded-lg">
          <span class="font-medium">Важно:</span>
          <span>
            Названия файла должен быть в формате Ф_И_О_фото.jpg (png,pdf) Пример: "Иванов_Иван_Иванович_фото.jpg"
          </span>
        </p>
        <FileUploadField
          fieldName="photoFile"
          label="Фотография 3х4 см (обязательно)"
          :isUploading="fileUploading.photoFile"
          :preview="filePreview.photoFile"
          :error="errors.photoFile"
          @change="(file) => $emit('file-change', file, 'photoFile')"
          @view="() => $emit('file-view', 'photoFile')"
          @reset="() => $emit('file-reset', 'photoFile')"
        />
        <p class="mt-1 text-xs text-gray-500">Цветное фото, на белом фоне, протокольный вид. Форматы: JPG, PNG. Размер до 10MB.</p>
      </div>

      <!-- Документ об образовании -->
      <div>
        <p class="text-sm text-gray-500 bg-yellow-100 p-2 rounded-lg">
          <span class="font-medium">Важно:</span>
          <span>
            Названия файла должен быть в формате Ф_И_О_диплом.pdf Пример: "Иванов_Иван_Иванович_диплом.pdf"
          </span>
        </p>
        <FileUploadField
          fieldName="educationScan"
          label="Скан или фото документа об образовании (обязательно)"
          :isUploading="fileUploading.educationScan"
          :preview="filePreview.educationScan"
          :error="errors.educationScan"
          @change="(file) => $emit('file-change', file, 'educationScan')"
          @view="() => $emit('file-view', 'educationScan')"
          @reset="() => $emit('file-reset', 'educationScan')"
        />
        <p class="mt-1 text-xs text-gray-500">Четкий скан или фото аттестата/диплома. Форматы: JPG, PNG, PDF. Размер до 10MB.</p>
      </div>
    </div>

    <!-- Информация для пользователя -->
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">Важно!</h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p>Для перехода к следующему шагу необходимо загрузить ОБА обязательных документа: фотографию и документ об образовании. Без этих документов вы не сможете продолжить подачу заявления.</p>
          </div>
        </div>
      </div>
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

// // Отладка: отслеживаем изменения данных об образовании
// watch(() => props.modelValue.education_level, (newValue) => {
//   console.log('EducationInfoStep: education_level изменился на', newValue);
// });

// watch(() => props.modelValue.education_institution, (newValue) => {
//   console.log('EducationInfoStep: education_institution изменился на', newValue);
// });

// watch(() => props.modelValue.education_graduation_year, (newValue) => {
//   console.log('EducationInfoStep: education_graduation_year изменился на', newValue);
// });

// watch(() => props.modelValue.education_document_number, (newValue) => {
//   console.log('EducationInfoStep: education_document_number изменился на', newValue);
// });

// watch(() => props.modelValue.education_document_date, (newValue) => {
//   console.log('EducationInfoStep: education_document_date изменился на', newValue);
// });
</script>

<style scoped>
.required-field::after {
  content: " *";
  color: #ef4444;
  font-weight: bold;
}
</style> 