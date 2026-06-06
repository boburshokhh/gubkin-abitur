<template>
  <section class="admission-section muted">
    <div class="admission-container">
      <div class="section-heading">
        <el-tag type="info" effect="plain" round>Контакты</el-tag>
        <h2>Контакты приемной комиссии</h2>
        <p>Свяжитесь с нами для получения дополнительной информации и технической поддержки.</p>
      </div>

      <el-row :gutter="24">
        <el-col v-for="card in contactCards" :key="card.title" :xs="24" :md="12">
          <el-card class="contact-card" shadow="hover">
            <template #header>
              <div class="contact-header">
                <el-icon :class="card.iconClass" size="28">
                  <component :is="card.icon" />
                </el-icon>
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

      <el-card class="map-card" shadow="hover">
        <template #header>
          <div class="contact-header">
            <el-icon color="#64748b" size="28"><MapLocation /></el-icon>
            <span>Расположение на карте</span>
          </div>
        </template>

        <div class="map-frame">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2995.764941041147!2d69.3396315746695!3d41.335724471306484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38aef45c4a6715f1%3A0x1539ad8e2d2b776e!2z0KTQuNC70LjQsNC7INCg0JPQoyDQvdC10YTRgtC4INC4INCz0LDQt9CwINCyINCz0L7RgNC-0LTQtSDQotCw0YjQutC10L3RgtC1LCDQuNC80LXQvdC4INCT0YPQsdC60LjQvdCw!5e0!3m2!1sru!2s!4v1749582147213!5m2!1sru!2s"
            width="100%"
            height="420"
            style="border: 0"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            title="Карта расположения филиала Губкина в Ташкенте"
          />
        </div>

        <el-alert
          class="map-alert"
          title="Адрес"
          description="г. Ташкент, Мирзо Улугбекский район, ул. Дурмон йули, 34"
          type="info"
          show-icon
          :closable="false"
        />
      </el-card>
    </div>
  </section>
</template>

<script setup>
import { Link, Location, MapLocation, Phone, Service } from '@element-plus/icons-vue'

const contactCards = [
  {
    title: 'Адрес и местоположение',
    icon: Location,
    iconClass: 'text-primary',
    items: [
      {
        label: 'Адрес',
        value: 'Город Ташкент, Мирзо Улугбекский район, улица Дурмон йули, дом 34'
      },
      { label: 'Метро', value: 'станция «Буюк ипак йули»' },
      { label: 'Транспорт', value: 'Остановка «Институт механики», автобус №25, 151, маршрутка №31м' },
      { label: 'Ориентир', value: 'рядом с Институтом микробиологии Академии наук Республики Узбекистан' }
    ]
  },
  {
    title: 'Call-центр',
    icon: Phone,
    iconClass: 'text-success',
    items: [
      { label: 'Телефон', value: '(+99871) 200-01-56', href: 'tel:+998712000156' },
      { label: 'Ответственное лицо', value: 'Гафурова Умида Ирмухаматовна' },
      { label: 'Понедельник - пятница', value: '09:00 - 18:00' },
      { label: 'Суббота', value: '09:00 - 17:00' },
      { label: 'Технический перерыв', value: '13:00 - 14:00' }
    ],
    note: {
      title: 'Воскресенье',
      description: 'Выходной день.',
      type: 'warning'
    }
  },
  {
    title: 'Онлайн-ресурсы',
    icon: Link,
    iconClass: 'text-info',
    items: [
      { label: 'Официальный сайт', value: 'https://gubkin.uz', href: 'https://gubkin.uz' },
      { label: 'Telegram-канал', value: 't.me/gubkin_uz', href: 'https://t.me/gubkin_uz' }
    ],
    note: {
      title: 'Следите за обновлениями',
      description: 'На официальных ресурсах публикуются расписание консультаций, экзаменов и важные объявления.',
      type: 'info'
    }
  },
  {
    title: 'Техническая поддержка',
    icon: Service,
    iconClass: 'text-purple',
    items: [
      { label: 'Телефон поддержки', value: '(+99871) 200-01-56', href: 'tel:+998712000156' },
      { label: 'Telegram', value: '@gubkin_uz', href: 'https://t.me/gubkin_uz' }
    ],
    note: {
      title: 'Рекомендации',
      description: 'Используйте актуальную версию браузера, проверьте интернет-соединение и подготовьте PDF-документы до 5 МБ.',
      type: 'warning'
    }
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

.contact-card {
  height: calc(100% - 24px);
  margin-bottom: 24px;
  border-radius: 22px;
}

.contact-header {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #111827;
  font-size: 1.12rem;
  font-weight: 800;
}

.contact-note {
  margin-top: 18px;
  border-radius: 14px;
}

.map-card {
  margin-top: 12px;
  border-radius: 24px;
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
  color: #2563eb;
}

.text-success {
  color: #16a34a;
}

.text-info {
  color: #0284c7;
}

.text-purple {
  color: #7c3aed;
}
</style>
