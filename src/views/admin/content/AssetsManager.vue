<template>
  <div class="assets-manager">
    <div class="manager-header">
      <h3>Медиатека</h3>
      <el-upload
        :before-upload="handleUpload"
        :show-file-list="false"
        accept="image/*,video/mp4,video/webm"
        :disabled="isUploading"
      >
        <el-button type="primary" :loading="isUploading">
          {{ isUploading ? 'Загружается...' : '+ Загрузить файл' }}
        </el-button>
      </el-upload>
    </div>

    <el-skeleton v-if="isLoading" :rows="4" animated />
    <el-empty v-else-if="!assets.length" description="Медиафайлы не найдены. Загрузите изображения или видео." />

    <div v-else class="assets-grid">
      <div v-for="asset in assets" :key="asset.id" class="asset-card">
        <div class="asset-preview">
          <img
            v-if="asset.mime_type?.startsWith('image/')"
            :src="asset.url"
            :alt="asset.alt_text || asset.original_name"
            loading="lazy"
          />
          <div v-else class="asset-file-icon">
            <span>{{ asset.mime_type?.split('/')[1]?.toUpperCase() || 'FILE' }}</span>
          </div>
        </div>
        <div class="asset-info">
          <el-text size="small" truncated>{{ asset.original_name }}</el-text>
          <div class="asset-actions">
            <el-button
              type="primary"
              size="small"
              text
              @click="copyUrl(asset.url)"
            >
              Копировать URL
            </el-button>
            <el-popconfirm title="Удалить файл?" @confirm="deleteAsset(asset.id)">
              <template #reference>
                <el-button type="danger" size="small" text>Удалить</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </div>
    </div>

    <div v-if="total > assets.length" class="load-more">
      <el-button @click="loadMore">Загрузить ещё</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminListAssets, adminUploadAsset, adminDeleteAsset } from '@/api/cms.js'

const assets = ref([])
const isLoading = ref(false)
const isUploading = ref(false)
const total = ref(0)
const offset = ref(0)
const limit = 20

async function fetchAssets(reset = true) {
  if (reset) { assets.value = []; offset.value = 0 }
  isLoading.value = true
  try {
    const res = await adminListAssets({ limit, offset: offset.value })
    assets.value = reset ? (res.data || []) : [...assets.value, ...(res.data || [])]
    total.value = res.total || 0
    offset.value += limit
  } catch (err) {
    ElMessage.error('Ошибка загрузки: ' + err.message)
  } finally {
    isLoading.value = false
  }
}

async function handleUpload(file) {
  isUploading.value = true
  try {
    const asset = await adminUploadAsset(file, '')
    assets.value.unshift(asset)
    total.value++
    ElMessage.success('Файл загружен')
  } catch (err) {
    ElMessage.error('Ошибка загрузки: ' + err.message)
  } finally {
    isUploading.value = false
  }
  return false
}

async function deleteAsset(id) {
  try {
    await adminDeleteAsset(id)
    assets.value = assets.value.filter(a => a.id !== id)
    total.value--
    ElMessage.success('Удалено')
  } catch (err) {
    ElMessage.error('Ошибка: ' + err.message)
  }
}

function copyUrl(url) {
  navigator.clipboard?.writeText(url).then(() => ElMessage.success('URL скопирован'))
}

function loadMore() {
  fetchAssets(false)
}

onMounted(() => fetchAssets())
</script>

<style scoped>
.assets-manager { padding: 4px 0; }

.manager-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;
}
.manager-header h3 { margin: 0; font-size: 16px; font-weight: 600; }

.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.asset-card {
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  overflow: hidden;
  background: var(--el-bg-color);
}

.asset-preview {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  overflow: hidden;
}

.asset-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.asset-file-icon {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-text-color-placeholder);
}

.asset-info {
  padding: 8px 10px;
}

.asset-actions {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

.load-more {
  text-align: center;
  padding: 16px 0;
}
</style>
