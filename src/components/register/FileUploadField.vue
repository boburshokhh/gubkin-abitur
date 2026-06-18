<template>
  <el-form-item :label="label" :required="required" :error="error">
    <div class="w-full">
      <el-upload
        class="w-full"
        drag
        :auto-upload="false"
        :limit="1"
        :accept="accept"
        :show-file-list="false"
        :on-change="handleFileChange"
        :on-exceed="handleExceed"
        :on-remove="handleRemove"
      >
        <div
          v-if="preview && !isUploading"
          class="file-preview flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          @click.stop
        >
          <div class="flex min-w-0 items-center gap-3">
            <el-image
              v-if="isImagePreview"
              :src="preview.url"
              fit="cover"
              class="h-14 w-14 shrink-0 rounded border"
              :preview-src-list="[preview.url]"
            />
            <el-icon v-else size="32" class="shrink-0"><Document /></el-icon>
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-gray-900">{{ preview.name }}</p>
              <p class="text-xs text-gray-500">{{ preview.type || 'Файл' }}</p>
            </div>
          </div>

          <div class="flex shrink-0 gap-2">
            <el-button size="small" @click.stop="emit('view')">Открыть</el-button>
            <el-button size="small" type="danger" plain @click.stop="emit('reset')">Удалить</el-button>
          </div>
        </div>

        <div v-else-if="isUploading" class="uploading-state w-full px-2" @click.stop>
          <el-icon size="32" class="mb-2 text-gray-400"><Document /></el-icon>
          <p class="mb-3 truncate text-sm font-medium text-gray-700">
            {{ preview?.name || 'Загрузка…' }}
          </p>
          <el-progress :percentage="100" indeterminate :duration="2" />
        </div>

        <template v-else>
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            Перетащите файл сюда или <em>выберите на компьютере</em>
          </div>
        </template>

        <template #tip>
          <div class="el-upload__tip">{{ acceptDescription }}</div>
        </template>
      </el-upload>
    </div>
  </el-form-item>
</template>

<script setup>
import { computed } from 'vue';
import { Document, UploadFilled } from '@element-plus/icons-vue';

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
  },
  accept: {
    type: String,
    default: 'image/*,.pdf'
  },
  required: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['change', 'view', 'reset']);

const isImagePreview = computed(() => {
  return Boolean(props.preview?.url && props.preview?.type?.includes('image'));
});

const acceptDescription = computed(() => {
  if (props.accept === '.pdf') return 'Только PDF, размер до 10MB';
  if (props.accept === 'image/*') return 'JPG или PNG, размер до 10MB';
  return 'JPG, PNG или PDF, размер до 10MB';
});

function handleFileChange(uploadFile) {
  const file = uploadFile.raw;
  if (!file) return;
  emit('change', file);
}

function handleExceed(files) {
  const [file] = files;
  if (file) emit('change', file);
}

function handleRemove() {
  emit('reset');
}
</script>

<style scoped>
:deep(.el-form-item) {
  display: block;
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

:deep(.el-form-item__content) {
  display: block;
  width: 100%;
}

:deep(.el-upload),
:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-upload-dragger) {
  display: flex;
  min-height: 120px;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.file-preview,
.uploading-state {
  text-align: left;
}

.uploading-state {
  text-align: center;
}
</style>
