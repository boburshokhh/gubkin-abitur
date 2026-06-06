<template>
  <div class="section-editor">
    <div class="editor-header">
      <h3>Секции главной страницы</h3>
      <el-text type="info">Изменения сразу отображаются на сайте после сохранения</el-text>
    </div>

    <el-skeleton v-if="isLoading" :rows="6" animated />

    <el-empty v-else-if="!sections.length" description="Секции не найдены" />

    <template v-else>
      <el-card
        v-for="section in sections"
        :key="section.id"
        class="section-card"
        shadow="never"
      >
        <template #header>
          <div class="section-card-header">
            <div class="section-info">
              <el-tag :type="section.is_published ? 'success' : 'info'" size="small">
                {{ section.is_published ? 'Опубликовано' : 'Скрыто' }}
              </el-tag>
              <span class="section-title">{{ section.title || section.type }}</span>
              <el-tag type="info" size="small" effect="plain">{{ section.type }}</el-tag>
            </div>
            <div class="section-actions">
              <el-button
                :type="section.is_published ? 'warning' : 'success'"
                size="small"
                text
                @click="togglePublish(section)"
              >
                {{ section.is_published ? 'Скрыть' : 'Опубликовать' }}
              </el-button>
              <el-button type="primary" size="small" text @click="openEditor(section)">
                Редактировать
              </el-button>
            </div>
          </div>
        </template>
        <el-text type="info" size="small">Якорь: #{{ section.anchor }}</el-text>
      </el-card>
    </template>

    <!-- Section Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="`Редактирование: ${editingSection?.title || ''}`"
      width="860px"
      :close-on-click-modal="false"
    >
      <template v-if="editingSection">
        <HeroSectionForm
          v-if="editingSection.type === 'hero'"
          v-model="editForm"
        />
        <FeaturesSectionForm
          v-else-if="editingSection.type === 'features'"
          v-model="editForm"
        />
        <StatsSectionForm
          v-else-if="editingSection.type === 'stats'"
          v-model="editForm"
        />
        <TimelineSectionForm
          v-else-if="editingSection.type === 'timeline'"
          v-model="editForm"
        />
        <FaqSectionForm
          v-else-if="editingSection.type === 'faq'"
          v-model="editForm"
        />
        <GenericSectionForm v-else v-model="editForm" />
      </template>

      <template #footer>
        <el-button @click="dialogVisible = false">Отмена</el-button>
        <el-button type="primary" :loading="isSaving" @click="saveSection">
          Сохранить
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminGetSections, adminUpdateSection } from '@/api/cms.js'
import HeroSectionForm from './forms/HeroSectionForm.vue'
import FeaturesSectionForm from './forms/FeaturesSectionForm.vue'
import StatsSectionForm from './forms/StatsSectionForm.vue'
import TimelineSectionForm from './forms/TimelineSectionForm.vue'
import FaqSectionForm from './forms/FaqSectionForm.vue'
import GenericSectionForm from './forms/GenericSectionForm.vue'

const sections = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const dialogVisible = ref(false)
const editingSection = ref(null)
const editForm = ref({})

async function fetchSections() {
  isLoading.value = true
  try {
    sections.value = await adminGetSections('home')
  } catch (err) {
    ElMessage.error('Ошибка загрузки секций: ' + err.message)
  } finally {
    isLoading.value = false
  }
}

function openEditor(section) {
  editingSection.value = section
  editForm.value = JSON.parse(JSON.stringify(section.content || {}))
  dialogVisible.value = true
}

async function togglePublish(section) {
  try {
    await adminUpdateSection(section.id, { is_published: !section.is_published })
    section.is_published = !section.is_published
    ElMessage.success(section.is_published ? 'Секция опубликована' : 'Секция скрыта')
  } catch (err) {
    ElMessage.error('Ошибка: ' + err.message)
  }
}

async function saveSection() {
  isSaving.value = true
  try {
    await adminUpdateSection(editingSection.value.id, { content: editForm.value })
    const idx = sections.value.findIndex(s => s.id === editingSection.value.id)
    if (idx !== -1) sections.value[idx].content = { ...editForm.value }
    dialogVisible.value = false
    ElMessage.success('Изменения сохранены')
  } catch (err) {
    ElMessage.error('Ошибка сохранения: ' + err.message)
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchSections)
</script>

<style scoped>
.section-editor { padding: 4px 0; }

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.editor-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.section-card {
  margin-bottom: 12px;
  border-radius: 10px;
}

.section-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title {
  font-weight: 600;
  font-size: 14px;
}

.section-actions {
  display: flex;
  gap: 4px;
}
</style>
