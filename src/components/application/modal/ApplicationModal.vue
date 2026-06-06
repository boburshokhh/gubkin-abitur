<template>
  <el-dialog
    :model-value="show"
    :title="`Заявка №${application?.id?.substring(0, 8) || ''}`"
    width="min(1180px, 96vw)"
    class="application-modal"
    destroy-on-close
    @close="close"
  >
    <el-skeleton v-if="isUpdating && !application" :rows="8" animated />

    <div v-else class="application-modal__content">
      <section class="application-modal__summary">
        <div class="application-modal__summary-main">
          <div>
            <el-text type="info" size="small">Абитуриент</el-text>
            <h2 class="application-modal__applicant-name">
              {{ getUserFullName(applicant) }}
            </h2>
          </div>

          <el-space wrap>
            <el-tag :type="getStatusType(application?.status_id)" effect="light" size="large">
              {{ getStatusName(application?.status_id) }}
            </el-tag>
            <el-tag :type="missingRequiredFiles.length ? 'danger' : 'success'" effect="light" size="large">
              Документы {{ requiredFilesLoaded }}/{{ requiredFilesTotal }}
            </el-tag>
            <el-tag v-if="application?.accommodation_needed" type="info" effect="light" size="large">
              Общежитие
            </el-tag>
          </el-space>
        </div>

        <div class="application-modal__summary-grid">
          <div class="application-modal__summary-item">
            <el-text type="info" size="small">Дата подачи</el-text>
            <strong>{{ formatDate(application?.created_at) }}</strong>
          </div>
          <div class="application-modal__summary-item">
            <el-text type="info" size="small">Телефон</el-text>
            <strong>{{ application?.phone || applicant?.phone || 'Не указан' }}</strong>
          </div>
          <div class="application-modal__summary-item">
            <el-text type="info" size="small">Email</el-text>
            <strong>{{ application?.email || applicant?.email || 'Не указан' }}</strong>
          </div>
          <div class="application-modal__summary-item">
            <el-text type="info" size="small">Приоритет 1</el-text>
            <strong>{{ primaryChoice ? getProfileFullName(primaryChoice) : 'Не выбран' }}</strong>
          </div>
          <div class="application-modal__summary-item">
            <el-text type="info" size="small">Форма обучения</el-text>
            <strong>{{ getStudyFormText(application?.study_form) }}</strong>
          </div>
          <div class="application-modal__summary-item">
            <el-text type="info" size="small">Финансирование</el-text>
            <strong>{{ getFundingFormText(application?.funding_form) }}</strong>
          </div>
        </div>
      </section>
      <el-card shadow="never">
        <template #header>
          <div class="application-modal__card-header">
            <span>Личные данные</span>
            <el-tag v-if="application?.accommodation_needed" type="info" effect="light">
              Нуждается в общежитии
            </el-tag>
          </div>
        </template>

        <el-descriptions :column="descriptionColumns" border>
          <el-descriptions-item label="Ф.И.О.">
            {{ getUserFullName(applicant) }}
          </el-descriptions-item>
          <el-descriptions-item label="Дата рождения">
            {{ formatDate(application?.birth_date || applicant?.birth_date) }}
          </el-descriptions-item>
          <el-descriptions-item label="Регион">
            {{ regionName }}
          </el-descriptions-item>
          <el-descriptions-item label="Адрес">
            {{ application?.address || 'Не указан' }}
          </el-descriptions-item>
          <el-descriptions-item label="Телефон">
            {{ application?.phone || applicant?.phone || 'Не указан' }}
          </el-descriptions-item>
          <el-descriptions-item label="Телефон родителя">
            {{ application?.parent_phone || 'Не указан' }}
          </el-descriptions-item>
          <el-descriptions-item label="Email">
            {{ application?.email || applicant?.email || 'Не указан' }}
          </el-descriptions-item>
          <el-descriptions-item label="Пол">
            {{ getGenderText(application?.gender || applicant?.gender) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card shadow="never">
        <template #header>Паспортные данные</template>
        <el-descriptions :column="descriptionColumns" border>
          <el-descriptions-item label="Серия и номер">
            {{ application?.passport_series || 'Не указано' }}
          </el-descriptions-item>
          <el-descriptions-item label="Дата выдачи">
            {{ formatDate(application?.passport_issue_date) }}
          </el-descriptions-item>
          <el-descriptions-item label="Кем выдан">
            {{ application?.passport_issued_by || 'Не указано' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card shadow="never">
        <template #header>Образование</template>
        <el-descriptions :column="descriptionColumns" border>
          <el-descriptions-item label="Уровень образования">
            {{ getEducationLevelName(application?.education_level) }}
          </el-descriptions-item>
          <el-descriptions-item label="Учебное заведение">
            {{ application?.education_institution || 'Не указано' }}
          </el-descriptions-item>
          <el-descriptions-item label="Год окончания">
            {{ application?.education_graduation_year || 'Не указан' }}
          </el-descriptions-item>
          <el-descriptions-item label="Документ об образовании">
            {{ getEducationDocumentText() }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card shadow="never">
        <template #header>Выбранные образовательные программы</template>
        <el-empty
          v-if="!applicationChoices.length"
          description="Образовательные программы не выбраны"
        />
        <el-table v-else :data="applicationChoices" border stripe>
          <el-table-column label="Приоритет" width="120">
            <template #default="{ row }">
              <el-tag type="primary" effect="light">{{ row.priority }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Профиль">
            <template #default="{ row }">
              {{ getProfileFullName(row) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card shadow="never">
        <template #header>Информация о заявке</template>
        <el-descriptions :column="descriptionColumns" border>
          <el-descriptions-item label="Статус">
            <el-tag :type="getStatusType(application?.status_id)" effect="light">
              {{ getStatusName(application?.status_id) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Дата подачи">
            {{ formatDate(application?.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="Форма обучения">
            {{ getStudyFormText(application?.study_form) }}
          </el-descriptions-item>
          <el-descriptions-item label="Форма финансирования">
            {{ getFundingFormText(application?.funding_form) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="application?.admin_comment" label="Комментарий администратора">
            <el-alert :title="application.admin_comment" type="warning" show-icon :closable="false" />
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-alert
        v-if="application?.olympiad_participant"
        title="Участвовал(а) в олимпиаде Университета Губкина"
        description="Победители, призёры и участники 1-Губкинской предметной Олимпиады прилагают цветную копию диплома/сертификата."
        type="success"
        show-icon
        :closable="false"
      />

      <el-card class="application-modal__documents-card" shadow="never">
        <template #header>Загруженные документы и файлы</template>

        <el-alert
          v-if="missingRequiredFiles.length"
          type="warning"
          show-icon
          :closable="false"
          class="application-modal__documents-alert"
        >
          <template #title>
            Не хватает обязательных документов: {{ missingRequiredFiles.map(item => item.label).join(', ') }}
          </template>
        </el-alert>

        <el-collapse model-value="required-files">
          <el-collapse-item name="required-files" title="Обязательные документы">
            <el-table :data="requiredFileRows" border stripe>
              <el-table-column label="Документ" min-width="220">
                <template #default="{ row }">
                  <el-space direction="vertical" alignment="flex-start" :size="2">
                    <el-text>{{ row.label }}</el-text>
                    <el-text type="info" size="small">{{ row.description }}</el-text>
                  </el-space>
                </template>
              </el-table-column>
              <el-table-column label="Статус" width="150">
                <template #default="{ row }">
                  <el-tag :type="row.files.length ? 'success' : row.required ? 'danger' : 'info'" effect="light">
                    {{ row.files.length ? 'Загружен' : row.required ? 'Отсутствует' : 'Не загружен' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="Файлы" min-width="280">
                <template #default="{ row }">
                  <el-empty v-if="!row.files.length" :description="row.emptyText" :image-size="48" />
                  <el-space v-else wrap>
                    <el-tag
                      v-for="file in row.files"
                      :key="file.id || file.file_path"
                      :type="getFileTypeTagType(file.file_name)"
                      effect="light"
                    >
                      {{ getFileDisplayName(file) }}
                    </el-tag>
                  </el-space>
                </template>
              </el-table-column>
              <el-table-column label="Действия" width="190" fixed="right">
                <template #default="{ row }">
                  <el-space v-if="row.files.length" wrap>
                    <el-button
                      v-for="file in row.files"
                      :key="`view-${file.id || file.file_path}`"
                      type="primary"
                      link
                      :icon="View"
                      tag="a"
                      :href="getApplicationFileUrl(file)"
                      target="_blank"
                    >
                      Открыть
                    </el-button>
                  </el-space>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>

          <el-collapse-item name="extra-documents" title="Дополнительные документы">
            <el-empty v-if="extraDocumentRows.length === 0" description="Дополнительные документы не загружены" />
            <el-table v-else :data="extraDocumentRows" border stripe>
              <el-table-column prop="name" label="Файл" min-width="240" />
              <el-table-column label="Тип" width="180">
                <template #default="{ row }">
                  <el-tag :type="getFileTypeTagType(row.fileName)" effect="light">
                    {{ row.typeLabel }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="Дата" width="150">
                <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
              </el-table-column>
              <el-table-column label="Размер" width="120">
                <template #default="{ row }">{{ formatFileSize(row.size) }}</template>
              </el-table-column>
              <el-table-column label="Действия" width="190" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" link :icon="View" tag="a" :href="row.url" target="_blank">
                    Открыть
                  </el-button>
                  <el-button type="info" link :icon="Download" tag="a" :href="row.url" target="_blank" download>
                    Скачать
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>

          <el-collapse-item name="checklist" title="Проверка комплектности">
            <el-space wrap>
              <el-tag
                v-for="item in requiredFileRows"
                :key="item.category"
                :type="item.files.length ? 'success' : item.required ? 'danger' : 'info'"
                effect="light"
              >
                {{ item.label }}: {{ item.files.length ? 'загружен' : item.required ? 'отсутствует' : 'не загружен' }}
              </el-tag>
            </el-space>
          </el-collapse-item>
        </el-collapse>
      </el-card>

      <el-card v-if="documentSuggestions.length" shadow="never">
        <template #header>Автоматические подсказки</template>
        <el-alert
          v-for="suggestion in documentSuggestions"
          :key="suggestion.category"
          type="warning"
          show-icon
          :closable="false"
          class="application-modal__suggestion"
        >
          <template #title>{{ suggestion.title }}</template>
          <template #default>{{ suggestion.description }}</template>
        </el-alert>
      </el-card>

      <el-card shadow="never">
        <template #header>Комментарии сотрудников</template>
        <el-form label-position="top">
          <el-form-item label="Новый внутренний комментарий">
            <el-input
              v-model="staffComment"
              type="textarea"
              :rows="3"
              placeholder="Добавьте заметку для коллег. Абитуриент её не увидит."
            />
          </el-form-item>
          <el-space wrap>
            <el-button
              type="primary"
              :disabled="!staffComment.trim()"
              :loading="isUpdating"
              @click="addStaffComment"
            >
              Добавить комментарий
            </el-button>
            <el-button
              v-for="template in staffCommentTemplates"
              :key="template"
              @click="staffComment = template"
            >
              {{ template }}
            </el-button>
          </el-space>
        </el-form>

        <el-divider v-if="staffComments.length" />

        <el-timeline v-if="staffComments.length">
          <el-timeline-item
            v-for="item in staffComments"
            :key="item.id"
            :timestamp="formatDateTime(item.created_at)"
            placement="top"
          >
            <el-space direction="vertical" alignment="flex-start">
              <el-text>{{ item.comment }}</el-text>
              <el-text v-if="item.created_by_user" type="info" size="small">
                {{ getUserFullName(item.created_by_user) }}
              </el-text>
            </el-space>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="Внутренних комментариев пока нет" />
      </el-card>

      <el-card v-if="activityTimeline.length" shadow="never">
        <template #header>Расширенная история</template>
        <el-timeline>
          <el-timeline-item
            v-for="historyItem in activityTimeline"
            :key="`${historyItem.event_type}-${historyItem.id || historyItem.created_at}`"
            :timestamp="formatDateTime(historyItem.created_at)"
            placement="top"
          >
            <el-card shadow="never">
              <el-space direction="vertical" alignment="flex-start">
                <el-tag :type="getTimelineTagType(historyItem.event_type)" effect="light">
                  {{ getTimelineTitle(historyItem) }}
                </el-tag>
                <el-text v-if="getTimelineDescription(historyItem)">
                  {{ getTimelineDescription(historyItem) }}
                </el-text>
                <el-text v-else type="info">Без дополнительных деталей</el-text>
                <el-text v-if="historyItem.created_by_user" type="info" size="small">
                  {{ getUserFullName(historyItem.created_by_user) }}
                </el-text>
              </el-space>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-card>

      <el-card class="application-modal__actions-card" shadow="never">
        <template #header>Обновление статуса</template>

        <div class="application-modal__quick-check">
          <el-text type="info" size="small">Комплектность</el-text>
          <strong>{{ documentsStatusText }}</strong>
          <el-space wrap :size="4">
            <el-tag
              v-for="item in requiredFileRows"
              :key="`quick-top-${item.category}`"
              :type="item.files.length ? 'success' : item.required ? 'danger' : 'info'"
              effect="light"
            >
              {{ item.label }}
            </el-tag>
          </el-space>
        </div>

        <el-divider />

        <el-form label-position="top">
          <el-form-item label="Изменить статус">
            <el-select v-model="newStatus" class="application-modal__field">
              <el-option
                v-for="status in statuses"
                :key="status.id"
                :label="status.name"
                :value="status.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="Комментарий">
            <el-input
              v-model="comment"
              type="textarea"
              :rows="3"
              placeholder="Добавьте комментарий к изменению статуса..."
            />
          </el-form-item>
        </el-form>

        <el-space direction="vertical" fill class="application-modal__action-buttons">
          <el-button
            type="primary"
            :loading="isUpdating"
            :disabled="newStatus === application?.status_id"
            @click="updateStatus"
          >
            Обновить статус
          </el-button>
          <el-button
            :icon="Download"
            :disabled="!application"
            @click="downloadStudentData"
          >
            Скачать данные студента
          </el-button>
          <el-button @click="close">Закрыть</el-button>
        </el-space>

      </el-card>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { appApi } from '@/api/app-api';
import { Download, View } from '@element-plus/icons-vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  application: {
    type: Object,
    default: null
  },
  statuses: {
    type: Array,
    required: true
  },
  isUpdating: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'update-status', 'add-staff-comment']);

// Локальное состояние
const newStatus = ref(props.application?.status_id || null);
const comment = ref(props.application?.admin_comment || '');
const staffComment = ref('');
const staffCommentTemplates = [
  'Проверить качество сканов документов',
  'Связаться с абитуриентом по телефону',
  'Ожидаем исправленные документы'
];

const descriptionColumns = computed(() => (window.innerWidth < 768 ? 1 : 2));

const requiredFileRows = computed(() => [
  {
    category: 'passport_scan',
    label: 'Скан паспорта',
    description: 'Первая страница паспорта',
    required: true,
    emptyText: 'Скан паспорта не загружен',
    files: getFilesByCategory('passport_scan')
  },
  {
    category: 'passport_translation',
    label: 'Нотариально заверенный перевод паспорта',
    description: 'Необязательный документ',
    required: false,
    emptyText: 'Перевод не загружен',
    files: getFilesByCategory('passport_translation')
  },
  {
    category: 'photo',
    label: 'Фотография 3x4',
    description: 'Фотография абитуриента',
    required: true,
    emptyText: 'Фотография не загружена',
    files: getFilesByCategory('photo')
  },
  {
    category: 'education_scan',
    label: 'Документ об образовании',
    description: 'Скан документа об образовании',
    required: true,
    emptyText: 'Документ об образовании не загружен',
    files: getFilesByCategory('education_scan')
  }
]);

const applicant = computed(() => props.application?.user || props.application?.users || {});
const applicationChoices = computed(() => (
  props.application?.application_choices || props.application?.choices || []
));
const primaryChoice = computed(() => (
  applicationChoices.value.find(choice => Number(choice.priority) === 1) || applicationChoices.value[0] || null
));
const requiredFilesTotal = computed(() => requiredFileRows.value.filter(item => item.required).length);
const requiredFilesLoaded = computed(() => (
  requiredFileRows.value.filter(item => item.required && item.files.length).length
));
const missingRequiredFiles = computed(() => (
  requiredFileRows.value.filter(item => item.required && !item.files.length)
));
const documentsStatusText = computed(() => (
  missingRequiredFiles.value.length
    ? `Не хватает ${missingRequiredFiles.value.length} из ${requiredFilesTotal.value}`
    : 'Комплект документов загружен'
));
const documentSuggestions = computed(() => missingRequiredFiles.value.map(item => ({
  category: item.category,
  title: `Запросить документ: ${item.label}`,
  description: `В заявке отсутствует обязательный файл "${item.label}". Рекомендуется перевести заявку в статус "Требует доработки" и указать это в комментарии.`
})));
const staffComments = computed(() => props.application?.staff_comments || []);
const activityTimeline = computed(() => {
  if (props.application?.activity_timeline?.length) {
    return props.application.activity_timeline;
  }

  return (props.application?.application_history || []).map(item => ({
    ...item,
    event_type: 'status_changed'
  }));
});

const regionName = computed(() => {
  const region = props.application?.region
    || props.application?.regions
    || props.application?.user?.region
    || props.application?.users?.regions;

  return region?.name || 'Не указан';
});

const extraDocumentRows = computed(() => {
  const documentsRows = (props.application?.documents || []).map(doc => ({
    id: doc.id,
    name: doc.file_name || doc.document_types?.name || 'Документ',
    fileName: doc.file_name,
    typeLabel: doc.document_types?.name || getDocumentStatus(doc.status),
    createdAt: doc.created_at,
    size: doc.file_size,
    url: getDocumentUrl(doc)
  }));

  const generalFilesRows = getFilesByCategory('general').map(file => ({
    id: file.id,
    name: file.file_name || 'Общий файл',
    fileName: file.file_name,
    typeLabel: getFileCategoryName(file.file_category || 'general'),
    createdAt: file.created_at,
    size: file.file_size,
    url: getApplicationFileUrl(file)
  }));

  const certificateRows = (props.application?.olympiad_certificates || []).map(cert => ({
    id: cert.id,
    name: cert.file_name || cert.name || 'Сертификат олимпиады',
    fileName: cert.file_name,
    typeLabel: 'Сертификат олимпиады',
    createdAt: cert.created_at,
    size: cert.file_size,
    url: getOlympiadCertificateUrl(cert)
  }));

  return [...documentsRows, ...generalFilesRows, ...certificateRows];
});

// Удалены неиспользуемые переменные для модального окна просмотра документов

// Обновляем локальное состояние при изменении заявки
watch(() => props.application, (newApplication) => {
  if (newApplication) {
    console.log('ApplicationModal получил новые данные заявки:', newApplication);
    console.log('Документы в модальном окне:', newApplication.documents?.length || 0);
    console.log('Файлы заявления в модальном окне:', newApplication.application_files?.length || 0);
    console.log('Сертификаты олимпиад в модальном окне:', newApplication.olympiad_certificates?.length || 0);
    
    newStatus.value = newApplication.status_id;
    comment.value = newApplication.admin_comment || '';
  }
}, { deep: true });

// Функции для работы с интерфейсом
function close() {
  emit('close');
}

function updateStatus() {
  if (!newStatus.value) return;
  
  // Просто уведомляем родительский компонент о необходимости обновления
  // Родительский компонент сам выполнит API вызов
  emit('update-status', { 
    applicationId: props.application.id, 
    statusId: newStatus.value,
    comment: comment.value 
  });
}

function addStaffComment() {
  const trimmedComment = staffComment.value.trim();
  if (!trimmedComment || !props.application?.id) return;

  emit('add-staff-comment', {
    applicationId: props.application.id,
    comment: trimmedComment
  });
  staffComment.value = '';
}

// Получение полного имени пользователя
function getUserFullName(user) {
  // Приоритет: данные из заявки, затем из пользователя
  const firstName = props.application?.first_name || user?.first_name || '';
  const lastName = props.application?.last_name || user?.last_name || '';
  const middleName = props.application?.middle_name || user?.middle_name || '';
  
  const fullName = `${lastName} ${firstName} ${middleName}`.trim();
  
  if (!fullName) return 'Неизвестный пользователь';
  return fullName;
}

// Получение названия региона
function getRegionName() {
  return regionName.value;
}

// Получение названия уровня образования
function getEducationLevelName(level) {
  const levels = {
    'high-school': 'Среднее общее (11 классов)',
    'college': 'Среднее профессиональное (колледж, техникум)',
    'bachelor': 'Высшее - бакалавриат',
    'master': 'Высшее - магистратура'
  };
  return levels[level] || 'Не указан';
}

function getGenderText(gender) {
  if (gender === 'male') return 'Мужской';
  if (gender === 'female') return 'Женский';
  return 'Не указан';
}

function getEducationDocumentText() {
  const number = props.application?.education_document_number || props.application?.document_number || 'Не указан';
  const date = props.application?.education_document_date || props.application?.document_date;
  if (!date) return number;
  return `${number} от ${formatDate(date)}`;
}

// Получение полного названия профиля с направлением
function getProfileFullName(choice) {
  const profile = choice?.profiles || choice?.profile;
  if (!profile) return 'Профиль не найден';

  const direction = profile.directions || profile.direction;
  if (direction) {
    return `${profile.name} (${direction.name || direction.code})`;
  }

  return profile.name;
}

function downloadStudentData() {
  if (!props.application) return;

  const lines = [
    ['Заявка', props.application.id],
    ['Ф.И.О.', getUserFullName(applicant.value)],
    ['Email', props.application.email || applicant.value.email || 'Не указан'],
    ['Телефон', props.application.phone || applicant.value.phone || 'Не указан'],
    ['Телефон родителя', props.application.parent_phone || 'Не указан'],
    ['Дата рождения', formatDate(props.application.birth_date || applicant.value.birth_date)],
    ['Пол', getGenderText(props.application.gender || applicant.value.gender)],
    ['Регион', regionName.value],
    ['Адрес', props.application.address || 'Не указан'],
    ['Паспорт', props.application.passport_series || 'Не указано'],
    ['Дата выдачи паспорта', formatDate(props.application.passport_issue_date)],
    ['Кем выдан паспорт', props.application.passport_issued_by || 'Не указано'],
    ['Учебное заведение', props.application.education_institution || 'Не указано'],
    ['Год окончания', props.application.education_graduation_year || 'Не указан'],
    ['Документ об образовании', getEducationDocumentText()],
    ['Форма обучения', getStudyFormText(props.application.study_form)],
    ['Форма финансирования', getFundingFormText(props.application.funding_form)],
    ['Статус', getStatusName(props.application.status_id)],
    ['Дата подачи', formatDate(props.application.created_at)],
    ['Выбранные программы', applicationChoices.value.map(choice => `${choice.priority}. ${getProfileFullName(choice)}`).join('; ') || 'Не выбраны']
  ];

  const content = lines
    .map(([label, value]) => `${label}: ${value ?? 'Не указано'}`)
    .join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `student-${props.application.id || 'application'}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Форматирование даты
function formatDate(dateString) {
  if (!dateString) return 'Не указана';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}

function formatDateTime(dateString) {
  if (!dateString) return 'Не указана';

  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getTimelineTagType(eventType) {
  const typeMap = {
    status_changed: 'primary',
    staff_comment: 'warning',
    document_uploaded: 'success',
    education_document_uploaded: 'success'
  };
  return typeMap[eventType] || 'info';
}

function getTimelineTitle(item) {
  if (item.event_type === 'staff_comment') return 'Комментарий сотрудника';
  if (item.event_type === 'document_uploaded') return 'Загружен файл заявления';
  if (item.event_type === 'education_document_uploaded') return 'Загружен документ об образовании';

  return `${item.old_status?.name || 'Новый'} → ${item.new_status?.name || 'Неизвестно'}`;
}

function getTimelineDescription(item) {
  if (item.event_type === 'document_uploaded' || item.event_type === 'education_document_uploaded') {
    return [item.title, getFileCategoryName(item.subtitle)].filter(Boolean).join(' · ');
  }

  return item.comment || '';
}

// Получение имени статуса по ID
function getStatusName(statusId) {
  const status = props.statuses.find(s => s.id === statusId);
  return status ? status.name : 'Неизвестный статус';
}

function getStatusType(statusId) {
  const status = props.statuses.find(s => s.id === statusId);
  if (!status) return 'info';
  
  switch (status.name) {
    case 'Подано':
      return 'primary';
    case 'Принято':
      return 'success';
    case 'Отклонено':
      return 'danger';
    case 'Требует доработки':
      return 'warning';
    default:
      return 'info';
  }
}

// Получение текста для формы обучения
function getStudyFormText(form) {
  const formMap = {
    'full-time': 'Очная',
    'part-time': 'Заочная',
    'distance': 'Дистанционная'
  };
  return formMap[form] || 'Не указана';
}

// Получение текста для типа финансирования
function getFundingFormText(form) {
  const formMap = {
    'budget': 'Бюджет',
    'contract': 'Контракт'
  };
  return formMap[form] || 'Не указан';
}

// Получение статуса документа
function getDocumentStatus(status) {
  const statusMap = {
    'pending': 'На рассмотрении',
    'approved': 'Одобрен',
    'rejected': 'Отклонен'
  };
  return statusMap[status] || 'Неизвестен';
}

// Форматирование размера файла
function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '0 Б';
  
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Получение файлов по категории
function getFilesByCategory(category) {
  if (!props.application?.application_files) return [];
  
  return props.application.application_files.filter(file => {
    // Маппинг старых имён на новые категории
    if (category === 'passport_scan') {
      return file.file_category === 'passport_scan' || file.file_category === 'passportScan';
    }
    if (category === 'passport_translation') {
      return file.file_category === 'passport_translation' || file.file_category === 'passportTranslation';
    }
    if (category === 'photo') {
      return file.file_category === 'photo' || file.file_category === 'photoFile';
    }
    if (category === 'education_scan') {
      return file.file_category === 'education_scan' || file.file_category === 'educationScan';
    }
    return file.file_category === category || (!file.file_category && category === 'general');
  });
}

// Получение названия категории файла
function getFileCategoryName(category) {
  const categoryMap = {
    'passport_scan': 'Скан паспорта',
    'passportScan': 'Скан паспорта',
    'passport_translation': 'Нотариально заверенный перевод паспорта',
    'passportTranslation': 'Нотариально заверенный перевод паспорта',
    'photo': 'Фотография 3x4',
    'photoFile': 'Фотография 3x4',
    'education_scan': 'Скан документа об образовании',
    'educationScan': 'Скан документа об образовании',
    'general': 'Общий файл'
  };
  return categoryMap[category] || 'Неизвестная категория';
}

// Получение URL документа (аналогично ApplicationDetailsPage.vue)
function getDocumentUrl(document) {
  try {
    if (!document.file_path) {
      console.error('Отсутствует путь к файлу:', document);
      return '#';
    }
    
    const { data } = appApi.storage
      .from('application_documents')
      .getPublicUrl(document.file_path);
    
    return data?.publicUrl || '#';
  } catch (error) {
    console.error('Ошибка при получении URL документа:', error);
    return '#';
  }
}

// Получение URL файла заявления (аналогично ApplicationDetailsPage.vue)
function getApplicationFileUrl(file) {
  try {
    if (!file.file_path) {
      console.error('Отсутствует путь к файлу приложения:', file);
      return '#';
    }
    
    const { data } = appApi.storage
      .from('application_files')
      .getPublicUrl(file.file_path);
    
    return data?.publicUrl || '#';
  } catch (error) {
    console.error('Ошибка при получении URL файла приложения:', error);
    return '#';
  }
}

// Получение URL сертификата олимпиады (аналогично ApplicationDetailsPage.vue)
function getOlympiadCertificateUrl(cert) {
  try {
    if (!cert.file_path) {
      console.error('Отсутствует путь к файлу сертификата:', cert);
      return '#';
    }
    
    // Согласно коду из appApi.js, сертификаты хранятся в application_files bucket
    const { data } = appApi.storage
      .from('application_files')
      .getPublicUrl(cert.file_path);
    
    return data?.publicUrl || '#';
  } catch (error) {
    console.error('Ошибка при получении URL сертификата олимпиады:', error);
    return '#';
  }
}

// Функции для определения типа файла (аналогично ApplicationDetailsPage.vue)
function getFileType(filename) {
  if (!filename) return 'other';
  
  const extension = getFileExtension(filename).toLowerCase();
  
  if (['pdf'].includes(extension)) {
    return 'pdf';
  } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
    return 'image';
  } else if (['doc', 'docx', 'rtf', 'txt'].includes(extension)) {
    return 'doc';
  } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
    return 'sheet';
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
    return 'archive';
  }
  
  return 'other';
}

// Получение расширения файла
function getFileExtension(filename) {
  if (!filename) return '';
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.substring(lastDotIndex + 1).toUpperCase() : '';
}

// Получение отображаемого имени файла
function getFileDisplayName(file) {
  // Определяем тип файла по категории
  if (file.file_category === 'photo') {
    return 'Фотография 3×4';
  } else if (file.file_category === 'education_scan') {
    return 'Документ об образовании';
  } else if (file.file_category === 'passport_scan') {
    return 'Скан паспорта';
  } else if (file.file_category === 'passport_translation') {
    return 'Нотариально заверенный перевод паспорта';
  } else if (file.file_category === 'additional') {
    return 'Дополнительный документ';
  }
  return file.file_name || 'Файл';
}

function getFileTypeTagType(filename) {
  const type = getFileType(filename);
  const typeMap = {
    pdf: 'danger',
    image: 'primary',
    doc: 'info',
    sheet: 'success',
    archive: 'warning',
    other: 'info'
  };
  
  return typeMap[type] || 'info';
}
</script>

<style scoped>
.application-modal__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 4px;
}

.application-modal__content > .el-card:not(.application-modal__actions-card),
.application-modal__content > .el-alert {
  grid-column: 1;
}

.application-modal__summary {
  display: grid;
  grid-column: 1 / -1;
  gap: 16px;
  padding: 18px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  background: var(--el-fill-color-extra-light);
}

.application-modal__summary-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.application-modal__applicant-name {
  margin: 4px 0 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.application-modal__summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.application-modal__summary-item {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.application-modal__summary-item strong {
  overflow: hidden;
  color: var(--el-text-color-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.application-modal__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.application-modal__documents-card {
  grid-column: 1;
  grid-row: 2;
}

.application-modal__documents-alert {
  margin-bottom: 16px;
}

.application-modal__suggestion + .application-modal__suggestion {
  margin-top: 12px;
}

.application-modal__actions-card {
  position: sticky;
  top: 0;
  z-index: 1;
  grid-column: 2 !important;
  grid-row: 2 / span 8;
  align-self: start;
  max-height: calc(70vh - 8px);
  overflow: hidden;
}

.application-modal__actions-card :deep(.el-card__body) {
  max-height: calc(70vh - 72px);
  overflow-y: auto;
}

.application-modal__action-buttons {
  width: 100%;
}

.application-modal__quick-check {
  display: grid;
  gap: 8px;
}

.application-modal__field {
  width: 100%;
}

@media (max-width: 1100px) {
  .application-modal__content {
    grid-template-columns: 1fr;
  }

  .application-modal__content > .el-card,
  .application-modal__content > .el-alert,
  .application-modal__summary,
  .application-modal__documents-card,
  .application-modal__actions-card {
    grid-column: 1 !important;
    grid-row: auto;
  }

  .application-modal__actions-card {
    position: static;
  }

  .application-modal__summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .application-modal__content {
    max-height: 65vh;
  }

  .application-modal__summary-main {
    flex-direction: column;
  }

  .application-modal__summary-grid {
    grid-template-columns: 1fr;
  }
}
</style> 
