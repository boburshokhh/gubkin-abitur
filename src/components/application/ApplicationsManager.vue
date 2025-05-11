<template>
  <div class="applications-manager">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">
        {{ isAdmin ? 'Управление заявками абитуриентов' : 'Обработка заявок абитуриентов' }}
      </h2>
      
      <!-- Фильтры -->
      <application-filters
        :statuses="statuses"
        :directions="directions"
        :initial-filters="filters"
        @update:filters="updateFilters"
      />
      
      <!-- Статистика -->
      <application-stats
        :total-applications="totalApplications"
        :new-applications-count="newApplicationsCount"
        :submitted-applications-count="submittedApplicationsCount"
      />
      
      <!-- Список заявок -->
      <applications-table
        :applications="paginatedApplications"
        :statuses="statuses"
        :loading="loading"
        @view-application="openApplicationModal"
      />
      
      <!-- Пагинация -->
      <application-pagination
        v-if="totalApplications > 0"
        :current-page="pagination.currentPage"
        :page-size="pagination.pageSize"
        :total-items="filteredApplicationsCount"
        :page-size-options="[10, 20, 50, 100]"
        @change-page="handlePageChange"
        @change-page-size="handlePageSizeChange"
        class="mt-4"
      />
    </div>
    
    <!-- Модальное окно для просмотра и обновления заявки -->
    <application-modal
      :show="showModal"
      :application="selectedApplication"
      :statuses="statuses"
      :is-updating="isUpdating"
      @close="closeModal"
      @update-status="handleStatusUpdate"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth';
import { supabase, applications } from '@/api/supabase';

// Импортируем компоненты
import ApplicationFilters from './filters/ApplicationFilters.vue';
import ApplicationStats from './stats/ApplicationStats.vue';
import ApplicationsTable from './table/ApplicationsTable.vue';
import ApplicationModal from './modal/ApplicationModal.vue';
import ApplicationPagination from './pagination/ApplicationPagination.vue';

// Состояние компонента
const applicationsList = ref([]);
const statuses = ref([]);
const directions = ref([]);
const loading = ref(true);
const showModal = ref(false);
const selectedApplication = ref(null);
const isUpdating = ref(false);
const toast = useToast();
const authStore = useAuthStore();
const totalApplications = ref(0);

// Пагинация
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  totalCount: 0
});

// Определяем роль пользователя внутри компонента
const isAdmin = computed(() => authStore.isAdmin);
const isReviewer = computed(() => authStore.isReviewer);

// Фильтры
const filters = reactive({
  statusId: null,
  directionId: null,
  searchQuery: ''
});

// Обновление фильтров
function updateFilters(newFilters) {
  filters.statusId = newFilters.statusId;
  filters.directionId = newFilters.directionId;
  filters.searchQuery = newFilters.searchQuery;
  
  // Сбрасываем пагинацию при изменении фильтров
  pagination.currentPage = 1;
}

// Отфильтрованные заявки
const filteredApplications = computed(() => {
  return applicationsList.value.filter(app => {
    // Фильтр по статусу
    if (filters.statusId && app.status_id !== filters.statusId) {
      return false;
    }
    
    // Фильтр по направлению
    if (filters.directionId && app.direction_id !== filters.directionId) {
      return false;
    }
    
    // Поиск по ФИО
    if (filters.searchQuery && !userFullNameMatches(app.user, filters.searchQuery)) {
      return false;
    }
    
    return true;
  });
});

// Количество отфильтрованных заявок для пагинации
const filteredApplicationsCount = computed(() => filteredApplications.value.length);

// Пагинированные заявки
const paginatedApplications = computed(() => {
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  return filteredApplications.value.slice(startIndex, endIndex);
});

// Подсчет новых заявок (статус "Подана")
const newApplicationsCount = computed(() => {
  return applicationsList.value.filter(app => app.status_id === 10).length;
});

// Подсчет заявок, требующих внимания (статус "Подана")
const submittedApplicationsCount = computed(() => {
  return applicationsList.value.filter(app => app.status_id === 10).length;
});

