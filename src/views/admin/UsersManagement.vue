<template>
  <el-card shadow="never">
    <template #header>
      <div class="users-management__header">
        <div>
          <h3 class="users-management__title">Управление пользователями</h3>
          <el-text type="info">Назначение сотрудников приемной комиссии</el-text>
        </div>

        <el-space wrap>
          <el-button
            type="success"
            :loading="isExporting"
            :icon="Download"
            @click="exportUsersToExcel"
          >
            Экспорт в Excel
          </el-button>
          <el-button :loading="isLoading" :icon="Refresh" @click="loadUsers">
            Обновить
          </el-button>
        </el-space>
      </div>
    </template>

    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
      class="users-management__alert"
    />

    <el-table
      v-loading="isLoading"
      :data="users"
      row-key="id"
      border
      stripe
      empty-text="Пользователи не найдены"
    >
      <el-table-column label="Пользователь" min-width="240">
        <template #default="{ row }">
          <el-space>
            <el-avatar>
              {{ getInitials(row.first_name, row.last_name) }}
            </el-avatar>
            <div>
              <el-text tag="div" class="users-management__name">
                {{ row.first_name }} {{ row.last_name }}
              </el-text>
              <el-text type="info" size="small">
                Рег: {{ formatDate(row.created_at) }}
              </el-text>
            </div>
          </el-space>
        </template>
      </el-table-column>

      <el-table-column prop="email" label="Email" min-width="220" />

      <el-table-column label="Роль" width="230">
        <template #default="{ row }">
          <el-tag :type="getRoleTagType(row.role_id)" effect="light">
            {{ getRoleName(row.role_id) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Действия" min-width="360" fixed="right">
        <template #default="{ row }">
          <el-space wrap>
            <el-select
              v-model="editableRoles[row.id]"
              :disabled="row.id === authStore.user?.id || isUpdating[row.id] || row.role_id === 2"
              style="width: 240px"
            >
              <el-option label="Абитуриент" :value="1" />
              <el-option v-if="row.role_id === 2" label="Администратор" :value="2" />
              <el-option label="Сотрудник приемной комиссии" :value="3" />
            </el-select>

            <el-button
              v-if="isRoleChanged(row)"
              type="primary"
              size="small"
              :loading="isUpdating[row.id]"
              :disabled="row.role_id === 2"
              @click="saveUserRole(row.id)"
            >
              Сохранить
            </el-button>
          </el-space>

          <el-text v-if="row.role_id === 2" type="info" size="small">
            Роль администратора нельзя изменить
          </el-text>
        </template>
      </el-table-column>
    </el-table>

  </el-card>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import { useApplicationStore } from '@/stores/application';
import { Download, Refresh } from '@element-plus/icons-vue';

const authStore = useAuthStore();
const toast = useToast();
const appStore = useApplicationStore();

const users = ref([]);
const isLoading = ref(false);
const error = ref(null);
const isUpdating = ref({});
// Храним редактируемые роли отдельно, чтобы отслеживать изменения
const editableRoles = reactive({});

// Флаг состояния экспорта
const isExporting = ref(false);

// Загрузка списка пользователей
const loadUsers = async () => {
  if (!authStore.isAdmin) {
    error.value = 'У вас нет прав для просмотра пользователей';
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    // Используем метод из сервиса вместо прямого обращения к базе
    const { success, data, error: fetchError } = await authStore.getAllUsers();

    if (!success) {
      console.error('Ошибка получения пользователей:', fetchError);
      throw new Error(fetchError || 'Не удалось загрузить пользователей');
    }

    users.value = data || [];
    
    // Инициализируем редактируемые роли
    users.value.forEach(user => {
      editableRoles[user.id] = user.role_id;
    });
    
    if (users.value.length === 0 && !fetchError) {
      error.value = 'Пользователи не найдены';
    }
  } catch (err) {
    console.error('Ошибка загрузки пользователей:', err);
    error.value = err.message || 'Не удалось загрузить список пользователей';
    toast.error(error.value);
  } finally {
    isLoading.value = false;
  }
};

// Проверка на изменение роли
const isRoleChanged = (user) => {
  return editableRoles[user.id] !== user.role_id;
};

// Сохранение роли пользователя
const saveUserRole = async (userId) => {
  if (!authStore.isAdmin) {
    toast.error('У вас нет прав для изменения ролей пользователей');
    return;
  }

  // Проверка, действительно ли роль изменилась
  const user = users.value.find(u => u.id === userId);
  if (!user || editableRoles[userId] === user.role_id) {
    return;
  }

  // Нельзя назначать администраторов
  if (editableRoles[userId] === 2) {
    toast.error('Назначение администраторов запрещено');
    editableRoles[userId] = user.role_id; // Сброс к исходному значению
    return;
  }

  // Нельзя изменить свою собственную роль
  if (userId === authStore.user?.id) {
    toast.error('Вы не можете изменить свою собственную роль');
    return;
  }

  isUpdating.value = { ...isUpdating.value, [userId]: true };

  try {
    // Используем метод из сервиса
    const { success, error: updateError } = await authStore.updateUserRole(userId, editableRoles[userId]);

    if (!success) throw new Error(updateError || 'Не удалось обновить роль');

    // Обновляем роль в основном списке пользователей
    const userIndex = users.value.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users.value[userIndex].role_id = editableRoles[userId];
    }
    
    toast.success('Роль пользователя успешно обновлена');
    
    // Обновляем текущую сессию после изменения роли пользователя,
    // чтобы системные проверки основывались на актуальных данных
    await authStore.refreshSession();
  } catch (err) {
    console.error('Ошибка обновления роли:', err);
    toast.error(err.message || 'Не удалось обновить роль пользователя');
    
    // Сбрасываем изменения обратно
    if (user) {
      editableRoles[userId] = user.role_id;
    }
  } finally {
    isUpdating.value = { ...isUpdating.value, [userId]: false };
  }
};

// Получение названия роли по ID
const getRoleName = (roleId) => {
  switch (roleId) {
    case 1: return 'Абитуриент';
    case 2: return 'Администратор';
    case 3: return 'Сотрудник приемной комиссии';
    default: return 'Неизвестная роль';
  }
};

const getRoleTagType = (roleId) => {
  switch (roleId) {
    case 1: return 'success';
    case 2: return 'primary';
    case 3: return 'warning';
    default: return 'info';
  }
};

// Получение инициалов пользователя
const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return '?';
  
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
  
  return `${firstInitial}${lastInitial}`;
};

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  }).format(date);
};

// Функция экспорта пользователей в Excel
const exportUsersToExcel = async () => {
  isExporting.value = true;
  
  try {
    const { success, error } = await appStore.exportAllApplicantsToExcel();
    
    if (success) {
      toast.success('Данные успешно экспортированы в Excel');
    } else {
      toast.error(`Ошибка при экспорте данных: ${error}`);
    }
  } catch (err) {
    console.error('Ошибка экспорта:', err);
    toast.error('Произошла ошибка при экспорте данных');
  } finally {
    isExporting.value = false;
  }
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.users-management__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.users-management__title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.users-management__name {
  font-weight: 600;
}

.users-management__alert {
  margin-bottom: 16px;
}

@media (max-width: 640px) {
  .users-management__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>