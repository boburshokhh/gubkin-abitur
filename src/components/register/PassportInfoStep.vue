<template>
  <div class="space-y-5">
    <el-alert type="info" show-icon :closable="false">
      <template #title>Требования к документу</template>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li>Сканированная цветная копия оригинала первой страницы паспорта и нотариально заверенный перевод загружаются отдельно.</li>
        <li>Для ID-карты: лицевая и обратная стороны в одном PDF-файле.</li>
        <li>Абитуриент должен достичь 16-летнего возраста на момент подачи документов.</li>
      </ul>
    </el-alert>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <el-form-item label="Серия и номер паспорта" required :error="errors.passport_series">
        <el-input
          v-model="modelValue.passport_series"
          :placeholder="isForeignResidence ? 'A12345678' : 'AA 1234567'"
          clearable
          @input="() => emit('passport-format')"
        />
      </el-form-item>

      <el-form-item label="Дата выдачи" required :error="errors.passport_issue_date">
        <el-date-picker
          v-model="modelValue.passport_issue_date"
          class="w-full"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="Выберите дату"
        />
      </el-form-item>
    </div>

    <el-form-item label="Кем выдан" required :error="errors.passport_issued_by">
      <el-input
        v-model="modelValue.passport_issued_by"
        placeholder="Укажите орган, выдавший паспорт"
        clearable
      />
    </el-form-item>

    <el-alert
      title="Название файла: Ф_И_О_паспорт.pdf, например Иванов_Иван_Иванович_паспорт.pdf"
      type="warning"
      show-icon
      :closable="false"
    />

    <FileUploadField
      fieldName="passportScan"
      label="Скан или фото паспорта/ID-карты"
      :isUploading="fileUploading.passportScan"
      :preview="filePreview.passportScan"
      :error="errors.passportScan"
      required
      accept=".pdf"
      @change="(file) => emit('file-change', file, 'passportScan')"
      @view="() => emit('file-view', 'passportScan')"
      @reset="() => emit('file-reset', 'passportScan')"
    />

    <FileUploadField
      fieldName="passportTranslation"
      label="Нотариально заверенный перевод паспорта"
      :isUploading="fileUploading.passportTranslation"
      :preview="filePreview.passportTranslation"
      :error="errors.passportTranslation"
      required
      accept=".pdf"
      @change="(file) => emit('file-change', file, 'passportTranslation')"
      @view="() => emit('file-view', 'passportTranslation')"
      @reset="() => emit('file-reset', 'passportTranslation')"
    />
  </div>
</template>

<script setup>
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
  isForeignResidence: {
    type: Boolean,
    default: false
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

const emit = defineEmits(['update:modelValue', 'passport-format', 'file-change', 'file-view', 'file-reset']);
</script>
