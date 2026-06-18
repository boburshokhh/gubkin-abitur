<template>
  <el-card shadow="never">
    <el-table
      v-loading="loading"
      :data="applications"
      row-key="id"
      border
      stripe
      empty-text="Заявки не найдены"
    >
      <el-table-column label="Абитуриент" min-width="260">
        <template #default="{ row }">
          <el-space direction="vertical" alignment="flex-start" :size="2">
            <el-text tag="strong">{{ row.applicant_full_name || getApplicantName(row) }}</el-text>
            <el-text type="info" size="small">№{{ row.id?.substring(0, 8) }}</el-text>
          </el-space>
        </template>
      </el-table-column>

      <el-table-column label="Статус" width="180">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status?.name || row.status_name)" effect="light">
            {{ row.status?.name || row.status_name || 'Не указан' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Приоритет 1" min-width="260">
        <template #default="{ row }">
          <el-space v-if="getPrimaryChoice(row)" direction="vertical" alignment="flex-start" :size="2">
            <el-text>{{ getProfileName(getPrimaryChoice(row)) }}</el-text>
            <el-text type="info" size="small">{{ getDirectionName(getPrimaryChoice(row)) }}</el-text>
          </el-space>
          <el-text v-else type="info">Не выбран</el-text>
        </template>
      </el-table-column>

      <el-table-column label="Документы" width="190">
        <template #default="{ row }">
          <el-space direction="vertical" alignment="flex-start" :size="4">
            <el-tag :type="getDocumentsTagType(row)" effect="light">
              {{ getDocumentsSummaryText(row) }}
            </el-tag>
            <el-text
              v-if="getMissingDocumentsText(row)"
              type="danger"
              size="small"
              class="applications-table__muted-line"
            >
              Нет: {{ getMissingDocumentsText(row) }}
            </el-text>
          </el-space>
        </template>
      </el-table-column>

      <el-table-column label="Дата подачи" width="160">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>

      <el-table-column label="Последнее изменение" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.updated_at || row.created_at) }}
        </template>
      </el-table-column>

      <el-table-column label="Действия" width="260" align="right" fixed="right">
        <template #default="{ row }">
          <el-space wrap>
            <el-button type="primary" link @click="$emit('view-application', row)">
              Открыть
            </el-button>
            <el-button
              v-if="canQuickAccept(row)"
              type="success"
              link
              @click="confirmQuickStatus(row, 'Принято')"
            >
              Принять
            </el-button>
            <el-button
              v-if="canRequestRevision(row)"
              type="warning"
              link
              @click="promptRevisionComment(row)"
            >
              На доработку
            </el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>

    <application-pagination
      v-if="totalItems > 0"
      embedded
      :current-page="currentPage"
      :page-size="pageSize"
      :total-items="totalItems"
      @change-page="$emit('change-page', $event)"
      @change-page-size="$emit('change-page-size', $event)"
    />
  </el-card>
</template>

<script setup>
import { ElMessageBox } from 'element-plus';
import ApplicationPagination from '../pagination/ApplicationPagination.vue';

