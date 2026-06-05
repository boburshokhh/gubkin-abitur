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
          {{ row.applicant_full_name || getApplicantName(row) }}
        </template>
      </el-table-column>

      <el-table-column label="Статус" width="180">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status?.name || row.status_name)" effect="light">
            {{ row.status?.name || row.status_name || 'Не указан' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Дата подачи" width="160">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>

      <el-table-column label="Действия" width="130" align="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="$emit('view-application', row)">
            Просмотр
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
defineProps({
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
  }
});

defineEmits(['view-application']);

const getStatusType = (statusName) => {
  const types = {
    'Подана': 'primary',
    'Принята': 'success',
    'Отклонена': 'danger',
    'Требует доработки': 'warning',
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
</script> 