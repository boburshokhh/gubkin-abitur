<template>
  <section class="admission-section white">
    <div class="admission-container narrow">
      <div class="section-heading">
        <el-tag type="primary" effect="plain" round>Подача заявления</el-tag>
        <h2>Процесс подачи документов</h2>
        <p>Пошаговая инструкция для абитуриентов 2025 года.</p>
      </div>

      <el-timeline>
        <el-timeline-item
          v-for="step in steps"
          :key="step.title"
          :timestamp="step.timestamp"
          placement="top"
          :type="step.type"
          size="large"
        >
          <el-card class="step-card" shadow="hover">
            <template #header>
              <div class="step-header">
                <el-icon size="24">
                  <component :is="step.icon" />
                </el-icon>
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

      <el-row :gutter="18" class="notice-row">
        <el-col :xs="24" :md="12">
          <el-alert
            title="Прием документов"
            description="16 июня - 01 июля 2025 включительно."
            type="error"
            show-icon
            :closable="false"
          />
        </el-col>
        <el-col :xs="24" :md="12">
          <el-alert
            title="Для участников олимпиад"
            description="Подтверждающие документы принимаются до 01 июля 2025."
            type="warning"
            show-icon
            :closable="false"
          />
        </el-col>
      </el-row>

      <el-alert
        class="final-alert"
        title="Обратите внимание"
        description="Лица, забравшие документы после завершения приема, выбывают из конкурса. Абитуриенты старше 16 лет без паспорта или ID-карты не допускаются до экзаменов."
        type="warning"
        show-icon
        :closable="false"
      />
    </div>
  </section>
</template>

<script setup>
import { CircleCheck, Document, EditPen, Finished } from '@element-plus/icons-vue'

const steps = [
  {
    timestamp: 'Шаг 1',
    title: 'Выберите направления',
    icon: CircleCheck,
    type: 'primary',
    description: 'Определитесь с конкурсными группами, на которые хотите поступить.',
    note: {
      title: 'Важно',
      description: 'Можно выбрать максимум до 3 конкурсных групп, указав приоритет направлений.',
      type: 'info'
    }
  },
  {
    timestamp: 'Шаг 2',
    title: 'Подготовьте документы',
    icon: Document,
    type: 'success',
    description: 'Соберите необходимые документы в электронном виде: PDF или JPG.',
    groups: [
      {
        title: 'Обязательные документы',
        items: ['Документ об образовании', 'Паспорт/ID и нотариальный перевод', 'Фотография 3x4 см']
      },
      {
        title: 'Для участников олимпиады',
        items: ['Диплом или сертификат олимпиады', 'Цветная копия подтверждающего документа']
      }
    ]
  },
  {
    timestamp: 'Шаг 3',
    title: 'Заполните форму на сайте',
    icon: EditPen,
    type: 'warning',
    description: 'Перейдите на gubkin.uz и заполните форму во вкладке «Абитуриенту / Онлайн подача документов».',
    note: {
      title: 'Режим online-приема',
      description: '24 часа в сутки в период с 16 июня по 01 июля 2025 года.',
      type: 'success'
    }
  },
  {
    timestamp: 'Шаг 4',
    title: 'Получите подтверждение',
    icon: Finished,
    type: 'success',
    description: 'После проверки документов получите SMS-подтверждение о регистрации.',
    note: {
      title: 'SMS-уведомление',
      description: 'Сообщение придет на номер телефона из заявления с регистрационным номером личного дела.',
      type: 'success'
    }
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
  font-weight: 800;
}

.section-heading p {
  margin: 0;
  color: #64748b;
  font-size: 1.1rem;
  line-height: 1.7;
}

.step-card {
  border-radius: 20px;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #111827;
  font-size: 1.15rem;
  font-weight: 800;
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
</style>
