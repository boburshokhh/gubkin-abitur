<template>
  <section class="admission-section muted">
    <div class="admission-container narrow">
      <div class="section-heading">
        <el-tag class="section-kicker" effect="plain" round>Экзамены</el-tag>
        <h2>Расписание вступительных испытаний</h2>
        <p>Экзамены проводятся в помещениях Филиала по адресу: ул. Дурмон йули, дом 34.</p>
      </div>

      <el-row :gutter="20">
        <el-col v-for="exam in exams" :key="exam.subject" :xs="24">
          <el-card class="exam-card" shadow="hover">
            <template #header>
              <div class="exam-header">
                <div>
                  <el-tag class="exam-tag" effect="plain" round>{{ exam.format }}</el-tag>
                  <h3>{{ exam.subject }}</h3>
                  <span>{{ exam.duration }}</span>
                </div>
                <div class="exam-date">
                  <strong>{{ exam.date }}</strong>
                  <span>{{ exam.time }}</span>
                </div>
              </div>
            </template>

            <el-alert
              class="exam-alert"
              :title="exam.scope"
              :description="exam.description"
              :type="exam.type"
              show-icon
              :closable="false"
            />

            <el-descriptions :column="2" border>
              <el-descriptions-item v-for="detail in exam.details" :key="detail.label" :label="detail.label">
                {{ detail.value }}
              </el-descriptions-item>
            </el-descriptions>

            <el-alert
              v-if="exam.warning"
              class="exam-alert"
              :title="exam.warning"
              type="warning"
              show-icon
              :closable="false"
            />
          </el-card>
        </el-col>
      </el-row>

      <el-card class="rules-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon color="#dc2626" size="24"><WarningFilled /></el-icon>
            <span>Правила проведения экзаменов</span>
          </div>
        </template>

        <el-collapse v-model="activeRules">
          <el-collapse-item title="Допуск на экзамен" name="admission">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="Документы">
                Экзаменационный лист и паспорт/ID-карта.
              </el-descriptions-item>
              <el-descriptions-item label="Получение экзаменационного листа">
                В день экзамена с 07:00 до 08:45.
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <el-collapse-item title="Категорически запрещается" name="forbidden">
            <el-alert
              type="error"
              show-icon
              :closable="false"
              title="За нарушение правил - удаление с экзамена и отстранение от конкурса"
            >
              <ul class="plain-list">
                <li>Проносить мобильные телефоны, микрокалькуляторы, компьютеры и средства связи.</li>
                <li>Покидать аудиторию во время экзамена, кроме случаев плохого самочувствия.</li>
                <li>Опаздывать к началу экзамена.</li>
              </ul>
            </el-alert>
          </el-collapse-item>

          <el-collapse-item title="Результаты ЕГЭ" name="ege">
            <p class="collapse-text">
              Поступающие, сдавшие ЕГЭ, могут заявить результаты ЕГЭ по одному или нескольким
              предметам. Баллы ЕГЭ включаются в общую сумму баллов.
            </p>
          </el-collapse-item>
        </el-collapse>
      </el-card>

      <el-row :gutter="18" class="result-row">
        <el-col :xs="24" :md="12">
          <el-card shadow="hover" class="result-card">
            <el-statistic title="Публикация рейтинговых списков" value="15 июля 2026" />
          </el-card>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-card shadow="hover" class="result-card">
            <el-statistic title="Зачисление по конкурсу" value="20-25 июля 2026" />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'

const activeRules = ref(['admission'])

const exams = [
  {
    subject: 'Математика',
    date: '03 июля',
    time: '09:00',
    format: 'Письменно',
    duration: '2 часа',
    type: 'primary',
    scope: 'Для всех направлений',
    description: 'Обязательный экзамен для всех специальностей. Результат оценивается по 100-балльной шкале.',
    details: [
      { label: 'Просмотр работ', value: '04-05 июля, 10:00-13:00' },
      { label: 'Апелляция', value: '04-05 июля, 13:00-15:00' }
    ]
  },
  {
    subject: 'Русский язык',
    date: '08 июля',
    time: '09:00',
    format: 'Письменно',
    duration: '2 часа',
    type: 'primary',
    scope: 'Для всех направлений',
    description: 'Обязательный экзамен для всех специальностей. Результат оценивается по 100-балльной шкале.',
    details: [
      { label: 'Просмотр работ', value: '09 июля, 10:00-13:00' },
      { label: 'Апелляция', value: '09 июля, 13:00-15:00' }
    ]
  },
  {
    subject: 'Английский язык',
    date: '11-12 июля',
    time: '09:00',
    format: 'Устно',
    duration: '30-40 минут подготовки',
    type: 'info',
    scope: 'Только для направлений «Экономика» и «Менеджмент»',
    description: 'Специальный экзамен для экономических направлений. Результат оценивается по 100-балльной шкале.',
    details: [
      { label: 'Содержание', value: 'Чтение, перевод, понимание текста, беседа по темам и профориентация' },
      { label: 'Апелляция', value: 'Результаты устного экзамена не подлежат апелляции' }
    ],
    warning: 'Результаты устного экзамена не подлежат апелляции'
  }
]
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

.exam-card,
.rules-card,
.result-card {
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
}

.exam-card :deep(.el-card__header),
.rules-card :deep(.el-card__header),
.result-card :deep(.el-card__header) {
  border-bottom-color: #eef2f7;
}

.exam-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.exam-header h3 {
  margin: 10px 0 4px;
  color: #111827;
  font-size: 1.35rem;
  font-weight: 650;
}

.exam-header span,
.exam-date span {
  color: #64748b;
}

.exam-date {
  text-align: right;
}

.exam-date strong {
  display: block;
  color: #123d70;
  font-size: 1.4rem;
  font-weight: 650;
}

.exam-alert {
  margin-bottom: 16px;
  border-radius: 14px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #111827;
  font-size: 1.12rem;
  font-weight: 650;
}

.plain-list {
  margin: 10px 0 0;
  padding-left: 20px;
}

.collapse-text {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.result-row {
  margin-top: 8px;
}

.section-kicker,
.exam-tag {
  border-color: rgba(18, 61, 112, 0.18);
  background: rgba(18, 61, 112, 0.06);
  color: #123d70;
}

@media (max-width: 767px) {
  .exam-header {
    flex-direction: column;
  }

  .exam-date {
    text-align: left;
  }
}
</style>
