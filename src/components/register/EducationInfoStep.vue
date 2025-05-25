<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Уровень образования</label>
      <select 
        v-model="modelValue.educationLevel" 
        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
      >
        <option value="">Выберите уровень образования</option>
        <option value="high-school">Среднее общее (11 классов)</option>
        <option value="college">Среднее профессиональное (колледж, техникум)</option>
        <option value="bachelor">Высшее - бакалавриат</option>
        <option value="master">Высшее - магистратура</option>
      </select>
      <p v-if="errors.educationLevel" class="mt-1 text-sm text-red-600">{{ errors.educationLevel }}</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <BaseInput
          v-model="modelValue.educationInstitution"
          label="Учебное заведение"
          placeholder="Название школы/колледжа/университета"
          required
          :error="errors.educationInstitution"
        />
      </div>
      <div>
        <BaseInput
          v-model="modelValue.educationGraduationYear"
          type="number"
          label="Год окончания"
          placeholder="2023"
          required
          :error="errors.educationGraduationYear"
        />
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <BaseInput
          v-model="modelValue.documentNumber"
          label="Номер документа об образовании"
          placeholder="Номер аттестата/диплома"
          required
          :error="errors.documentNumber"
        />
      </div>
      <div>
        <BaseInput
          v-model="modelValue.documentDate"
          type="date"
          label="Дата выдачи документа"
          required
          :error="errors.documentDate"
        />
      </div>
    </div>
    
    <FileUploadField
      fieldName="educationScan"
      label="Скан или фото документа об образовании"
      :isUploading="fileUploading.educationScan"
      :preview="filePreview.educationScan"
      :error="errors.educationScan"
      @change="(file) => $emit('file-change', file, 'educationScan')"
      @view="() => $emit('file-view', 'educationScan')"
      @reset="() => $emit('file-reset', 'educationScan')"
    />
  </div>
</template>

<script setup>
import { BaseInput } from '@/components/ui';
import FileUploadField from './FileUploadField.vue';

defineProps({
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

defineEmits(['update:modelValue', 'file-change', 'file-view', 'file-reset']);
</script> 