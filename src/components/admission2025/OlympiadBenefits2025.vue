<template>
  <section class="admission-section white">
    <div class="admission-container narrow">
      <div class="section-heading">
        <el-tag type="warning" effect="plain" round>Олимпиады</el-tag>
        <h2>Льготы для участников олимпиад</h2>
        <p>Особые условия поступления для победителей, призеров и участников олимпиад 2025 года.</p>
      </div>

      <el-row :gutter="22">
        <el-col v-for="olympiad in olympiads" :key="olympiad.title" :xs="24">
          <el-card class="benefit-card" shadow="hover">
            <template #header>
              <div class="benefit-header">
                <el-icon :class="olympiad.iconClass" size="30">
                  <component :is="olympiad.icon" />
                </el-icon>
                <div>
                  <h3>{{ olympiad.title }}</h3>
                  <span>{{ olympiad.subtitle }}</span>
                </div>
              </div>
            </template>

            <el-row :gutter="16">
              <el-col v-for="benefit in olympiad.benefits" :key="benefit.title" :xs="24" :md="12">
                <el-alert
                  class="benefit-alert"
                  :title="benefit.title"
                  :description="benefit.description"
                  :type="benefit.type"
                  show-icon
                  :closable="false"
                />
              </el-col>
            </el-row>

            <el-divider v-if="olympiad.listTitle" />
            <div v-if="olympiad.listTitle" class="benefit-list">
              <h4>{{ olympiad.listTitle }}</h4>
              <el-check-tag
                v-for="item in olympiad.list"
                :key="item"
                checked
                type="success"
              >
                {{ item }}
              </el-check-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-card class="conditions-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon color="#dc2626" size="24"><WarningFilled /></el-icon>
            <span>Важные условия</span>
          </div>
        </template>

        <el-row :gutter="18">
          <el-col :xs="24" :md="12">
            <el-alert
              title="Сроки подачи документов"
              description="Победители и призеры олимпиад должны представить подтверждающие документы до 01 июля 2025 года."
              type="error"
              show-icon
              :closable="false"
            />
          </el-col>
          <el-col :xs="24" :md="12">
            <el-alert
              title="Для республиканской олимпиады"
              description="Нужны подтверждающие документы и нотариально заверенный перевод на русский язык."
              type="warning"
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
import { Medal, Trophy, WarningFilled } from '@element-plus/icons-vue'

const technicalDirections = [
  'Технология геологической разведки',
  'Нефтегазовые техника и технологии',
  'Нефтегазовое дело (конкурсные группы 1-8)'
]

const olympiads = [
  {
    title: 'Республиканская олимпиада РУз 2025',
    subtitle: 'По математике для учащихся школ, лицеев и колледжей',
    icon: Trophy,
    iconClass: 'text-warning',
    listTitle: 'Для технических направлений',
    list: technicalDirections,
    benefits: [
      {
        title: 'Технические направления',
        description: 'Победители заключительного этапа принимаются без вступительных испытаний.',
        type: 'success'
      },
      {
        title: 'Экономика и Менеджмент',
        description: 'Результат по математике засчитывается с наивысшим баллом 100. Русский и английский сдаются в обычном порядке.',
        type: 'info'
      }
    ]
  },
  {
    title: 'Губкинская предметная олимпиада 2025',
    subtitle: 'По русскому языку и математике',
    icon: Medal,
    iconClass: 'text-primary',
    listTitle: 'Технические направления',
    list: technicalDirections,
    benefits: [
      {
        title: 'Победители и призеры технических направлений',
        description: 'Принимаются без вступительных испытаний.',
        type: 'success'
      },
      {
        title: 'Экономика и Менеджмент',
        description: 'Победители поступают без вступительных испытаний, призерам русский язык и математика засчитываются по 100 баллов.',
        type: 'info'
      },
      {
        title: 'Участники',
        description: 'При результате не менее 40 баллов по предмету эти результаты могут быть зачтены как вступительные испытания.',
        type: 'warning'
      }
    ]
  }
]
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
  font-weight: 800;
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
  border-radius: 22px;
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
  font-weight: 800;
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
  font-weight: 800;
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
  font-weight: 800;
}

.text-primary {
  color: #2563eb;
}

.text-warning {
  color: #d97706;
}
</style>
