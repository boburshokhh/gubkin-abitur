<template>
  <section class="admission-section white">
    <div class="admission-container narrow">
      <div class="section-heading">
        <el-tag class="section-kicker" effect="plain" round>{{ sectionKicker }}</el-tag>
        <h2>{{ sectionTitle }}</h2>
        <p>{{ sectionSubtitle }}</p>
      </div>

      <el-row :gutter="22">
        <el-col v-for="olympiad in olympiads" :key="olympiad.title" :xs="24">
          <el-card class="benefit-card" shadow="hover">
            <template #header>
              <div class="benefit-header">
                <el-icon class="text-primary" size="30"><Trophy /></el-icon>
                <div>
                  <h3>{{ olympiad.title }}</h3>
                  <span>{{ olympiad.subtitle }}</span>
                </div>
              </div>
            </template>

            <el-row :gutter="16">
              <el-col v-for="benefit in (olympiad.benefits || [])" :key="benefit.title" :xs="24" :md="12">
                <el-alert
                  class="benefit-alert"
                  :title="benefit.title"
                  :description="benefit.description"
                  :type="benefit.type || 'info'"
                  show-icon
                  :closable="false"
                />
              </el-col>
            </el-row>

            <el-divider v-if="olympiad.list_title || olympiad.listTitle" />
            <div v-if="olympiad.list_title || olympiad.listTitle" class="benefit-list">
              <h4>{{ olympiad.list_title || olympiad.listTitle }}</h4>
              <el-check-tag
                v-for="item in (olympiad.list || [])"
                :key="item"
                checked
                class="benefit-check-tag"
              >
                {{ item }}
              </el-check-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-card v-if="conditions.length" class="conditions-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon color="#dc2626" size="24"><WarningFilled /></el-icon>
            <span>Важные условия</span>
          </div>
        </template>

        <el-row :gutter="18">
          <el-col v-for="cond in conditions" :key="cond.title" :xs="24" :md="12">
            <el-alert
              :title="cond.title"
              :description="cond.description"
              :type="cond.type || 'warning'"
              show-icon
              :closable="false"
            />
          </el-col>
        </el-row>
      </el-card>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { Trophy, WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  sectionData: { type: Object, default: () => ({}) }
})

const olympiads = computed(() => props.sectionData?.olympiads || [])
const conditions = computed(() => props.sectionData?.conditions || [])
const sectionKicker = computed(() => props.sectionData?.kicker || 'Олимпиады')
const sectionTitle = computed(() => props.sectionData?.title || 'Льготы для участников олимпиад')
const sectionSubtitle = computed(() => props.sectionData?.subtitle || 'Особые условия поступления для победителей, призеров и участников олимпиад 2026 года.')
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

.benefit-card,
.conditions-card {
  margin-bottom: 22px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
}

.benefit-card :deep(.el-card__header),
.conditions-card :deep(.el-card__header) {
  border-bottom-color: #eef2f7;
}

.benefit-header,
.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.benefit-header h3 {
  margin: 0 0 4px;
  color: #111827;
  font-size: 1.25rem;
  font-weight: 650;
}

.benefit-header span {
  color: #64748b;
}

.benefit-alert {
  height: calc(100% - 14px);
  margin-bottom: 14px;
  border-radius: 14px;
}

.benefit-list h4 {
  margin: 0 0 14px;
  color: #111827;
  font-weight: 650;
}

.benefit-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.benefit-list h4 {
  flex-basis: 100%;
}

.card-header {
  color: #111827;
  font-size: 1.12rem;
  font-weight: 650;
}

.text-primary {
  color: #123d70;
}

.text-warning {
  color: #123d70;
}

.section-kicker,
.benefit-check-tag {
  border-color: rgba(18, 61, 112, 0.18);
  background: rgba(18, 61, 112, 0.06);
  color: #123d70;
}
</style>