const props = defineProps({
  applications: {
    type: Array,
    required: true
  },
  statuses: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  totalItems: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits([
  'view-application',
  'quick-status-update',
  'change-page',
  'change-page-size'
]);

const getStatusType = (statusName) => {
  const types = {
    'Черновик': 'info',
    'Подано': 'primary',
    'Принято': 'success',
    'Отклонено': 'danger',
    'Требует доработки': 'warning',
    'Отозвано': 'info',
  };
  return types[statusName] || 'info';
};

// Получение имени абитуриента в разных форматах данных
const getApplicantName = (app) => {
  // Сначала проверяем поле applicant_full_name (заполняется в ApplicationsManager)
  if (app.applicant_full_name) {
    return app.applicant_full_name;
  }
  
  // Проверяем наличие объекта user с полным именем
  if (app.user) {
    if (app.user.full_name) return app.user.full_name;
    if (app.user.first_name || app.user.last_name) {
      return `${app.user.last_name || ''} ${app.user.first_name || ''}${app.user.middle_name ? ' ' + app.user.middle_name : ''}`.trim();
    }
  }
  
  // Проверяем наличие объекта users
  if (app.users) {
    return `${app.users.last_name || ''} ${app.users.first_name || ''}${app.users.middle_name ? ' ' + app.users.middle_name : ''}`.trim();
  }
  
  // Резервный вариант - показываем user_id если есть
  if (app.user_id) {
    return `Пользователь ${app.user_id.substring(0, 8)}...`;
  }
  
  // Если данные отсутствуют
  return 'Не указан';
};

const getPrimaryChoice = (app) => {
  const choices = app.application_choices || app.choices || [];
  return choices.find(choice => Number(choice.priority) === 1) || choices[0] || null;
};

const getProfileName = (choice) => {
  const profile = choice?.profile || choice?.profiles;
  return profile?.name || choice?.profile_name || 'Профиль не указан';
};

const getDirectionName = (choice) => {
  const profile = choice?.profile || choice?.profiles;
  const direction = profile?.direction || profile?.directions;
  const directionTitle = [direction?.code, direction?.name].filter(Boolean).join(' ');
  return directionTitle || 'Направление не указано';
};

const getDocumentsSummary = (app) => app.document_summary || app.documents_summary || null;

const getDocumentsSummaryText = (app) => {
  const summary = getDocumentsSummary(app);
  if (!summary) return 'Проверить в заявке';

  return `${summary.required_uploaded}/${summary.required_total} обязательных`;
};

const getDocumentsTagType = (app) => {
  const summary = getDocumentsSummary(app);
  if (!summary) return 'info';
  return summary.required_uploaded >= summary.required_total ? 'success' : 'danger';
};

const getMissingDocumentsText = (app) => {
  const summary = getDocumentsSummary(app);
  if (!summary?.missing_required?.length) return '';
  return summary.missing_required.join(', ');
};

const getStatusIdByName = (statusName) => {
  return props.statuses.find(status => status.name === statusName)?.id || null;
};

const getCurrentStatusName = (app) => app.status?.name || app.status_name || '';

const canQuickAccept = (app) => {
  return getStatusIdByName('Принято') && getCurrentStatusName(app) !== 'Принято';
};

const canRequestRevision = (app) => {
  return getStatusIdByName('Требует доработки') && getCurrentStatusName(app) !== 'Требует доработки';
};

const confirmQuickStatus = async (app, statusName) => {
  const statusId = getStatusIdByName(statusName);
  if (!statusId) return;

  try {
    await ElMessageBox.confirm(
      `Изменить статус заявки на «${statusName}»?`,
      'Быстрое действие',
      {
        confirmButtonText: 'Изменить',
        cancelButtonText: 'Отмена',
        type: 'warning'
      }
    );
    emit('quick-status-update', {
      applicationId: app.id,
      statusId,
      comment: `Статус изменен из таблицы на «${statusName}»`
    });
  } catch (error) {
    // Пользователь отменил действие.
  }
};

const promptRevisionComment = async (app) => {
  const statusId = getStatusIdByName('Требует доработки');
  if (!statusId) return;

  try {
    const { value } = await ElMessageBox.prompt(
      'Укажите, что нужно исправить в заявке',
      'Отправить на доработку',
      {
        confirmButtonText: 'Отправить',
        cancelButtonText: 'Отмена',
        inputType: 'textarea',
        inputPlaceholder: 'Например: необходимо загрузить фото 3x4'
      }
    );
    emit('quick-status-update', {
      applicationId: app.id,
      statusId,
      comment: value || 'Заявка отправлена на доработку'
    });
  } catch (error) {
    // Пользователь отменил действие.
  }
};

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return 'Не указана';
  
  try {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    console.error('Ошибка форматирования даты:', e);
    return dateString;
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'Не указана';

  try {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error('Ошибка форматирования даты:', e);
    return dateString;
  }
};
</script>

<style scoped>
.applications-table__muted-line {
  max-width: 160px;
}
</style>