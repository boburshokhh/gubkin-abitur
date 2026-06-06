<template>
  <div class="news-manager">
    <div class="manager-header">
      <h3>Новости и объявления</h3>
      <el-button type="primary" @click="openCreateDialog">+ Создать новость</el-button>
    </div>

    <el-skeleton v-if="isLoading" :rows="5" animated />
    <el-empty v-else-if="!newsList.length" description="Новостей ещё нет" />

    <el-table v-else :data="newsList" stripe style="width:100%">
      <el-table-column prop="title" label="Заголовок" min-width="220" show-overflow-tooltip />
      <el-table-column label="Статус" width="110">
        <template #default="{ row }">
          <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">
            {{ row.status === 'published' ? 'Опубликовано' : 'Черновик' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="published_at" label="Дата публикации" width="160">
        <template #default="{ row }">
          {{ row.published_at ? new Date(row.published_at).toLocaleDateString('ru') : '—' }}
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="Создано" width="120">
        <template #default="{ row }">
          {{ new Date(row.created_at).toLocaleDateString('ru') }}
        </template>
      </el-table-column>
      <el-table-column label="Действия" width="140" align="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" text @click="openEditDialog(row)">Изменить</el-button>
          <el-popconfirm title="Удалить эту новость?" @confirm="deleteNews(row.id)">
            <template #reference>
              <el-button type="danger" size="small" text>Удалить</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- Create / Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? 'Редактировать новость' : 'Создать новость'"
      width="720px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-position="top">
        <el-form-item label="Заголовок" required>
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="Slug (URL-идентификатор)" required>
          <el-input v-model="form.slug" placeholder="news-2026-01" />
        </el-form-item>
        <el-form-item label="Краткое описание">
          <el-input v-model="form.summary" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="Полный текст">
          <el-input v-model="form.body" type="textarea" :rows="6" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Статус">
              <el-select v-model="form.status" style="width:100%">
                <el-option value="draft" label="Черновик" />
                <el-option value="published" label="Опубликовать" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Дата публикации">
              <el-date-picker
                v-model="form.published_at"
                type="datetime"
                style="width:100%"
                format="DD.MM.YYYY HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">Отмена</el-button>
        <el-button type="primary" :loading="isSaving" @click="saveNews">Сохранить</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminListNews, adminCreateNews, adminUpdateNews, adminDeleteNews } from '@/api/cms.js'

const newsList = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const dialogVisible = ref(false)
const editingId = ref(null)

const defaultForm = () => ({ title: '', slug: '', summary: '', body: '', status: 'draft', published_at: null })
const form = ref(defaultForm())

async function fetchNews() {
  isLoading.value = true
  try {
    const res = await adminListNews()
    newsList.value = res.data || []
  } catch (err) {
    ElMessage.error('Ошибка загрузки: ' + err.message)
  } finally {
    isLoading.value = false
  }
}

function openCreateDialog() {
  editingId.value = null
  form.value = defaultForm()
  dialogVisible.value = true
}

function openEditDialog(row) {
  editingId.value = row.id
  form.value = {
    title: row.title || '',
    slug: row.slug || '',
    summary: row.summary || '',
    body: row.body || '',
    status: row.status || 'draft',
    published_at: row.published_at || null
  }
  dialogVisible.value = true
}

async function saveNews() {
  if (!form.value.title || !form.value.slug) {
    ElMessage.warning('Заголовок и Slug обязательны')
    return
  }
  isSaving.value = true
  try {
    if (editingId.value) {
      await adminUpdateNews(editingId.value, form.value)
    } else {
      await adminCreateNews(form.value)
    }
    dialogVisible.value = false
    ElMessage.success('Сохранено')
    await fetchNews()
  } catch (err) {
    ElMessage.error('Ошибка: ' + err.message)
  } finally {
    isSaving.value = false
  }
}

async function deleteNews(id) {
  try {
    await adminDeleteNews(id)
    newsList.value = newsList.value.filter(n => n.id !== id)
    ElMessage.success('Удалено')
  } catch (err) {
    ElMessage.error('Ошибка: ' + err.message)
  }
}

onMounted(fetchNews)
</script>

<style scoped>
.news-manager { padding: 4px 0; }
.manager-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;
}
.manager-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
</style>
