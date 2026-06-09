<template>
  <section class="admission-section white">
    <div class="admission-container narrow">
      <div class="section-heading">
        <el-tag class="section-kicker" effect="plain" round>{{ sectionKicker }}</el-tag>
        <h2>{{ sectionTitle }}</h2>
        <p>{{ sectionSubtitle }}</p>
      </div>

      <el-space direction="vertical" fill size="large" class="documents-space">
        <el-card v-for="documentItem in documents" :key="documentItem.title" class="document-card" shadow="hover">
          <template #header>
            <div class="document-header">
              <div class="document-title">
                <el-icon class="text-primary" size="26">
                  <Document />
                </el-icon>
                <div>
                  <h3>{{ documentItem.title }}</h3>
                  <el-tag class="status-tag" effect="plain" round>
                    {{ documentItem.status_label || 'Обязательно' }}
                  </el-tag>
                </div>
              </div>
              <el-tag effect="plain" round>{{ documentItem.number }}</el-tag>
            </div>
          </template>

          <p class="document-description">{{ documentItem.description }}</p>

          <el-row v-if="documentItem.notes?.length" :gutter="16">
            <el-col v-for="note in documentItem.notes" :key="note.title" :xs="24" :md="12">
              <el-alert
                class="document-note"
                :title="note.title"
                :description="note.description"
                :type="note.type"
                show-icon
                :closable="false"
              />
            </el-col>
          </el-row>
        </el-card>
      </el-space>

      <el-card v-if="summary && summary.show_summary !== false" class="summary-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon color="#123d70" size="24"><Calendar /></el-icon>
            <span>{{ summary.title || 'Сроки и режим работы' }}</span>
          </div>
        </template>

        <el-row :gutter="24">
          <el-col :xs="24" :md="12">
            <el-alert
              :title="summary.notice_title || 'Прием документов'"
              :description="summary.date_info"
              :type="summary.notice_type || 'info'"
              show-icon
              :closable="false"
            />
          </el-col>
          <el-col :xs="24" :md="12">
            <el-descriptions :column="1" border>
              <el-descriptions-item v-if="summary.address" :label="summary.address_label || 'Адрес'">
                {{ summary.address }}
              </el-descriptions-item>
              <el-descriptions-item v-if="summary.phone_label" :label="summary.phone_title || 'Call-центр'">
                <a :href="`tel:${summary.phone}`">{{ summary.phone_label }}</a>
              </el-descriptions-item>
              <el-descriptions-item v-if="summary.contact_person" :label="summary.contact_person_label || 'Ответственное лицо'">
                {{ summary.contact_person }}
              </el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { Calendar, Document } from '@element-plus/icons-vue'

const props = defineProps({
  sectionData: { type: Object, default: () => ({}) }
})

const documents = computed(() => props.sectionData?.items || [])
const summary = computed(() => props.sectionData?.summary || null)
const sectionKicker = computed(() => props.sectionData?.kicker || 'Документы')
const sectionTitle = computed(() => props.sectionData?.title || 'Необходимые документы')
const sectionSubtitle = computed(() => props.sectionData?.subtitle || 'Документы предоставляются в электронном виде для очной off-line и дистанционной on-line подачи.')
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
  width: min(960px, calc(100% - 32px));
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

.documents-space {
  width: 100%;
}

.document-card,
.summary-card {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
}

.document-card :deep(.el-card__header),
.summary-card :deep(.el-card__header) {
  border-bottom-color: #eef2f7;
}

.document-header,
.document-title,
.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.document-header {
  justify-content: space-between;
}

.document-title h3 {
  margin: 0 0 8px;
  color: #111827;
  font-size: 1.18rem;
  font-weight: 650;
}

.document-description {
  margin: 0 0 18px;
  color: #334155;
  font-size: 1rem;
  line-height: 1.7;
}

.document-note {
  height: calc(100% - 14px);
  margin-bottom: 14px;
  border-radius: 14px;
}

.summary-card {
  margin-top: 28px;
}

.card-header {
  color: #111827;
  font-size: 1.12rem;
  font-weight: 650;
}

.text-primary {
  color: #123d70;
}

.text-success {
  color: #123d70;
}

.text-warning {
  color: #123d70;
}

.text-purple {
  color: #123d70;
}

.section-kicker,
.status-tag {
  border-color: rgba(18, 61, 112, 0.18);
  background: rgba(18, 61, 112, 0.06);
  color: #123d70;
}

@media (max-width: 767px) {
  .document-header {
    align-items: flex-start;
    flex-direction: column-reverse;
  }
}
</style>
