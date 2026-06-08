<template>
  <main class="admission-page">
    <el-affix :offset="64" class="admission-affix">
      <section class="admission-nav">
        <div class="admission-container">
          <el-scrollbar>
            <nav class="nav-list" aria-label="Навигация по разделам приема">
              <el-button
                v-for="item in navItems"
                :key="item.id"
                plain
                class="nav-button"
                @click="scrollToSection(item.id)"
              >
                {{ item.label }}
              </el-button>
            </nav>
          </el-scrollbar>
        </div>
      </section>
    </el-affix>

    <div id="admission-info">
      <AdmissionInfo2025 :section-data="admissionInfoData" />
    </div>

    <div id="directions">
      <Directions2025
        :education-profiles="educationProfiles"
        :is-loading="isLoading"
        :section-data="directionsData"
      />
    </div>

    <div id="documents">
      <DocumentsList2025 :section-data="documentsData" />
    </div>

    <div id="process">
      <ApplicationProcess2025 :section-data="processData" />
    </div>

    <div id="exams">
      <ExamSchedule2025 :section-data="examsData" />
    </div>

    <div id="olympiad">
      <OlympiadBenefits2025 :section-data="olympiadData" />
    </div>

    <div id="contacts">
      <ContactInfo2025 :section-data="contactsData" />
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdmissionInfo2025 from '@/components/admission2025/AdmissionInfo2025.vue'
import Directions2025 from '@/components/admission2025/Directions2025.vue'
import DocumentsList2025 from '@/components/admission2025/DocumentsList2025.vue'
import ApplicationProcess2025 from '@/components/admission2025/ApplicationProcess2025.vue'
import ExamSchedule2025 from '@/components/admission2025/ExamSchedule2025.vue'
import OlympiadBenefits2025 from '@/components/admission2025/OlympiadBenefits2025.vue'
import ContactInfo2025 from '@/components/admission2025/ContactInfo2025.vue'
import { fetchCmsPage, getSectionByAnchor } from '@/api/cms.js'
import { profiles as profilesApi } from '@/api/education.js'

const pageData = ref(null)
const educationProfiles = ref([])
const isLoading = ref(false)

const sections = computed(() => pageData.value?.sections || [])

function getSectionContent(anchor) {
  const section = getSectionByAnchor(sections.value, anchor)
  return section?.content || {}
}

const admissionInfoData = computed(() => getSectionContent('admission-info'))
const directionsData = computed(() => getSectionContent('directions'))
const documentsData = computed(() => getSectionContent('documents'))
const processData = computed(() => getSectionContent('process'))
const examsData = computed(() => getSectionContent('exams'))
const olympiadData = computed(() => getSectionContent('olympiad'))
const contactsData = computed(() => getSectionContent('contacts'))

const defaultNavItems = [
  { id: 'admission-info', label: 'Общая информация' },
  { id: 'directions', label: 'Направления' },
  { id: 'documents', label: 'Документы' },
  { id: 'process', label: 'Процесс подачи' },
  { id: 'exams', label: 'Экзамены' },
  { id: 'olympiad', label: 'Олимпиада' },
  { id: 'contacts', label: 'Контакты' }
]

const navItems = computed(() => {
  if (!sections.value.length) return defaultNavItems
  return sections.value
    .filter(s => s.is_published && s.anchor && s.anchor !== 'hero')
    .map(s => ({ id: s.anchor, label: s.title || s.anchor }))
})

onMounted(async () => {
  isLoading.value = true
  try {
    const [cmsPage, profilesResult] = await Promise.all([
      fetchCmsPage('admission2025'),
      profilesApi.getAllWithDetails()
    ])
    pageData.value = cmsPage
    if (profilesResult.error) throw profilesResult.error
    educationProfiles.value = profilesResult.data || []
  } catch {
    // fallback to default content if API unavailable
  } finally {
    isLoading.value = false
  }
})

function scrollToSection(sectionId) {
  const targetElement = document.getElementById(sectionId)
  if (!targetElement) return
  const headerOffset = 136
  const top = targetElement.getBoundingClientRect().top + window.scrollY - headerOffset
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
}
</script>

<style scoped>
.admission-page {
  --admission-bg: #f7f9fc;
  --admission-surface: #ffffff;
  --admission-surface-soft: #f1f5f9;
  --admission-border: #e2e8f0;
  --admission-text: #111827;
  --admission-muted: #667085;
  --admission-primary: #123d70;
  --admission-primary-soft: #e8f0f9;
  --admission-accent: #0f766e;
  --admission-warning-bg: #fff8e8;
  --admission-warning-text: #8a5a00;
  background: var(--admission-bg);
  color: var(--admission-text);
}

.admission-container {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
}

.admission-nav {
  padding: 12px 0;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  border-bottom: 1px solid rgba(226, 232, 240, 0.86);
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(14px);
}

.nav-list {
  display: flex;
  gap: 10px;
  min-width: max-content;
  padding-bottom: 2px;
}

.nav-button {
  border-color: var(--admission-border);
  color: var(--admission-primary);
  font-weight: 500;
}

.nav-button:hover,
.nav-button:focus {
  border-color: rgba(18, 61, 112, 0.28);
  background: var(--admission-primary-soft);
  color: var(--admission-primary);
}

.admission-page :deep(.el-button--primary) {
  --el-button-bg-color: var(--admission-primary);
  --el-button-border-color: var(--admission-primary);
  --el-button-hover-bg-color: #0d335f;
  --el-button-hover-border-color: #0d335f;
  --el-button-active-bg-color: #092846;
  --el-button-active-border-color: #092846;
}

.admission-page :deep(.el-card) {
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.admission-page :deep(.el-card.is-hover-shadow:hover) {
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.07);
}

.admission-page :deep(.el-alert) {
  border: 1px solid var(--admission-border);
  background: var(--admission-surface-soft);
  color: var(--admission-text);
}

.admission-page :deep(.el-alert--info) {
  border-color: #d8e4f2;
  background: #f3f7fb;
}

.admission-page :deep(.el-alert--warning) {
  border-color: #f3dfb2;
  background: var(--admission-warning-bg);
  color: var(--admission-warning-text);
}

.admission-page :deep(.el-alert--error) {
  border-color: #f0c7c7;
  background: #fff5f5;
}

.admission-page :deep(.el-alert__title) {
  color: inherit;
  font-weight: 650;
}

.admission-page :deep(.el-alert__description) {
  color: #475569;
  line-height: 1.6;
}

.admission-page :deep(.el-statistic__head) {
  color: var(--admission-muted);
}

.admission-page :deep(.el-statistic__content) {
  color: var(--admission-primary);
  font-weight: 650;
}
</style>