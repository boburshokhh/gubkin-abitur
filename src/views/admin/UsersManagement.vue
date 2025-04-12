<template>
  <div>
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-4 py-5 sm:px-6 flex flex-col sm:flex-row justify-between sm:items-center">
        <div class="mb-4 sm:mb-0">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Управление пользователями</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">Назначение сотрудников приемной комиссии</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Кнопка экспорта в Excel -->
          <button
            @click="exportUsersToExcel"
            :disabled="isExporting"
            class="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {{ isExporting ? 'Экспорт...' : 'Экспорт в Excel' }}
          </button>
          
          <button
            @click="loadUsers"
            class="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Обновить
          </button>
        </div>
      </div>
      
      <div class="border-t border-gray-200">
        <div v-if="isLoading" class="flex justify-center items-center p-8">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
        
        <div v-else-if="error" class="p-6 text-center text-red-500">
          {{ error }}
        </div>
        
        <div v-else>
          <!-- Десктопная версия таблицы (скрыта на мобильных) -->
          <div class="hidden sm:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Роль
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in users" :key="user.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span class="text-gray-500 text-sm font-medium">
                          {{ getInitials(user.first_name, user.last_name) }}
                        </span>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ user.first_name }} {{ user.last_name }}
                        </div>
                        <div class="text-sm text-gray-500">
                          Рег: {{ formatDate(user.created_at) }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ user.email }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <span 
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="{
                          'bg-green-100 text-green-800': user.role_id === 1,
                          'bg-blue-100 text-blue-800': user.role_id === 2,
                          'bg-purple-100 text-purple-800': user.role_id === 3
                        }"
                      >
                        {{ getRoleName(user.role_id) }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="flex items-center space-x-2">
                      <select 
                        v-model="editableRoles[user.id]" 
                        class="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        :disabled="user.id === authStore.user?.id || isUpdating[user.id] || user.role_id === 2"
                      >
                        <option :value="1">Абитуриент</option>
                        <option v-if="user.role_id === 2" :value="2">Администратор</option>
                        <option :value="3">Сотрудник приемной комиссии</option>
                      </select>
                      
                      <button 
                        v-if="isRoleChanged(user)"
                        @click="saveUserRole(user.id)"
                        class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        :disabled="isUpdating[user.id] || user.role_id === 2"
                      >
                        Сохранить
                      </button>
                      
                      <span v-if="isUpdating[user.id]" class="ml-2 text-xs text-gray-500">Обновление...</span>
                    </div>
                    
                    <div v-if="user.role_id === 2" class="mt-1 text-xs text-gray-500">
                      Роль администратора нельзя изменить
                    </div>
                  </td>
                </tr>
                <tr v-if="users.length === 0">
                  <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                    Пользователи не найдены
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Мобильная версия списка (отображается только на мобильных) -->
          <div class="sm:hidden">
            <ul class="divide-y divide-gray-200">
              <li v-for="user in users" :key="user.id" class="px-4 py-4">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span class="text-gray-500 font-medium">
                      {{ getInitials(user.first_name, user.last_name) }}
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ user.first_name }} {{ user.last_name }}
                    </p>
                    <p class="text-sm text-gray-500 truncate">
                      {{ user.email }}
                    </p>
                    <div class="mt-1 flex items-center">
                      <span 
                        class="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="{
                          'bg-green-100 text-green-800': user.role_id === 1,
                          'bg-blue-100 text-blue-800': user.role_id === 2,
                          'bg-purple-100 text-purple-800': user.role_id === 3
                        }"
                      >
                        {{ getRoleName(user.role_id) }}
                      </span>
                      <span class="ml-2 text-xs text-gray-500">
                        Рег: {{ formatDate(user.created_at) }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="mt-4 flex flex-col space-y-3">
                  <div v-if="user.role_id === 2" class="text-xs text-gray-500">
                    Роль администратора нельзя изменить
                  </div>
                  <div v-else class="flex flex-col space-y-2">
                    <select 
                      v-model="editableRoles[user.id]" 
                      class="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
                      :disabled="user.id === authStore.user?.id || isUpdating[user.id]"
                    >
                      <option :value="1">Абитуриент</option>
                      <option :value="3">Сотрудник приемной комиссии</option>
                    </select>
                    
                    <div class="flex items-center justify-between">
                      <button 
                        v-if="isRoleChanged(user)"
                        @click="saveUserRole(user.id)"
                        class="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        :disabled="isUpdating[user.id]"
                      >
                        {{ isUpdating[user.id] ? 'Обновление...' : 'Сохранить изменения' }}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
              
              <li v-if="users.length === 0" class="px-4 py-6 text-center text-sm text-gray-500">
                Пользователи не найдены
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useApplicationStore } from '@/stores/application';
import * as XLSX from 'exceljs'; // Импорт для Excel

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