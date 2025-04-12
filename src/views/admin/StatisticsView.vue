<template>
  <div>
    <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Статистика приемной комиссии</h2>
        <p class="mt-1 text-sm text-gray-600">Данные о поступающих абитуриентах и поданных заявлениях</p>
      </div>
      
      <!-- Кнопка экспорта в Excel -->
      <button
        @click="exportStatisticsToExcel"
        :disabled="isExporting || isLoading"
        class="mt-4 sm:mt-0 inline-flex items-center justify-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {{ isExporting ? 'Экспорт...' : 'Экспорт в Excel' }}
      </button>
    </div>

    <!-- Отладочная информация -->
    <div v-if="isDebug" class="p-4 mb-6 bg-gray-100 rounded-md text-xs overflow-auto max-h-40">
      <pre>{{ JSON.stringify(statistics, null, 2) }}</pre>
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>

    <div v-else-if="error" class="p-4 mb-6 bg-red-50 text-red-700 rounded-md">
      {{ error }}
    </div>

    <div v-else>
      <!-- Основные метрики -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Всего заявок</h3>
          <div class="flex items-center">
            <div class="text-3xl font-bold text-primary-600">{{ totalApplications }}</div>
            <div v-if="weeklyGrowth !== null" class="ml-3 text-sm font-medium" 
                :class="weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'">
              <span v-if="weeklyGrowth >= 0">+</span>{{ weeklyGrowth }}% за неделю
            </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Принятые заявки</h3>
          <div class="flex items-center">
            <div class="text-3xl font-bold text-green-600">{{ acceptedApplications }}</div>
            <div class="ml-3 text-sm font-medium text-gray-600">
              {{ Math.round((acceptedApplications / totalApplications) * 100) || 0 }}% от общего числа
            </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">На рассмотрении</h3>
          <div class="flex items-center">
            <div class="text-3xl font-bold text-yellow-600">{{ pendingApplications }}</div>
            <div class="ml-3 text-sm font-medium text-gray-600">
              {{ Math.round((pendingApplications / totalApplications) * 100) || 0 }}% от общего числа
            </div>
          </div>
        </div>
      </div>

      <!-- График динамики подачи заявлений -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Динамика подачи заявлений</h3>
          <div class="h-80">
            <LineChart 
              :data="chartData.dailyData" 
              :options="chartOptions.dailyApplications" 
            />
          </div>
        </div>
        
        <!-- График по статусам заявлений -->
        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Статусы заявлений</h3>
          <div class="h-80">
            <DoughnutChart 
              :data="chartData.statusData" 
              :options="chartOptions.doughnut" 
            />
          </div>
        </div>
      </div>
      
      <!-- График по направлениям -->
      <div class="bg-white p-6 rounded-lg shadow-md border border-gray-100 mb-8">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Распределение по направлениям</h3>
        <div class="h-96">
          <BarChart 
            :data="chartData.directionData" 
            :options="chartOptions.applicationsByDirection" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useApplicationStore } from '@/stores/application';
import { Line as LineChart, Bar as BarChart, Doughnut as DoughnutChart } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement } from 'chart.js';
import { useToast } from 'vue-toastification';

// Регистрируем компоненты Chart.js
ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement);

const applicationStore = useApplicationStore();
const toast = useToast();
const isLoading = ref(true);
const error = ref(null);
const isDebug = ref(false); // Режим отладки (можно включить при необходимости)
const isExporting = ref(false); // Флаг экспорта данных

// Данные статистики
const statistics = ref({
  dailyStats: [],
  directionStats: [],
  statusStats: []
});

// Данные для графиков (преобразованные из API)
const chartData = reactive({
  dailyData: {
    labels: [],
    datasets: [{
      label: 'Количество заявлений',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 2,
      pointBackgroundColor: 'rgb(75, 192, 192)',
      data: [],
      tension: 0.3
    }]
  },
  directionData: {
    labels: [],
    datasets: [{
      label: 'Количество заявлений',
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
      ],
      data: []
    }]
  },
  statusData: {
    labels: [],
    datasets: [{
      backgroundColor: [
        'rgba(16, 185, 129, 0.7)', // зеленый - accepted
        'rgba(245, 158, 11, 0.7)', // оранжевый - pending
        'rgba(239, 68, 68, 0.7)',  // красный - rejected
        'rgba(59, 130, 246, 0.7)'  // синий - submitted
      ],
      data: []
    }]
  }
});

// Вычисляемые метрики
const totalApplications = computed(() => {
  if (!statistics.value?.statusStats?.length) return 0;
  return statistics.value.statusStats.reduce((sum, item) => sum + (item.count || 0), 0);
});

const acceptedApplications = computed(() => {
  const acceptedStatus = statistics.value?.statusStats?.find(s => s.status === 'accepted');
  return acceptedStatus?.count || 0;
});

const pendingApplications = computed(() => {
  const pendingStatus = statistics.value?.statusStats?.find(s => s.status === 'pending') || 
                        statistics.value?.statusStats?.find(s => s.status === 'submitted');
  return pendingStatus?.count || 0;
});

