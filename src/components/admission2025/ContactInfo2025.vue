<template>
  <section class="admission-section muted">
    <div class="admission-container">
      <div class="section-heading">
        <el-tag class="section-kicker" effect="plain" round>{{ sectionKicker }}</el-tag>
        <h2>{{ sectionTitle }}</h2>
        <p>{{ sectionSubtitle }}</p>
      </div>

      <el-row :gutter="24">
        <el-col v-for="card in contactCards" :key="card.title" :xs="24" :md="12">
          <el-card class="contact-card" shadow="hover">
            <template #header>
              <div class="contact-header">
                <el-icon class="text-primary" size="28"><Phone /></el-icon>
                <span>{{ card.title }}</span>
              </div>
            </template>

            <el-descriptions :column="1" border>
              <el-descriptions-item v-for="item in card.items" :key="item.label" :label="item.label">
                <a v-if="item.href" :href="item.href" target="_blank" rel="noopener noreferrer">
                  {{ item.value }}
                </a>
                <span v-else>{{ item.value }}</span>
              </el-descriptions-item>
            </el-descriptions>

            <el-alert
              v-if="card.note"
              class="contact-note"
              :title="card.note.title"
              :description="card.note.description"
              :type="card.note.type"
              show-icon
              :closable="false"
            />
          </el-card>
        </el-col>
      </el-row>

      <el-card v-if="mapEmbedUrl" class="map-card" shadow="hover">
        <template #header>
          <div class="contact-header">
            <el-icon color="#64748b" size="28"><MapLocation /></el-icon>
            <span>Расположение на карте</span>
          </div>
        </template>

        <div class="map-frame">
          <iframe
            :src="mapEmbedUrl"
            width="100%"
            height="420"
            style="border: 0"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            title="Карта расположения филиала Губкина в Ташкенте"
          />
        </div>
      </el-card>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { MapLocation, Phone } from '@element-plus/icons-vue'

const props = defineProps({
  sectionData: { type: Object, default: () => ({}) }
})

const contactCards = computed(() => props.sectionData?.cards || [])
const mapEmbedUrl = computed(() => props.sectionData?.map_embed_url || '')
const sectionKicker = computed(() => props.sectionData?.kicker || 'Контакты')
const sectionTitle = computed(() => props.sectionData?.title || 'Контакты приемной комиссии')
const sectionSubtitle = computed(() => props.sectionData?.subtitle || 'Свяжитесь с нами для получения дополнительной информации и технической поддержки.')
</script>

<style scoped>
.admission-section {
  padding: 72px 0;
}

.admission-section.muted {
  background: #f5f7fb;
}

.admission-container {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
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

.contact-card {
  height: calc(100% - 24px);
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
}

.contact-card :deep(.el-card__header),
.map-card :deep(.el-card__header) {
  border-bottom-color: #eef2f7;
}

.contact-header {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #111827;
  font-size: 1.12rem;
  font-weight: 650;
}

.contact-note {
  margin-top: 18px;
  border-radius: 14px;
}

.map-card {
  margin-top: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
}

.map-frame {
  overflow: hidden;
  border-radius: 18px;
  background: #e5e7eb;
}

.map-alert {
  margin-top: 16px;
  border-radius: 14px;
}

.text-primary {
  color: #123d70;
}

.text-success {
  color: #123d70;
}

.text-info {
  color: #123d70;
}

.text-purple {
  color: #123d70;
}

.section-kicker {
  border-color: rgba(18, 61, 112, 0.18);
  background: rgba(18, 61, 112, 0.06);
  color: #123d70;
}
</style>