// Обработка изменения страницы
function handlePageChange(page) {
  pagination.currentPage = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Обработка изменения размера страницы
function handlePageSizeChange(size) {
  pagination.pageSize = size;
  pagination.currentPage = 1; // Сбрасываем на первую страницу при изменении размера
}

// Загрузка данных при монтировании компонента
onMounted(async () => {
  await Promise.all([
    loadStatuses(),
    loadDirections()
  ]);
  await loadApplications();
});

// Отслеживаем изменения фильтров для обновления данных с сервера
watch([() => filters.statusId, () => filters.directionId], async () => {
  await loadApplications();
}, { deep: true });

// Загрузка статусов заявок
async function loadStatuses() {
  try {
    const { data, error } = await supabase
      .from('application_statuses')
      .select('*')
      .order('id');
    
    if (error) throw error;
    
    statuses.value = data;
  } catch (err) {
    console.error('Ошибка при загрузке статусов:', err);
    toast.error('Не удалось загрузить статусы заявок');
  }
}

// Загрузка направлений обучения
async function loadDirections() {
  try {
    const { data, error } = await supabase
      .from('directions')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    directions.value = data;
  } catch (err) {
    console.error('Ошибка при загрузке направлений:', err);
    toast.error('Не удалось загрузить направления обучения');
  }
}

// Загрузка заявок с оптимизацией запросов
async function loadApplications() {
  loading.value = true;
  
  try {
    // Формируем запрос с учетом фильтров
    let query = supabase
      .from('applications')
      .select(`
        *,
        user:user_id(*),
        direction:direction_id(*),
        status:status_id(*),
        documents:application_documents(*)
      `, { count: 'exact' }) // Запрашиваем общее количество записей
      .order('created_at', { ascending: false });
    
    // Применяем фильтры на стороне сервера для оптимизации
    if (filters.statusId) {
      query = query.eq('status_id', filters.statusId);
    }
    
    if (filters.directionId) {
      query = query.eq('direction_id', filters.directionId);
    }
    
    // Фильтр по ФИО не применяем на сервере, так как он требует доступа к связанным данным пользователя
    // Этот фильтр будет применен на клиенте через computed-свойство
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    applicationsList.value = data;
    totalApplications.value = count || data.length;
  } catch (err) {
    console.error('Ошибка при загрузке заявок:', err);
    toast.error('Не удалось загрузить список заявок');
  } finally {
    loading.value = false;
  }
}

// Открытие модального окна для просмотра заявки
function openApplicationModal(application) {
  selectedApplication.value = application;
  showModal.value = true;
}

// Закрытие модального окна
function closeModal() {
  showModal.value = false;
  selectedApplication.value = null;
}

// Обработка обновления статуса заявки
async function handleStatusUpdate({ statusId, comment }) {
  if (!selectedApplication.value || !statusId) return;
  
  isUpdating.value = true;
  
  try {
    // Используем функцию для обновления статуса с добавлением в историю
    const { data, error } = await supabase.rpc('update_application_status', {
      p_application_id: selectedApplication.value.id,
      p_status_id: statusId,
      p_comment: comment || null
    });
    
    if (error) {
      console.error('Ошибка при обновлении статуса:', error);
      toast.error('Не удалось обновить статус заявки');
    } else {
      // Обновляем заявку в списке
      const index = applicationsList.value.findIndex(app => app.id === selectedApplication.value.id);
      if (index !== -1) {
        applicationsList.value[index] = {
          ...applicationsList.value[index],
          status_id: statusId,
          admin_comment: comment,
          updated_at: new Date().toISOString()
        };
      }
      
      toast.success('Статус заявки успешно обновлен');
      closeModal();
      
      // Перезагружаем список заявок для обновления данных
      await loadApplications();
    }
  } catch (err) {
    console.error('Ошибка при обновлении статуса:', err);
    toast.error('Не удалось обновить статус заявки');
  } finally {
    isUpdating.value = false;
  }
}

// Проверка совпадения ФИО с поисковым запросом
function userFullNameMatches(user, query) {
  if (!user) return false;
  
  const fullName = getUserFullName(user).toLowerCase();
  return fullName.includes(query.toLowerCase());
}

// Получение полного имени пользователя
function getUserFullName(user) {
  if (!user) return 'Неизвестный пользователь';
  return `${user.last_name || ''} ${user.first_name || ''} ${user.middle_name || ''}`.trim();
}
</script> 