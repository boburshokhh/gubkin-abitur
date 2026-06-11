<template>
  <el-result
    icon="success"
    title="Заявление успешно отправлено!"
    :sub-title="`Ваше заявление принято на рассмотрение. Номер заявления: ${applicationNumber}`"
  >
    <template #extra>
      <div class="mx-auto max-w-2xl space-y-4 text-left">
        <el-alert
          type="warning"
          show-icon
          :closable="false"
        >
          <template #title>
            <span class="font-medium">Важная информация для абитуриентов</span>
          </template>
          <p>
            <strong><u>Не забывайте свой логин и пароль.</u></strong>
            Абитуриенты должны часто входить на сайт и проверять статус своего заявления в личном кабинете.
          </p>
        </el-alert>

        <el-card shadow="never">
          <template #header>
            <span class="font-medium">Контакты приёмной комиссии</span>
          </template>
          <el-skeleton v-if="isLoadingContacts" :rows="4" animated />
          <el-alert
            v-else-if="contactsError"
            class="mb-3"
            :title="contactsError"
            type="info"
            show-icon
            :closable="false"
          />
          <el-descriptions v-if="!isLoadingContacts" :column="1" border>
            <el-descriptions-item
              v-for="contactRow in contactRows"
              :key="contactRow.label"
              :label="contactRow.label"
            >
              <a
                v-if="contactRow.href"
                :href="contactRow.href"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ contactRow.value }}
              </a>
              <span v-else>{{ contactRow.value }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <div class="text-center">
          <el-button type="primary" size="large" @click="$router.push('/')">Вернуться на главную</el-button>
        </div>
      </div>
    </template>
  </el-result>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { fetchContacts } from '@/api/cms';

defineProps({
  applicationNumber: {
    type: [String, Number],
    required: true
  }
});

const fallbackContacts = {
  phone_main: '+998712000156',
  phone_main_label: '(+99871) 200-01-56',
  working_hours_weekday: '09:00 - 18:00',
  working_hours_saturday: '09:00 - 17:00',
  contact_person: 'Гафурова Умида Ирмухаматовна',
  address_full: 'г. Ташкент, Мирзо Улугбекский район, ул. Дурмон йули, дом 34'
};

const contacts = ref({ ...fallbackContacts });
const isLoadingContacts = ref(false);
const contactsError = ref('');

const contactRows = computed(() => {
  const contact = contacts.value || {};
  const rows = [
    {
      label: 'Телефон',
      value: contact.phone_main_label || contact.phone_main,
      href: contact.phone_main ? `tel:${contact.phone_main}` : ''
    },
    {
      label: 'Email',
      value: contact.email_main,
      href: contact.email_main ? `mailto:${contact.email_main}` : ''
    },
    {
      label: 'Режим работы',
      value: getWorkingHoursText(contact)
    },
    {
      label: 'Обеденный перерыв',
      value: contact.lunch_break || contact.break_time || contact.lunch_hours
    },
    {
      label: 'Ответственное лицо',
      value: contact.contact_person
    },
    {
      label: 'Адрес',
      value: contact.address_full
    }
  ];

  return rows.filter(row => row.value);
});

function getWorkingHoursText(contact) {
  const weekdayHours = contact.working_hours_weekday;
  const saturdayHours = contact.working_hours_saturday;

  if (weekdayHours && saturdayHours) return `пн-пт: ${weekdayHours}, сб: ${saturdayHours}`;
  if (weekdayHours) return `пн-пт: ${weekdayHours}`;
  if (saturdayHours) return `сб: ${saturdayHours}`;
  return '';
}

async function loadContacts() {
  isLoadingContacts.value = true;
  contactsError.value = '';

  try {
    const data = await fetchContacts();
    contacts.value = {
      ...fallbackContacts,
      ...(data?.contact || {})
    };
  } catch (err) {
    contacts.value = { ...fallbackContacts };
    contactsError.value = 'Не удалось загрузить контакты из базы данных. Показаны резервные контактные данные.';
    console.error('Ошибка загрузки контактов приемной комиссии:', err);
  } finally {
    isLoadingContacts.value = false;
  }
}

onMounted(loadContacts);
</script>
