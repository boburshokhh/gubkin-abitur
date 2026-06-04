<template>
  <div class="space-y-6">
    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900">Отправить приглашение</h3>
      <p class="mt-1 text-sm text-gray-500">Для сотрудников и администраторов используйте одноразовые invitation-ссылки.</p>

      <form class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3" @submit.prevent="createInvitation">
        <div>
          <label for="inviteEmail" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="inviteEmail"
            v-model="form.email"
            type="email"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label for="inviteRole" class="block text-sm font-medium text-gray-700">Роль</label>
          <select
            id="inviteRole"
            v-model.number="form.roleId"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option :value="3">Сотрудник приемной комиссии</option>
            <option :value="2">Администратор</option>
          </select>
        </div>

        <div class="flex items-end">
          <BaseButton type="submit" class="w-full" :disabled="isCreating">
            {{ isCreating ? 'Отправка...' : 'Отправить' }}
          </BaseButton>
        </div>
      </form>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <div>
          <h3 class="text-lg font-medium text-gray-900">Последние приглашения</h3>
          <p class="mt-1 text-sm text-gray-500">Активные, принятые и отозванные ссылки.</p>
        </div>
        <BaseButton variant="outline" @click="loadInvitations" :disabled="isLoading">
          Обновить
        </BaseButton>
      </div>

      <div v-if="isLoading" class="p-8 text-center text-sm text-gray-500">Загрузка...</div>
      <div v-else-if="error" class="p-6 text-center text-red-600">{{ error }}</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Истекает</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="invitation in invitationsList" :key="invitation.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ invitation.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ invitation.role_name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getStatusClass(invitation)">
                  {{ getStatusText(invitation) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(invitation.expires_at) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                <button
                  v-if="canRevoke(invitation)"
                  class="text-red-600 hover:text-red-800"
                  :disabled="isRevoking[invitation.id]"
                  @click="revokeInvitation(invitation.id)"
                >
                  {{ isRevoking[invitation.id] ? 'Отзыв...' : 'Отозвать' }}
                </button>
              </td>
            </tr>
            <tr v-if="invitationsList.length === 0">
              <td colspan="5" class="px-6 py-6 text-center text-sm text-gray-500">Приглашения не найдены</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { invitations } from '@/api/app-api';
import BaseButton from '@/components/ui/BaseButton.vue';

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

function getStatusClass(invitation) {
  const status = getStatusText(invitation);
  return {
    'bg-green-100 text-green-800': status === 'Принято',
    'bg-blue-100 text-blue-800': status === 'Активно',
    'bg-red-100 text-red-800': status === 'Отозвано',
    'bg-gray-100 text-gray-800': status === 'Истекло'
  };
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