const weeklyGrowth = computed(() => {
  if (!statistics.value?.dailyStats?.length) return null;
  
  // Сортируем данные по дате
  const sortedData = [...statistics.value.dailyStats].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
  
  // Если меньше 14 дней данных, вернем null
  if (sortedData.length < 14) return null;
  
  // Разделяем на две недели
  const lastWeek = sortedData.slice(-7);
  const previousWeek = sortedData.slice(-14, -7);
  
  // Считаем сумму заявок за каждую неделю
  const lastWeekSum = lastWeek.reduce((sum, day) => sum + day.count, 0);
  const previousWeekSum = previousWeek.reduce((sum, day) => sum + day.count, 0);
  
  // Рассчитываем процент роста
  if (previousWeekSum === 0) return lastWeekSum > 0 ? 100 : 0;
  
  const growthPercent = ((lastWeekSum - previousWeekSum) / previousWeekSum) * 100;
  return Math.round(growthPercent);
});

// Опции для графиков
const chartOptions = reactive({
  dailyApplications: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  },
  applicationsByDirection: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  },
  doughnut: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right'
      }
    }
  }
});

// Функция для обновления данных графиков на основе API данных
const updateChartsWithApiData = () => {
  // Обновляем данные графика по дням
  if (statistics.value.dailyStats && statistics.value.dailyStats.length > 0) {
    // Сортируем данные по дате
    const sortedDailyData = [...statistics.value.dailyStats].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Форматируем даты для подписей оси X и получаем значения для оси Y
    chartData.dailyData.labels = sortedDailyData.map(item => {
      const date = new Date(item.date);
      return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    });
    chartData.dailyData.datasets[0].data = sortedDailyData.map(item => item.count);
  } else {
    chartData.dailyData.labels = [];
    chartData.dailyData.datasets[0].data = [];
  }
  
  // Обновляем данные графика по направлениям
  if (statistics.value.directionStats && statistics.value.directionStats.length > 0) {
    chartData.directionData.labels = statistics.value.directionStats.map(item => item.direction_name);
    chartData.directionData.datasets[0].data = statistics.value.directionStats.map(item => item.count);
    
    // Убеждаемся, что у нас достаточно цветов
    while (chartData.directionData.datasets[0].backgroundColor.length < chartData.directionData.labels.length) {
      chartData.directionData.datasets[0].backgroundColor.push(
        `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`
      );
    }
  } else {
    chartData.directionData.labels = [];
    chartData.directionData.datasets[0].data = [];
  }
  
  // Обновляем данные графика по статусам
  if (statistics.value.statusStats && statistics.value.statusStats.length > 0) {
    // Отображаем статусы в понятном для пользователя формате
    const statusNames = {
      'submitted': 'Отправлено',
      'pending': 'На рассмотрении',
      'accepted': 'Принято',
      'rejected': 'Отклонено'
    };
    
    chartData.statusData.labels = statistics.value.statusStats.map(item => statusNames[item.status] || item.status);
    chartData.statusData.datasets[0].data = statistics.value.statusStats.map(item => item.count);
  } else {
    chartData.statusData.labels = [];
    chartData.statusData.datasets[0].data = [];
  }
};

// Загрузка данных
const loadStatistics = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    // Загружаем данные с API
    console.log('Загрузка статистики с API...');
    const { success, data, error: statsError } = await applicationStore.getApplicationsStatistics();
    
    if (!success) {
      throw new Error(statsError || 'Не удалось загрузить статистику');
    }
    
    // Используем данные API или пример, если данных нет
    if (data) {
      statistics.value = data;
    } else {
      // Если API вернул пустые данные, загружаем пример API данных
      loadApiExampleData();
    }
    
    // Обновляем данные графиков
    updateChartsWithApiData();
    
    console.log('Загруженная статистика:', JSON.stringify(statistics.value));
  } catch (err) {
    console.error('Ошибка загрузки статистики:', err);
    error.value = err.message || 'Произошла ошибка при загрузке данных статистики';
    
    // В случае ошибки загружаем пример API данных
    loadApiExampleData();
  } finally {
    isLoading.value = false;
  }
};

// Функция для загрузки примера данных API
const loadApiExampleData = () => {
  // Пример данных из API (как предоставил пользователь)
  statistics.value = {
    dailyStats: [
      { date: "2025-04-05", count: 5 },
      { date: "2025-04-06", count: 1 },
      { date: "2025-04-07", count: 2 },
      { date: "2025-04-08", count: 1 }
    ],
    directionStats: [
      { direction_id: 3, direction_name: "Информатика и вычислительная техника", count: 7 },
      { direction_id: 1, direction_name: "Нефтегазовое дело", count: 2 }
    ],
    statusStats: [
      { status: "submitted", count: 9 }
    ]
  };
  
  // Обновляем данные графиков
  updateChartsWithApiData();
};

// Наблюдаем за изменениями статистики для обновления графиков
watch(() => statistics.value, () => {
  updateChartsWithApiData();
}, { deep: true });

// Загрузка данных при монтировании компонента
onMounted(() => {
  console.log('Компонент StatisticsView смонтирован');
  loadStatistics();
});

// Функция экспорта статистики в Excel
const exportStatisticsToExcel = async () => {
  isExporting.value = true;
  
  try {
    const { success, error } = await applicationStore.exportAllApplicantsToExcel();
    
    if (success) {
      toast.success('Статистика успешно экспортирована в Excel');
    } else {
      toast.error(`Ошибка при экспорте статистики: ${error}`);
    }
  } catch (err) {
    console.error('Ошибка экспорта:', err);
    toast.error('Произошла ошибка при экспорте статистики');
  } finally {
    isExporting.value = false;
  }
};
</script>
