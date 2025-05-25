<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <BaseInput
          v-model="modelValue.passportSeries"
          label="Серия и номер паспорта"
          placeholder="AA 1234567"
          required
          :error="errors.passportSeries"
        />
      </div>
      <div>
        <BaseInput
          v-model="modelValue.passportIssueDate"
          type="date"
          label="Дата выдачи"
          required
          :error="errors.passportIssueDate"
        />
      </div>
    </div>
    
    <div>
      <BaseInput
        v-model="modelValue.passportIssuedBy"
        label="Кем выдан"
        placeholder="Укажите орган, выдавший паспорт"
        required
        :error="errors.passportIssuedBy"
      />
    </div>
    
    <FileUploadField
      fieldName="passportScan"
      label="Скан или фото паспорта (первая страница)"
      :isUploading="fileUploading.passportScan"
      :preview="filePreview.passportScan"
      :error="errors.passportScan"
      @change="(file) => $emit('file-change', file, 'passportScan')"
      @view="() => $emit('file-view', 'passportScan')"
      @reset="() => $emit('file-reset', 'passportScan')"
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