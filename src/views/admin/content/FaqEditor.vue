<template>
  <div class="faq-editor">
    <div class="editor-header">
      <div>
        <h3>Часто задаваемые вопросы</h3>
        <el-text type="info">Управление контентом страницы /faq</el-text>
      </div>
      <el-button type="primary" :loading="isSaving" :disabled="isLoading" @click="saveSection">
        Сохранить
      </el-button>
    </div>

    <el-skeleton v-if="isLoading" :rows="8" animated />

    <el-card v-else shadow="never" class="editor-card">
      <FaqSectionForm v-model="editForm" />
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { adminCreateSection, adminGetSections, adminUpdateSection } from '@/api/cms.js'
import { defaultFaqContent } from '@/content/default-faq.js'
import FaqSectionForm from './forms/FaqSectionForm.vue'

const isLoading = ref(false)
const isSaving = ref(false)
const faqSection = ref(null)
const editForm = ref({})

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value))
}

function getEditableContent(content = {}) {
  const hasItems = Array.isArray(content.items) && content.items.length > 0
  return cloneValue(hasItems ? content : defaultFaqContent)
}

async function ensureFaqSection(sections) {
  const existingSection = sections.find(section => section.anchor === 'faq' || section.type === 'faq')
  if (existingSection) return existingSection

  return adminCreateSection('faq', {
    type: 'faq',
    anchor: 'faq',
    title: 'Часто задаваемые вопросы',
    content: defaultFaqContent,
    sort_order: 10
  })
}

async function fetchSection() {
  isLoading.value = true
  try {
    const sections = await adminGetSections('faq')
    faqSection.value = await ensureFaqSection(sections)
    editForm.value = getEditableContent(faqSection.value.content)
  } catch (err) {
    ElMessage.error('Ошибка загрузки FAQ: ' + err.message)
  } finally {
    isLoading.value = false
  }
}

async function saveSection() {
  if (!faqSection.value) return

  isSaving.value = true
  try {
    const updatedSection = await adminUpdateSection(faqSection.value.id, {
      title: editForm.value.title || 'Часто задаваемые вопросы',
      content: editForm.value,
      is_published: true
    })
    faqSection.value = updatedSection
    ElMessage.success('FAQ сохранены')
  } catch (err) {
    ElMessage.error('Ошибка сохранения FAQ: ' + err.message)
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchSection)
</script>

<style scoped>
.faq-editor { padding: 4px 0; }

.editor-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.editor-header h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
}

.editor-card {
  border-radius: 10px;
}
</style>
