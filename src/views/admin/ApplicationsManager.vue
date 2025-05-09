<template>
  <div class="applications-manager">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Управление заявками абитуриентов</h2>
      
      <!-- Фильтры -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Фильтр по статусу -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Статус заявки</label>
            <select 
              v-model="filters.statusId" 
              class="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3"
            >
              <option :value="null">Все статусы</option>
              <option 
                v-for="status in statuses" 
                :key="status.id" 
                :value="status.id"
              >
                {{ status.description }}
              </option>
            </select>
          </div>
          
          <!-- Поиск по имени или ID -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
            <input 
              type="text" 
              v-model="filters.search" 
              placeholder="ФИО абитуриента или ID заявки" 
              class="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3"
            />
          </div>
          
          <!-- Сортировка -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Сортировать по</label>
            <select 
              v-model="sorting.field" 
              class="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3"
              @change="resetPagination"
            >
              <option value="created_at">Дате создания</option>
              <option value="updated_at">Дате обновления</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Статистика и информация -->
      <div class="flex flex-wrap gap-4 mb-6">
        <div 
          v-for="status in statuses" 
          :key="status.id"
          class="flex items-center px-3 py-2 rounded-md"
          :class="`bg-${status.color}-100`"
        >
          <span class="text-sm font-medium" :class="`text-${status.color}-800`">
            {{ status.description }}: {{ getStatusCount(status.id) }}
          </span>
        </div>
        <div class="flex items-center px-3 py-2 rounded-md bg-gray-100">
          <span class="text-sm font-medium text-gray-800">
            Всего: {{ totalApplications }}
          </span>
        </div>
      </div>
      
      <!-- Таблица заявок -->
      <div v-if="loading" class="flex justify-center py-10">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
      
      <div v-else-if="applications.length === 0" class="text-center py-10 bg-white rounded-lg shadow">
        <p class="text-gray-500">Заявки не найдены</p>
      </div>
      
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Абитуриент</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Программа</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата подачи</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="app in filteredApplications" :key="app.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ app.id.substring(0, 8) }}...
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ app.user ? `${app.user.last_name || ''} ${app.user.first_name || ''} ${app.user.middle_name || ''}` : 'Пользователь не найден' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ app.direction ? app.direction.name : 'Направление не указано' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="`bg-${getStatusById(app.status_id).color}-100 text-${getStatusById(app.status_id).color}-800`"
                  >
                    {{ getStatusById(app.status_id).description }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(app.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    @click="showApplicationDetails(app)"
                    class="text-primary-600 hover:text-primary-900 mr-2"
                  >
                    Подробнее
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Пагинация -->
        <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div class="flex items-center">
            <span class="text-sm text-gray-700">
              Показано <span class="font-medium">{{ pagination.from + 1 }}</span> - 
              <span class="font-medium">{{ Math.min(pagination.to + 1, totalApplications) }}</span> из 
              <span class="font-medium">{{ totalApplications }}</span> заявок
            </span>
          </div>
          <div class="flex justify-between sm:justify-end">
            <button
              @click="prevPage"
              class="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 mr-2"
              :disabled="pagination.page === 0"
              :class="{ 'opacity-50 cursor-not-allowed': pagination.page === 0 }"
            >
              Предыдущая
            </button>
            <button
              @click="nextPage"
              class="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
              :disabled="pagination.page >= totalPages - 1"
              :class="{ 'opacity-50 cursor-not-allowed': pagination.page >= totalPages - 1 }"
            >
              Следующая
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно с деталями заявки -->
    <div v-if="showModal" class="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showModal = false"></div>
        
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div v-if="selectedApplication" class="bg-white p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Детали заявки #{{ selectedApplication.id.substring(0, 8) }}...
              </h3>
              <button @click="showModal = false" class="text-gray-400 hover:text-gray-500">
                <span class="sr-only">Закрыть</span>
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Информация о заявителе -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-gray-500 mb-2">Информация о заявителе</h4>
              <div class="bg-gray-50 rounded-md p-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-600">ФИО:</p>
                    <p class="text-sm font-medium">
                      {{ selectedApplication.user ? 
                          `${selectedApplication.user.last_name || ''} ${selectedApplication.user.first_name || ''} ${selectedApplication.user.middle_name || ''}` 
                          : 'Пользователь не найден' 
                      }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Email:</p>
                    <p class="text-sm font-medium">{{ selectedApplication.user ? selectedApplication.user.email : 'Не указан' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Телефон:</p>
                    <p class="text-sm font-medium">{{ selectedApplication.user && selectedApplication.user.phone ? selectedApplication.user.phone : 'Не указан' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Дата рождения:</p>
                    <p class="text-sm font-medium">{{ selectedApplication.user && selectedApplication.user.birth_date ? formatDate(selectedApplication.user.birth_date) : 'Не указана' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Детали заявки -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-gray-500 mb-2">Детали заявки</h4>
              <div class="bg-gray-50 rounded-md p-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-600">Образовательная программа:</p>
                    <p class="text-sm font-medium">{{ selectedApplication.direction ? selectedApplication.direction.name : 'Не указана' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Уровень образования:</p>
                    <p class="text-sm font-medium">{{ selectedApplication.education_level }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Учебное заведение:</p>
                    <p class="text-sm font-medium">{{ selectedApplication.education_institution }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Год выпуска:</p>
                    <p class="text-sm font-medium">{{ selectedApplication.education_graduation_year }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Форма обучения:</p>
                    <p class="text-sm font-medium">{{ selectedApplication.study_form }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Форма финансирования:</p>
                    <p class="text-sm font-medium">{{ selectedApplication.funding_form }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Комментарий администратора -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-gray-500 mb-2">Последний комментарий администратора</h4>
              <div class="bg-gray-50 rounded-md p-4">
                <p class="text-sm italic">
                  {{ selectedApplication.admin_comment || 'Комментарии отсутствуют' }}
                </p>
              </div>
            </div>

            <!-- Форма изменения статуса -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-gray-500 mb-2">Изменить статус</h4>
              <div class="bg-gray-50 rounded-md p-4">
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Новый статус</label>
                  <select v-model="newStatus" class="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3">
                    <option 
                      v-for="status in statuses" 
                      :key="status.id" 
                      :value="status.id"
                      :disabled="status.id === selectedApplication.status_id"
                    >
                      {{ status.description }}
                    </option>
                  </select>
                </div>
                
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
                  <textarea 
                    v-model="newComment" 
                    rows="3" 
                    class="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3"
                    placeholder="Укажите причину изменения статуса или другую важную информацию"
                  ></textarea>
                </div>
                
                <div class="flex justify-end">
                  <button 
                    @click="updateApplicationStatus" 
                    :disabled="isUpdating || newStatus === selectedApplication.status_id"
                    class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="isUpdating">Сохранение...</span>
                    <span v-else>Сохранить изменения</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/api/supabase';

// Состояние компонента
const applications = ref([]);
const statuses = ref([]);
const loading = ref(true);
const showModal = ref(false);
const selectedApplication = ref(null);
const newStatus = ref(null);
const newComment = ref('');
const isUpdating = ref(false);
const toast = useToast();
const authStore = useAuthStore();
const totalApplications = ref(0);

// Фильтры
const filters = reactive({
  statusId: null,
  search: ''
});

// Сортировка
const sorting = reactive({
  field: 'created_at',
  direction: 'desc' // Сортировка по убыванию - от новых к старым
});

// Пагинация
const pagination = reactive({
  page: 0,
  pageSize: 20,
  from: 0,
  to: 19
});

// Вычисляем общее количество страниц
const totalPages = computed(() => {
  return Math.ceil(totalApplications.value / pagination.pageSize);
});

// Переход на следующую страницу
const nextPage = () => {
  if (pagination.page < totalPages.value - 1) {
    pagination.page++;
    pagination.from = pagination.page * pagination.pageSize;
    pagination.to = pagination.from + pagination.pageSize - 1;
    fetchApplications();
  }
};

// Переход на предыдущую страницу
const prevPage = () => {
  if (pagination.page > 0) {
    pagination.page--;
    pagination.from = pagination.page * pagination.pageSize;
    pagination.to = pagination.from + pagination.pageSize - 1;
    fetchApplications();
  }
};

// Сброс пагинации при изменении фильтров
const resetPagination = () => {
  pagination.page = 0;
  pagination.from = 0;
  pagination.to = pagination.pageSize - 1;
  fetchApplications();
};

// Получение общего количества заявок для пагинации
const fetchTotalCount = async () => {
  try {
    const query = supabase
      .from('applications')
      .select('id', { count: 'exact' });
    
    // Применение фильтра по статусу
    if (filters.statusId) {
      query.eq('status_id', filters.statusId);
    }
    
    const { count, error } = await query;
    
    if (error) throw error;
    totalApplications.value = count || 0;
  } catch (error) {
    console.error('Ошибка при получении общего количества заявок:', error);
    toast.error('Не удалось загрузить общее количество заявок');
  }
};

// Получение списка статусов заявок
const fetchStatuses = async () => {
  try {
    const { data, error } = await supabase
      .from('application_statuses')
      .select('*')
      .order('id');
    
    if (error) throw error;
    statuses.value = data;
  } catch (error) {
    console.error('Ошибка при получении статусов заявок:', error);
    toast.error('Не удалось загрузить статусы заявок');
  }
};

// Получение списка заявок с пагинацией
const fetchApplications = async () => {
  loading.value = true;
  
  try {
    // Построение запроса с учетом пагинации
    const query = supabase
      .from('applications')
      .select(`
        *,
        user:user_id (
          id, 
          first_name, 
          last_name, 
          middle_name, 
          email, 
          phone, 
          birth_date, 
          gender,
          region_id
        ),
        direction:direction_id (id, name)
      `)
      .order(sorting.field, { ascending: sorting.direction === 'asc' })
      .range(pagination.from, pagination.to);
    
    // Применение фильтра по статусу
    if (filters.statusId) {
      query.eq('status_id', filters.statusId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Полная ошибка при получении заявок:', error);
      throw error;
    }
    
    // Проверим, получены ли данные пользователей
    if (data && data.length > 0) {
      console.log('Пример данных первой заявки:', {
        id: data[0].id,
        user_id: data[0].user_id,
        user_exists: !!data[0].user,
        user_data: data[0].user ? {
          first_name: data[0].user.first_name,
          last_name: data[0].user.last_name
        } : 'Пользователь не найден'
      });
    }
    
    applications.value = data;
    
    // Получаем общее количество заявок для пагинации
    await fetchTotalCount();
    
    console.log(`Загружено заявок: ${applications.value.length} (стр. ${pagination.page + 1} из ${totalPages.value})`);
  } catch (error) {
    console.error('Ошибка при получении заявок:', error);
    toast.error('Не удалось загрузить заявки');
  } finally {
    loading.value = false;
  }
};

// Отфильтрованные заявки по строке поиска
const filteredApplications = computed(() => {
  if (!filters.search) return applications.value;
  
  return applications.value.filter(app => {
    const searchLower = filters.search.toLowerCase();
    
    // Безопасное получение полного имени с проверкой на существование user
    let fullName = '';
    if (app.user) {
      fullName = `${app.user.last_name || ''} ${app.user.first_name || ''} ${app.user.middle_name || ''}`.toLowerCase();
    }
    
    const idMatch = app.id.toLowerCase().includes(searchLower);
    const nameMatch = fullName.includes(searchLower);
    
    return idMatch || nameMatch;
  });
});

// Получение количества заявок по статусу
const getStatusCount = (statusId) => {
  return applications.value.filter(app => app.status_id === statusId).length;
};

// Получение статуса по ID
const getStatusById = (statusId) => {
  return statuses.value.find(s => s.id === statusId) || { description: 'Неизвестный статус', color: 'gray' };
};

// Форматирование даты без использования date-fns
const formatDate = (dateString) => {
  if (!dateString) return 'Не указана';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Неверная дата';
    
    // Форматирование даты в виде дд.мм.гггг
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 потому что месяцы начинаются с 0
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  } catch (error) {
    return 'Неверная дата';
  }
};

// Показать детали заявки
const showApplicationDetails = (application) => {
  selectedApplication.value = application;
  newStatus.value = application.status_id;
  newComment.value = application.admin_comment || '';
  showModal.value = true;
};

// Обновление статуса заявки
const updateApplicationStatus = async () => {
  if (!selectedApplication.value || isUpdating.value) return;
  
  // Если статус не изменился, выходим
  if (newStatus.value === selectedApplication.value.status_id && 
      newComment.value === selectedApplication.value.admin_comment) {
    return;
  }
  
  isUpdating.value = true;
  
  try {
    const { error } = await supabase
      .from('applications')
      .update({ 
        status_id: newStatus.value,
        admin_comment: newComment.value,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedApplication.value.id);
    
    if (error) throw error;
    
    // Запись в журнал администратора
    await supabase
      .from('admin_logs')
      .insert({
        user_id: authStore.user.id,
        action: 'update_application_status',
        resource_id: selectedApplication.value.id,
        resource_type: 'application',
        details: {
          previous_status: selectedApplication.value.status_id,
          new_status: newStatus.value,
          comment: newComment.value
        }
      });
    
    // Обновление данных в локальном массиве
    const index = applications.value.findIndex(app => app.id === selectedApplication.value.id);
    if (index !== -1) {
      applications.value[index].status_id = newStatus.value;
      applications.value[index].admin_comment = newComment.value;
      applications.value[index].updated_at = new Date().toISOString();
    }
    
    toast.success('Статус заявки успешно обновлен');
    showModal.value = false;
    
    // Перезагружаем данные если нужно (например, если заявка может переместиться на другую страницу)
    if (sorting.field === 'updated_at') {
      fetchApplications();
    }
  } catch (error) {
    console.error('Ошибка при обновлении статуса заявки:', error);
    toast.error('Не удалось обновить статус заявки');
  } finally {
    isUpdating.value = false;
  }
};

// Обработчик изменения фильтра статуса
const handleStatusFilterChange = () => {
  resetPagination();
};

// Загрузка данных при монтировании компонента
onMounted(async () => {
  // Проверка прав доступа
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Ошибка при получении текущего пользователя:', userError);
      toast.error('Ошибка при проверке прав доступа');
      return;
    }
    
    console.log('Текущий пользователь:', userData.user?.id);
    
    // Проверяем, является ли пользователь админом или ревьюером
    const { data: roleData, error: roleError } = await supabase
      .from('users')
      .select('role_id')
      .eq('id', userData.user?.id)
      .single();
    
    if (roleError) {
      console.error('Ошибка при получении роли пользователя:', roleError);
      toast.error('Ошибка при проверке прав доступа');
      return;
    }
    
    const isAdminOrReviewer = roleData.role_id === 2 || roleData.role_id === 3;
    console.log('Роль пользователя:', roleData.role_id, 'Админ или ревьюер:', isAdminOrReviewer);
    
    if (!isAdminOrReviewer) {
      toast.error('У вас нет прав для просмотра этой страницы');
      return;
    }
    
    // Тестовый запрос для проверки доступа к пользователям
    const { data: testUsers, error: testUsersError } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .limit(2);
    
    if (testUsersError) {
      console.error('Ошибка при тестовом запросе пользователей:', testUsersError);
    } else {
      console.log('Тестовый запрос пользователей успешен:', testUsers);
    }
  } catch (error) {
    console.error('Ошибка при проверке прав доступа:', error);
  }
  
  await fetchStatuses();
  await fetchApplications();
  
  // Слежение за изменением фильтра статуса
  watch(() => filters.statusId, handleStatusFilterChange);
});
</script> 