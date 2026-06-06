<template>
  <section class="admission-section white">
    <div class="admission-container narrow">
      <div class="section-heading">
        <el-tag type="primary" effect="plain" round>Документы</el-tag>
        <h2>Необходимые документы</h2>
        <p>
          Документы предоставляются в электронном виде для очной off-line и дистанционной
          on-line подачи.
        </p>
      </div>

      <el-space direction="vertical" fill size="large" class="documents-space">
        <el-card v-for="documentItem in documents" :key="documentItem.title" class="document-card" shadow="hover">
          <template #header>
            <div class="document-header">
              <div class="document-title">
                <el-icon :class="documentItem.iconClass" size="26">
                  <component :is="documentItem.icon" />
                </el-icon>
                <div>
                  <h3>{{ documentItem.title }}</h3>
                  <el-tag :type="documentItem.tagType" round>Обязательно</el-tag>
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

      <el-card class="summary-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon color="#2563eb" size="24"><Calendar /></el-icon>
            <span>Сроки и режим работы</span>
          </div>
        </template>

        <el-row :gutter="24">
          <el-col :xs="24" :md="12">
            <el-alert
              title="Прием документов"
              description="с 16 июня по 1 июля включительно 2025 года. Документы принимаются online 24 часа в сутки."
              type="success"
              show-icon
              :closable="false"
            />
          </el-col>
          <el-col :xs="24" :md="12">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="Адрес">
                город Ташкент, Мирзо Улугбекский район, улица Дурмон йули, дом 34
              </el-descriptions-item>
              <el-descriptions-item label="Call-центр">
                <a href="tel:+998712000156">(+99871) 200-01-56</a>
              </el-descriptions-item>
              <el-descriptions-item label="Ответственное лицо">
                Копаненко Кристина Александровна
              </el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </section>
</template>

<script setup>
import { Calendar, Document, Edit, Files, Picture } from '@element-plus/icons-vue'

const documents = [
  {
    number: '01',
    title: 'Документ об образовании',
    icon: Document,
    iconClass: 'text-success',
    tagType: 'success',
    description:
      'Оригинал или копия документа государственного образца об образовании: аттестат о среднем образовании, диплом о среднем и профессиональном образовании.',
    notes: [
      {
        title: 'Для участников Губкинской олимпиады',
        description: 'Победители, призеры и участники 1-Губкинской предметной Олимпиады прилагают цветную копию диплома/сертификата.',
        type: 'info'
      },
      {
        title: 'Для второго высшего образования',
        description: 'Лица, желающие получить второе высшее образование, представляют копию диплома о высшем образовании.',
        type: 'warning'
      }
    ]
  },
  {
    number: '02',
    title: 'Документы, удостоверяющие личность',
    icon: Files,
    iconClass: 'text-warning',
    tagType: 'warning',
    description:
      'Отсканированная цветная копия первой страницы паспорта или ID-карты в формате PDF и копия нотариально заверенного перевода первой страницы паспорта/ID-карты или копия свидетельства о рождении на кириллице.',
    notes: [
      {
        title: 'Важно',
        description: 'Абитуриенты, которым исполнилось 16 лет и не имеющие паспорт или ID-карту, не будут допущены до экзаменов.',
        type: 'error'
      }
    ]
  },
  {
    number: '03',
    title: 'Фотография',
    icon: Picture,
    iconClass: 'text-purple',
    tagType: 'info',
    description: 'Фотография 3х4 см: цветное фото, белый фон, протокольный вид.'
  },
  {
    number: '04',
    title: 'Подача документов',
    icon: Edit,
    iconClass: 'text-primary',
    tagType: 'primary',
    description:
      'Абитуриент заполняет на официальном сайте Филиала gubkin.uz форму во вкладке «Абитуриенту / Онлайн подача документов» и отправляет необходимые документы в приемную комиссию.',
    notes: [
      {
        title: 'SMS-подтверждение',
        description: 'После проверки документов абитуриент получает SMS с регистрационным номером личного дела.',
        type: 'success'
      },
      {
        title: 'Выбор направлений',
        description: 'В заявлении можно указать до 3 конкурсных групп с их приоритетом.',
        type: 'info'
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

.documents-space {
  width: 100%;
}

.document-card,
.summary-card {
  border-radius: 22px;
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
  font-weight: 800;
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
  font-weight: 800;
}

.text-primary {
  color: #2563eb;
}

.text-success {
  color: #16a34a;
}

.text-warning {
  color: #d97706;
}

.text-purple {
  color: #7c3aed;
}

@media (max-width: 767px) {
  .document-header {
    align-items: flex-start;
    flex-direction: column-reverse;
  }
}
</style>
