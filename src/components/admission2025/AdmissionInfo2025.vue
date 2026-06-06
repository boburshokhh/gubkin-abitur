<template>
  <section class="admission-section white">
    <div class="admission-container">
      <div class="section-heading">
        <el-tag class="section-kicker" effect="plain" round>Общая информация</el-tag>
        <h2>Прием на 1-й курс 2026/2027 учебного года</h2>
        <p>Основные условия поступления, сроки подачи документов и правила выбора направлений.</p>
      </div>

      <el-row :gutter="24">
        <el-col v-for="card in infoCards" :key="card.title" :xs="24" :md="12">
          <el-card class="info-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon :class="card.iconClass" size="28">
                  <component :is="card.icon" />
                </el-icon>
                <span>{{ card.title }}</span>
              </div>
            </template>

            <el-descriptions :column="1" border>
              <el-descriptions-item
                v-for="item in card.items"
                :key="item.label"
                :label="item.label"
              >
                <strong v-if="item.accent" :class="card.iconClass">{{ item.value }}</strong>
                <span v-else>{{ item.value }}</span>
              </el-descriptions-item>
            </el-descriptions>

            <el-alert
              v-if="card.note"
              class="card-note"
              :title="card.note.title"
              :description="card.note.description"
              :type="card.note.type"
              show-icon
              :closable="false"
            />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </section>
</template>

<script setup>
import { Calendar, DataAnalysis, OfficeBuilding, User } from '@element-plus/icons-vue'

const infoCards = [
  {
    title: 'Учебное заведение',
    icon: OfficeBuilding,
    iconClass: 'text-primary',
    items: [
      {
        label: 'Название',
        value: 'Филиал Российского государственного университета нефти и газа (НИУ) имени И.М. Губкина в г. Ташкенте'
      },
      { label: 'Программы', value: 'Бакалавриат и специалитет' },
      { label: 'Форма обучения', value: 'Очная (дневная)' },
      { label: 'Язык обучения', value: 'Русский' }
    ]
  },
  {
    title: 'Квота и условия',
    icon: DataAnalysis,
    iconClass: 'text-success',
    items: [
      { label: 'Общая квота на 2026 год', value: '330 человек', accent: true },
      { label: 'Основа приема', value: 'Конкурсная основа по результатам вступительных испытаний или ЕГЭ' }
    ],
    note: {
      title: 'Для бюджетников, граждан РУз',
      description: 'Обязательство отработки не менее 3 лет на предприятиях нефтегазовой отрасли Узбекистана.',
      type: 'info'
    }
  },
  {
    title: 'Сроки приема',
    icon: Calendar,
    iconClass: 'text-info',
    items: [
      { label: 'Сроки подачи документов', value: '16 июня - 01 июля 2026 включительно', accent: true },
      { label: 'Формат приема', value: 'Очно (off-line) и дистанционно (on-line)' },
      { label: 'Режим online', value: '24 часа в сутки' }
    ]
  },
  {
    title: 'Выбор направлений',
    icon: User,
    iconClass: 'text-purple',
    items: [
      { label: 'Максимум направлений', value: 'до 3 конкурсных групп', accent: true },
      { label: 'Условие', value: 'Единый набор вступительных испытаний с указанием приоритета' },
      { label: 'Вступительные испытания', value: 'Одинаковые для бюджетных и платных мест' }
    ]
  }
]
</script>

<style scoped>
.admission-section {
  padding: 72px 0;
  color: #111827;
}

.admission-section.white {
  background: #fff;
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

.info-card {
  height: calc(100% - 24px);
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
}

.info-card :deep(.el-card__header) {
  border-bottom-color: #eef2f7;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #111827;
  font-size: 1.12rem;
  font-weight: 650;
}

.card-note {
  margin-top: 18px;
  border-radius: 12px;
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
