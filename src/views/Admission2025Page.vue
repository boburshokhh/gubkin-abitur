<template>
  <main class="admission-page">
    <section class="admission-hero">
      <div class="admission-container">
        <el-row :gutter="32" align="middle">
          <el-col :xs="24" :lg="15">
            <el-tag effect="dark" size="large" round>Прием 2025/2026</el-tag>
            <h1>Поступление в филиал Губкина в Ташкенте</h1>
            <p class="hero-description">
              Вся ключевая информация для абитуриентов: сроки приема, направления подготовки,
              пакет документов, экзамены, льготы олимпиад и контакты приемной комиссии.
            </p>

            <div class="hero-actions">
              <el-button type="primary" size="large" round @click="scrollToSection('documents')">
                Подготовить документы
              </el-button>
              <el-button size="large" round @click="scrollToSection('directions')">
                Смотреть направления
              </el-button>
            </div>
          </el-col>

          <el-col :xs="24" :lg="9">
            <el-card class="hero-card" shadow="always">
              <el-statistic title="Общая квота" :value="330" suffix="мест" />
              <el-divider />
              <div class="hero-card-grid">
                <div>
                  <span>Прием документов</span>
                  <strong>16 июня - 01 июля</strong>
                </div>
                <div>
                  <span>Формат</span>
                  <strong>online / offline</strong>
                </div>
                <div>
                  <span>Конкурсные группы</span>
                  <strong>до 3</strong>
                </div>
                <div>
                  <span>Обучение</span>
                  <strong>очное</strong>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </section>

    <el-affix :offset="64" class="admission-affix">
      <section class="admission-nav">
        <div class="admission-container">
          <el-scrollbar>
            <nav class="nav-list" aria-label="Навигация по разделам приема">
              <el-button
                v-for="item in navItems"
                :key="item.id"
                round
                plain
                type="primary"
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
      <AdmissionInfo2025 />
    </div>

    <div id="directions">
      <Directions2025 />
    </div>

    <div id="documents">
      <DocumentsList2025 />
    </div>

    <div id="process">
      <ApplicationProcess2025 />
    </div>

    <div id="exams">
      <ExamSchedule2025 />
    </div>

    <div id="olympiad">
      <OlympiadBenefits2025 />
    </div>

    <div id="contacts">
      <ContactInfo2025 />
    </div>
  </main>
</template>

<script setup>
import AdmissionInfo2025 from '@/components/admission2025/AdmissionInfo2025.vue'
import Directions2025 from '@/components/admission2025/Directions2025.vue'
import DocumentsList2025 from '@/components/admission2025/DocumentsList2025.vue'
import ApplicationProcess2025 from '@/components/admission2025/ApplicationProcess2025.vue'
import ExamSchedule2025 from '@/components/admission2025/ExamSchedule2025.vue'
import OlympiadBenefits2025 from '@/components/admission2025/OlympiadBenefits2025.vue'
import ContactInfo2025 from '@/components/admission2025/ContactInfo2025.vue'

const navItems = [
  { id: 'admission-info', label: 'Общая информация' },
  { id: 'directions', label: 'Направления' },
  { id: 'documents', label: 'Документы' },
  { id: 'process', label: 'Процесс подачи' },
  { id: 'exams', label: 'Экзамены' },
  { id: 'olympiad', label: 'Олимпиада' },
  { id: 'contacts', label: 'Контакты' }
]

function scrollToSection(sectionId) {
  const targetElement = document.getElementById(sectionId)

  if (!targetElement) return

  const headerOffset = 136
  const top = targetElement.getBoundingClientRect().top + window.scrollY - headerOffset

  window.scrollTo({
    top: Math.max(0, top),
    behavior: 'smooth'
  })
}
</script>

<style scoped>
.admission-page {
  background: #f5f7fb;
}

.admission-container {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
}

.admission-hero {
  padding: 72px 0;
  color: #fff;
  background:
    radial-gradient(circle at 18% 18%, rgba(64, 158, 255, 0.36), transparent 32%),
    linear-gradient(135deg, #071a3d 0%, #123d70 52%, #0f766e 100%);
}

.admission-hero h1 {
  max-width: 760px;
  margin: 18px 0;
  font-size: clamp(2.4rem, 5vw, 4.7rem);
  font-weight: 800;
  line-height: 1.05;
}

.hero-description {
  max-width: 720px;
  margin: 0;
  color: rgba(255, 255, 255, 0.86);
  font-size: 1.2rem;
  line-height: 1.75;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 32px;
}

.hero-card {
  border: 0;
  border-radius: 28px;
}

.hero-card :deep(.el-card__body) {
  padding: 28px;
}

.hero-card-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.hero-card-grid span {
  display: block;
  color: #6b7280;
  font-size: 0.84rem;
}

.hero-card-grid strong {
  display: block;
  margin-top: 4px;
  color: #111827;
  font-size: 1rem;
}

.admission-nav {
  padding: 14px 0;
  border-bottom: 1px solid #dfe7f2;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(14px);
}

.nav-list {
  display: flex;
  gap: 10px;
  min-width: max-content;
  padding-bottom: 2px;
}

@media (max-width: 767px) {
  .admission-hero {
    padding: 48px 0;
  }

  .hero-card {
    margin-top: 32px;
  }

  .hero-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>