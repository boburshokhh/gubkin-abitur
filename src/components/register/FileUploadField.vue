<template>
  <el-form-item :label="label" :required="required" :error="error">
    <div class="w-full">
      <el-upload
        class="w-full"
        drag
        :auto-upload="false"
        :limit="1"
        :accept="accept"
        :file-list="uploadFileList"
        :on-change="handleFileChange"
        :on-exceed="handleExceed"
        :on-remove="handleRemove"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          Перетащите файл сюда или <em>выберите на компьютере</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">{{ acceptDescription }}</div>
        </template>
      </el-upload>

      <el-card v-if="preview" class="mt-3" shadow="never">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 items-center gap-3">
            <el-image
              v-if="isImagePreview"
              :src="preview.url"
              fit="cover"
              class="h-14 w-14 rounded border"
              :preview-src-list="[preview.url]"
            />
            <el-icon v-else size="32"><Document /></el-icon>
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-gray-900">{{ preview.name }}</p>
              <p class="text-xs text-gray-500">{{ preview.type || 'Файл' }}</p>
            </div>
          </div>

          <div class="flex gap-2">
            <el-button size="small" @click="emit('view')">Открыть</el-button>
            <el-button size="small" type="danger" plain @click="emit('reset')">Удалить</el-button>
          </div>
        </div>
      </el-card>

      <div v-if="isUploading" class="mt-3">
        <el-progress :percentage="100" indeterminate :duration="2" />
      </div>
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

const uploadFileList = computed(() => {
  if (!props.preview) return [];
  return [{ name: props.preview.name, url: props.preview.url || undefined }];
});

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
</style>
