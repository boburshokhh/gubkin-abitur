<template>
  <div class="applications-manager">
    <el-page-header
      title=""
      :content="isAdmin ? 'Управление заявками абитуриентов' : 'Обработка заявок абитуриентов'"
    />

    <application-filters
      :statuses="statuses"
      :initial-filters="filters"
      @update:filters="updateFilters"
    />

    <application-stats
      :total-applications="totalApplications"
      :new-applications-count="newApplicationsCount"
    />

    <applications-table
      :applications="paginatedApplications"
      :statuses="statuses"
      :loading="loading"
      @view-application="openApplicationModal"
    />

    <application-pagination
      v-if="totalApplications > 0"
      :current-page="pagination.currentPage"
      :page-size="pagination.pageSize"
      :total-items="totalApplications"
      @change-page="handlePageChange"
      @change-page-size="handlePageSizeChange"
    />

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
import { appApi, applications as applicationsApi, statistics } from '@/api/app-api';

// Импортируем компоненты
import ApplicationFilters from './filters/ApplicationFilters.vue';
import ApplicationStats from './stats/ApplicationStats.vue';
import ApplicationsTable from './table/ApplicationsTable.vue';
import ApplicationModal from './modal/ApplicationModal.vue';
import ApplicationPagination from './pagination/ApplicationPagination.vue';

// Состояние компонента
const applicationsList = ref([]);
const statuses = ref([]);
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
});

// Определяем роль пользователя внутри компонента
const isAdmin = computed(() => authStore.isAdmin);
const isReviewer = computed(() => authStore.isReviewer);

// Фильтры
const filters = reactive({
  statusId: null,
  levelId: null,
  directionId: null,
  profileId: null,
  searchQuery: ''
});

// Обновление фильтров
function updateFilters(newFilters) {
  Object.assign(filters, newFilters);
  pagination.currentPage = 1;
}

// Подсчет новых заявок (статус "Подана")
const newApplicationsCount = computed(() => {
  return applicationsList.value.filter(app => app.status?.name === 'Подана').length;
});

// Обработка изменения страницы
function handlePageChange(page) {
  pagination.currentPage = page;
}

// Обработка изменения размера страницы
function handlePageSizeChange(size) {
  pagination.pageSize = size;
  pagination.currentPage = 1; // Сбрасываем на первую страницу при изменении размера
}

// Загрузка данных при монтировании компонента
onMounted(async () => {
  await loadStatuses();
  await loadApplications();
});

// Отслеживаем изменения фильтров для обновления данных с сервера
watch([filters, pagination], loadApplications, { deep: true });

// Загрузка статусов заявок
async function loadStatuses() {
  try {
    const { data, error } = await appApi
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

// Загрузка заявок с оптимизацией запросов
async function loadApplications() {
  loading.value = true;
  
  try {
    const { data, count, error } = await applicationsApi.getAll({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      filters: {
        statusId: filters.statusId,
        levelId: filters.levelId,
        directionId: filters.directionId,
        profileId: filters.profileId,
        searchQuery: filters.searchQuery
      }
    });
    
    if (error) throw error;
    
    applicationsList.value = data;
    totalApplications.value = count;
  } catch (err) {
    console.error('Ошибка при загрузке заявок:', err);
    toast.error('Не удалось загрузить список заявок');
  } finally {
    loading.value = false;
  }
}

// Открытие модального окна для просмотра заявки
async function openApplicationModal(application) {
  try {
    // Показываем индикатор загрузки
    isUpdating.value = true;
    
    // console.log('Открытие модального окна для заявки:', application.id);
    
    // Загружаем полные данные заявки через оптимизированную RPC функцию
    const { data: fullApplication, error } = await applicationsApi.getById(application.id);
    
    if (error) {
      console.error('Ошибка при загрузке полных данных заявки:', error);
      toast.error('Не удалось загрузить данные заявки');
      return;
    }
    
    if (!fullApplication) {
      toast.error('Заявка не найдена');
      return;
    }
    
    // console.log('Полные данные заявки загружены:', fullApplication);
    // console.log('Документы:', fullApplication.documents?.length || 0);
    // console.log('Файлы заявления:', fullApplication.application_files?.length || 0);
    // console.log('Сертификаты олимпиад:', fullApplication.olympiad_certificates?.length || 0);
    
    selectedApplication.value = fullApplication;
    showModal.value = true;
  } catch (err) {
    console.error('Ошибка при открытии модального окна:', err);
    toast.error('Произошла ошибка при загрузке данных заявки');
  } finally {
    isUpdating.value = false;
  }
}

// Закрытие модального окна
function closeModal() {
  showModal.value = false;
  selectedApplication.value = null;
}

// Обработка обновления статуса заявки
async function handleStatusUpdate({ applicationId, statusId, comment }) {
  isUpdating.value = true;
  
  try {
    await applicationsApi.updateStatus(applicationId, statusId, comment);
    toast.success('Статус заявки успешно обновлен!');
    await loadApplications();
    closeModal();
  } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
    toast.error('Не удалось обновить статус заявки');
  } finally {
    isUpdating.value = false;
  }
}

const paginatedApplications = computed(() => applicationsList.value);
</script>

<style scoped>
.applications-manager {
  display: grid;
  gap: 24px;
}
</style>