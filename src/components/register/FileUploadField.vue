<template>
  <el-form-item
    class="file-upload-field"
    :label="label"
    :required="required"
    :error="error"
  >
    <div class="w-full min-w-0">
      <el-upload
        class="w-full"
        drag
        :auto-upload="false"
        :limit="1"
        :accept="accept"
        :show-file-list="false"
        :on-change="handleFileChange"
        :on-exceed="handleExceed"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          <span class="hidden sm:inline">Перетащите файл сюда или </span>
          <em>{{ isMobile ? 'Нажмите, чтобы выбрать файл' : 'выберите на компьютере' }}</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">{{ acceptDescription }}</div>
        </template>
      </el-upload>

      <!-- Превью после выбора файла -->
      <el-card v-if="preview" class="mt-3" shadow="never">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 items-center gap-3">
            <img
              v-if="showImageThumbnail"
              :src="preview.url"
              :alt="preview.name"
              class="h-16 w-16 flex-shrink-0 rounded border bg-gray-50 object-contain"
              @error="imageLoadFailed = true"
            />
            <div
              v-else
              class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded border bg-red-50"
            >
              <el-icon size="28" color="#dc2626"><Document /></el-icon>
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-gray-900">{{ preview.name }}</p>
              <p class="text-xs text-gray-500">{{ isPdfPreview ? 'PDF документ' : (preview.type || 'Файл') }}</p>
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
import { computed, ref, watch } from 'vue';
import { Document, UploadFilled } from '@element-plus/icons-vue';
import { MAX_APPLICATION_FILE_MB, MAX_APPLICATION_SUBMIT_TOTAL_MB } from '@/config/upload-limits';

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

const imageLoadFailed = ref(false);

watch(
  () => props.preview?.url,
  () => {
    imageLoadFailed.value = false;
  }
);

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 639px)').matches;
});

const isImagePreview = computed(() => {
  if (!props.preview?.url) return false;
  if (props.preview.type?.startsWith('image/')) return true;
  if (String(props.preview.url).startsWith('data:image/')) return true;
  const name = props.preview.name?.toLowerCase() || '';
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].some((ext) => name.endsWith(ext));
});

const showImageThumbnail = computed(() => isImagePreview.value && !imageLoadFailed.value);

const isPdfPreview = computed(() => {
  return Boolean(
    props.preview?.type === 'application/pdf'
    || props.preview?.name?.toLowerCase().endsWith('.pdf')
  );
});

const acceptDescription = computed(() => {
  const perFile = `до ${MAX_APPLICATION_FILE_MB} МБ`;
  const total = `суммарно до ${MAX_APPLICATION_SUBMIT_TOTAL_MB} МБ`;
  if (props.accept === '.pdf') return `Только PDF, ${perFile} (${total})`;
  if (props.accept === 'image/*') return `JPG или PNG, ${perFile} (${total})`;
  return `JPG, PNG или PDF, ${perFile} (${total})`;
});

function handleFileChange(uploadFile) {
  const file = uploadFile?.raw ?? uploadFile;
  if (!(file instanceof Blob)) return;
  emit('change', file);
}

function handleExceed(files) {
  const uploadFile = files[0];
  if (!uploadFile) return;
  const file = uploadFile.raw ?? uploadFile;
  if (file instanceof Blob) emit('change', file);
}
</script>

<style scoped>
.file-upload-field {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 18px;
}

.file-upload-field :deep(.el-form-item__label) {
  justify-content: flex-start;
  align-self: stretch;
  width: 100% !important;
  max-width: 100%;
  height: auto;
  margin-bottom: 8px;
  padding: 0;
  color: #374151;
  font-weight: 500;
  line-height: 1.35;
  white-space: normal;
  word-break: break-word;
}

.file-upload-field :deep(.el-form-item__content) {
  display: block;
  width: 100%;
  max-width: 100%;
  margin-left: 0 !important;
}

.file-upload-field :deep(.el-upload),
.file-upload-field :deep(.el-upload-dragger) {
  width: 100%;
}

.file-upload-field :deep(.el-upload__text) {
  line-height: 1.4;
  word-break: break-word;
}

.file-upload-field :deep(.el-upload__tip) {
  line-height: 1.4;
  word-break: break-word;
  white-space: normal;
}

@media (max-width: 639px) {
  .file-upload-field :deep(.el-upload-dragger) {
    padding: 16px 12px;
  }

  .file-upload-field :deep(.el-icon--upload) {
    font-size: 36px;
    margin-bottom: 8px;
  }
}
</style>
