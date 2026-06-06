<template>
  <section class="admission-section white">
    <div class="admission-container narrow">
      <div class="section-heading">
        <el-tag class="section-kicker" effect="plain" round>{{ sectionKicker }}</el-tag>
        <h2>{{ sectionTitle }}</h2>
        <p>{{ sectionSubtitle }}</p>
      </div>

      <el-timeline>
        <el-timeline-item
          v-for="step in steps"
          :key="step.title"
          :timestamp="step.timestamp || step.step_label"
          placement="top"
          type="primary"
          size="large"
        >
          <el-card class="step-card" shadow="hover">
            <template #header>
              <div class="step-header">
                <el-icon size="24"><CircleCheck /></el-icon>
                <span>{{ step.title }}</span>
              </div>
            </template>

            <p>{{ step.description }}</p>

            <el-alert
              v-if="step.note"
              class="step-note"
              :title="step.note.title"
              :description="step.note.description"
              :type="step.note.type"
              show-icon
              :closable="false"
            />

            <el-row v-if="step.groups" :gutter="16">
              <el-col v-for="group in step.groups" :key="group.title" :xs="24" :md="12">
                <div class="mini-card">
                  <strong>{{ group.title }}</strong>
                  <ul>
                    <li v-for="item in group.items" :key="item">{{ item }}</li>
                  </ul>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-row v-if="notices.length" :gutter="18" class="notice-row">
        <el-col v-for="notice in notices" :key="notice.title" :xs="24" :md="12">
          <el-alert
            :title="notice.title"
            :description="notice.description"
            :type="notice.type || 'info'"
            show-icon
            :closable="false"
          />
        </el-col>
      </el-row>

      <el-alert
        v-if="finalAlert"
        class="final-alert"
        title="Обратите внимание"
        :description="finalAlert"
        type="warning"
        show-icon
        :closable="false"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { CircleCheck } from '@element-plus/icons-vue'

const props = defineProps({
  sectionData: { type: Object, default: () => ({}) }
})

const steps = computed(() => (props.sectionData?.steps || []).map(s => ({ ...s, timestamp: s.step_label || s.timestamp })))
const notices = computed(() => props.sectionData?.notices || [])
const finalAlert = computed(() => props.sectionData?.final_alert || '')
const sectionKicker = computed(() => props.sectionData?.kicker || 'Подача заявления')
const sectionTitle = computed(() => props.sectionData?.title || 'Процесс подачи документов')
const sectionSubtitle = computed(() => props.sectionData?.subtitle || 'Пошаговая инструкция для абитуриентов 2026 года.')
</script>

<style scoped>
.admission-section {
  padding: 72px 0;
}

.admission-section.white {
  background: #fff;
}

.admission-container {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
}

.admission-container.narrow {
  width: min(920px, calc(100% - 32px));
}

.section-heading {
  max-width: 760px;
  margin: 0 auto 40px;
  text-align: center;
}

.section-heading h2 {
  margin: 14px 0;
  color: #111827;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.035em;
}

.section-heading p {
  margin: 0;
  color: #64748b;
  font-size: 1.1rem;
  line-height: 1.7;
}

.step-card {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
}

.step-card :deep(.el-card__header) {
  border-bottom-color: #eef2f7;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #111827;
  font-size: 1.15rem;
  font-weight: 650;
}

.step-card p {
  margin: 0 0 16px;
  color: #334155;
  line-height: 1.7;
}

.step-note {
  margin-top: 14px;
  border-radius: 14px;
}

.mini-card {
  height: calc(100% - 14px);
  margin-bottom: 14px;
  padding: 16px;
  border-radius: 16px;
  background: #f8fafc;
}

.mini-card strong {
  display: block;
  margin-bottom: 10px;
  color: #111827;
}

.mini-card ul {
  margin: 0;
  padding-left: 18px;
  color: #475569;
}

.notice-row {
  margin-top: 28px;
}

.final-alert {
  margin-top: 18px;
  border-radius: 16px;
}

.section-kicker {
  border-color: rgba(18, 61, 112, 0.18);
  background: rgba(18, 61, 112, 0.06);
  color: #123d70;
}
</style>
