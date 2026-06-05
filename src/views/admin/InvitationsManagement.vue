<template>
  <div class="invitations-management">
    <el-card shadow="never">
      <template #header>
        <div>
          <h3 class="invitations-management__title">Отправить приглашение</h3>
          <el-text type="info">
            Для сотрудников и администраторов используйте одноразовые invitation-ссылки.
          </el-text>
        </div>
      </template>

      <el-form
        :model="form"
        label-position="top"
        class="invitations-management__form"
        @submit.prevent="createInvitation"
      >
        <el-form-item label="Email" required>
          <el-input
            v-model="form.email"
            type="email"
            placeholder="user@example.com"
            clearable
          />
        </el-form-item>

        <el-form-item label="Роль" required>
          <el-select v-model="form.roleId" class="invitations-management__select">
            <el-option label="Сотрудник приемной комиссии" :value="3" />
            <el-option label="Администратор" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item class="invitations-management__submit">
          <el-button
            type="primary"
            native-type="submit"
            :loading="isCreating"
            :icon="Message"
          >
            Отправить
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="invitations-management__header">
          <div>
            <h3 class="invitations-management__title">Последние приглашения</h3>
            <el-text type="info">Активные, принятые и отозванные ссылки.</el-text>
          </div>
          <el-button :loading="isLoading" :icon="Refresh" @click="loadInvitations">
            Обновить
          </el-button>
        </div>
      </template>

      <el-alert
        v-if="error"
        :title="error"
        type="error"
        show-icon
        :closable="false"
        class="invitations-management__alert"
      />

      <el-table
        v-loading="isLoading"
        :data="invitationsList"
        row-key="id"
        border
        stripe
        empty-text="Приглашения не найдены"
      >
        <el-table-column prop="email" label="Email" min-width="240" />
        <el-table-column prop="role_name" label="Роль" min-width="220" />

        <el-table-column label="Статус" width="140">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row)" effect="light">
              {{ getStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Истекает" min-width="180">
          <template #default="{ row }">
            {{ formatDate(row.expires_at) }}
          </template>
        </el-table-column>

        <el-table-column label="Действия" width="150" align="right">
          <template #default="{ row }">
            <el-button
              v-if="canRevoke(row)"
              type="danger"
              link
              :loading="isRevoking[row.id]"
              :icon="Delete"
              @click="revokeInvitation(row.id)"
            >
              Отозвать
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { invitations } from '@/api/app-api';
import { Delete, Message, Refresh } from '@element-plus/icons-vue';

const toast = useToast();
const invitationsList = ref([]);
const error = ref('');
const isLoading = ref(false);
const isCreating = ref(false);
const isRevoking = ref({});

const form = reactive({
  email: '',
  roleId: 3
});

function getStatusText(invitation) {
  if (invitation.accepted_at) return 'Принято';
  if (invitation.revoked_at) return 'Отозвано';
  if (new Date(invitation.expires_at) <= new Date()) return 'Истекло';
  return 'Активно';
}

function getStatusType(invitation) {
  const status = getStatusText(invitation);
  if (status === 'Принято') return 'success';
  if (status === 'Активно') return 'primary';
  if (status === 'Отозвано') return 'danger';
  return 'info';
}

function canRevoke(invitation) {
  return !invitation.accepted_at && !invitation.revoked_at && new Date(invitation.expires_at) > new Date();
}

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

async function loadInvitations() {
  isLoading.value = true;
  error.value = '';

  try {
    const { data, error: loadError } = await invitations.getAll();
    if (loadError) throw loadError;
    invitationsList.value = data;
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить приглашения';
    toast.error(error.value);
  } finally {
    isLoading.value = false;
  }
}

async function createInvitation() {
  isCreating.value = true;

  try {
    const { error: createError } = await invitations.create({
      email: form.email,
      roleId: form.roleId
    });
    if (createError) throw createError;

    toast.success('Приглашение отправлено');
    form.email = '';
    await loadInvitations();
  } catch (err) {
    toast.error(err.message || 'Не удалось отправить приглашение');
  } finally {
    isCreating.value = false;
  }
}

async function revokeInvitation(id) {
  isRevoking.value = { ...isRevoking.value, [id]: true };

  try {
    const { error: revokeError } = await invitations.revoke(id);
    if (revokeError) throw revokeError;
    toast.success('Приглашение отозвано');
    await loadInvitations();
  } catch (err) {
    toast.error(err.message || 'Не удалось отозвать приглашение');
  } finally {
    isRevoking.value = { ...isRevoking.value, [id]: false };
  }
}

onMounted(loadInvitations);
</script>

<style scoped>
.invitations-management {
  display: grid;
  gap: 24px;
}

.invitations-management__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.invitations-management__title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.invitations-management__form {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) minmax(240px, 1fr) auto;
  gap: 16px;
  align-items: end;
}

.invitations-management__select {
  width: 100%;
}

.invitations-management__submit {
  margin-bottom: 18px;
}

.invitations-management__alert {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .invitations-management__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .invitations-management__form {
    grid-template-columns: 1fr;
  }

  .invitations-management__submit {
    margin-bottom: 0;
  }
}
</style>
