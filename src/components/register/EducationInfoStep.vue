<template>
  <el-form label-position="top" class="register-step-form">
    <el-alert type="info" show-icon :closable="false">
      <template #title>Обязательные документы для загрузки</template>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li>Фотография 3х4 см: цветное фото на белом фоне.</li>
        <li>Копия документа об образовании: аттестат, диплом или аналогичный документ.</li>
      </ul>
    </el-alert>

    <div class="space-y-4">
      <el-form-item label="Уровень образования" required :error="errors.education_level">
        <el-select v-model="modelValue.education_level" class="w-full" placeholder="Выберите уровень образования">
          <el-option value="high-school" label="Среднее общее (11 классов)" />
          <el-option value="college" label="Среднее профессиональное (колледж, техникум, лицей)" />
          <el-option value="bachelor" label="Высшее - бакалавриат" />
        </el-select>
      </el-form-item>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <el-form-item label="Учебное заведение" required :error="errors.education_institution">
          <el-input
            v-model="modelValue.education_institution"
            placeholder="Полное название школы/колледжа/лицея"
            clearable
          />
        </el-form-item>

        <el-form-item label="Год окончания" required :error="errors.education_graduation_year">
          <el-input-number
            v-model="modelValue.education_graduation_year"
            class="w-full"
            :min="1950"
            :max="new Date().getFullYear() + 1"
            controls-position="right"
          />
        </el-form-item>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <el-form-item label="Номер документа об образовании" required :error="errors.education_document_number">
          <el-input
            v-model="modelValue.education_document_number"
            placeholder="Номер аттестата/диплома"
            clearable
          />
        </el-form-item>

        <el-form-item label="Дата выдачи документа" required :error="errors.education_document_date">
          <el-date-picker
            v-model="modelValue.education_document_date"
            class="w-full"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="Выберите дату"
          />
        </el-form-item>
      </div>
    </div>

    <el-divider content-position="left">Загрузка документов</el-divider>

    <div class="space-y-6">
      <div class="space-y-2">
        <el-alert
          title="Название файла: Ф_И_О_фото.jpg или .png, например Иванов_Иван_Иванович_фото.jpg"
          type="warning"
          show-icon
          :closable="false"
        />
        <FileUploadField
          fieldName="photoFile"
          label="Фотография 3х4 см"
          :isUploading="fileUploading.photoFile"
          :preview="filePreview.photoFile"
          :error="errors.photoFile"
          accept="image/*"
          required
          @change="(file) => emit('file-change', file, 'photoFile')"
          @view="() => emit('file-view', 'photoFile')"
          @reset="() => emit('file-reset', 'photoFile')"
        />
      </div>

      <div class="space-y-2">
        <el-alert
          title="Название файла: Ф_И_О_диплом.pdf, например Иванов_Иван_Иванович_диплом.pdf"
          type="warning"
          show-icon
          :closable="false"
        />
        <FileUploadField
          fieldName="educationScan"
          label="Скан документа об образовании"
          :isUploading="fileUploading.educationScan"
          :preview="filePreview.educationScan"
          :error="errors.educationScan"
          accept=".pdf"
          required
          @change="(file) => emit('file-change', file, 'educationScan')"
          @view="() => emit('file-view', 'educationScan')"
          @reset="() => emit('file-reset', 'educationScan')"
        />
      </div>
    </div>

    <el-alert
      title="Без обязательных документов перейти к следующему шагу нельзя."
      type="warning"
      show-icon
      :closable="false"
    />
  </el-form>
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

<style scoped>
.register-step-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-form-item__label) {
  justify-content: flex-start;
  height: auto;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 500;
  line-height: 1.35;
}

:deep(.el-form-item__content),
:deep(.el-input),
:deep(.el-select),
:deep(.el-input-number),
:deep(.el-date-editor.el-input) {
  width: 100%;
}
</style>
