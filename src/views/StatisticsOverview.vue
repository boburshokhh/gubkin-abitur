<template>
  <div class="min-h-screen bg-gray-50">
  <div class="container mx-auto p-4 md:p-8">
      <!-- Заголовок -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          Обзор статистики приёмной кампании
        </h1>
        <p class="text-gray-600">
          Актуальная статистика поступления в Филиал РГУ нефти и газа имени И.М. Губкина
        </p>
      </div>

      <!-- Общий лоадер пока все данные не загрузились -->
      <div v-if="!allDataLoaded" class="flex items-center justify-center min-h-[500px]">
        <div class="text-center">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
          <p class="text-gray-600 text-xl mb-4">Загрузка статистики...</p>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="flex items-center space-x-2">
              <span :class="!loadingGeneral ? 'text-green-600' : 'text-gray-400'">
                {{ !loadingGeneral ? '✅' : '⏳' }}
              </span>
              <span>Общая статистика</span>
            </div>
            <div class="flex items-center space-x-2">
              <span :class="!loadingDaily ? 'text-green-600' : 'text-gray-400'">
                {{ !loadingDaily ? '✅' : '⏳' }}
              </span>
              <span>Ежедневная статистика</span>
            </div>
            <div class="flex items-center space-x-2">
              <span :class="!loadingRegional ? 'text-green-600' : 'text-gray-400'">
                {{ !loadingRegional ? '✅' : '⏳' }}
              </span>
              <span>Региональная статистика</span>
            </div>
            <div class="flex items-center space-x-2">
              <span :class="!loadingDirections ? 'text-green-600' : 'text-gray-400'">
                {{ !loadingDirections ? '✅' : '⏳' }}
              </span>
              <span>Статистика направлений</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Основной контент отображается только после загрузки всех данных -->
      <div v-else>
        <!-- Общая статистика - карточки -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div class="flex items-center">
              <div class="text-blue-500 text-2xl mr-3">📊</div>
              <div>
                <p class="text-sm text-gray-600">Всего заявлений</p>
                <p class="text-2xl font-bold text-gray-800">{{ generalStats.total_applications || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div class="flex items-center">
              <div class="text-green-500 text-2xl mr-3">✅</div>
              <div>
                <p class="text-sm text-gray-600">Принято</p>
                <p class="text-2xl font-bold text-gray-800">{{ generalStats.accepted_applications || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div class="flex items-center">
              <div class="text-yellow-500 text-2xl mr-3">⏳</div>
              <div>
                <p class="text-sm text-gray-600">На рассмотрении</p>
                <p class="text-2xl font-bold text-gray-800">{{ generalStats.pending_applications || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
            <div class="flex items-center">
              <div class="text-red-500 text-2xl mr-3">❌</div>
              <div>
                <p class="text-sm text-gray-600">Отклонено</p>
                <p class="text-2xl font-bold text-gray-800">{{ generalStats.rejected_applications || 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Основные графики -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Статистика по датам -->
          <section class="bg-white p-6 rounded-lg shadow-md">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-800">
                Статистика по приему документов по датам
              </h2>
              <div class="text-sm text-gray-500">
                Последние {{ dailyStats.length }} дней
              </div>
            </div>
            
            <div class="h-80">
              <apexchart
                v-if="allDataLoaded && hasValidData.daily && dailyChartSeries.length > 0"
                type="bar"
                height="320"
                :options="dailyChartOptions"
                :series="dailyChartSeries"
              />
              <div v-else-if="!allDataLoaded" class="flex items-center justify-center h-full">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p class="text-gray-500">Загрузка данных...</p>
                </div>
              </div>
              <div v-else class="flex items-center justify-center h-full">
                <p class="text-gray-500">Нет данных для отображения</p>
              </div>
            </div>
          </section>

          <!-- Статистика по регионам -->
          <section class="bg-white p-6 rounded-lg shadow-md">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-800">
                Статистика поступивших документов по регионам
              </h2>
              <button 
                @click="toggleRegionalView"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                {{ showRegionalChart ? 'Показать таблицу' : 'Показать график' }}
              </button>
            </div>
            
            <div class="h-80">
              <apexchart
                v-if="allDataLoaded && hasValidData.regional && showRegionalChart && regionalChartSeries.length > 0"
                type="donut"
                height="320"
                :options="regionalChartOptions"
                :series="regionalChartSeries"
              />
              
              <!-- Таблица регионов -->
              <div v-if="allDataLoaded && hasValidData.regional && !showRegionalChart" class="overflow-auto h-full">
                <table class="min-w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Регион
                      </th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Всего
                      </th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Принято
                      </th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Отклонено
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="region in regionalStats" :key="region.region_code">
                      <td class="px-4 py-2 text-sm text-gray-900">{{ region.region_name }}</td>
                      <td class="px-4 py-2 text-sm text-gray-900">{{ region.total_applications }}</td>
                      <td class="px-4 py-2 text-sm text-green-600">{{ region.accepted_applications }}</td>
                      <td class="px-4 py-2 text-sm text-red-600">{{ region.rejected_applications }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div v-if="!allDataLoaded" class="flex items-center justify-center h-full">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p class="text-gray-500">Загрузка данных...</p>
                </div>
              </div>
              
              <div v-if="allDataLoaded && !hasValidData.regional" class="flex items-center justify-center h-full">
                <p class="text-gray-500">Нет данных для отображения</p>
              </div>
            </div>
          </section>
        </div>

        <!-- Статистика по направлениям -->
        <div class="grid grid-cols-1 gap-8 mb-8">
          <section class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">
              Статистика по направлениям обучения
            </h3>
            
            <div class="h-80">
              <apexchart
                v-if="allDataLoaded && hasValidData.directions && directionsChartSeries.length > 0"
                type="bar"
                height="320"
                :options="directionsChartOptions"
                :series="directionsChartSeries"
              />
              <div v-else-if="!allDataLoaded" class="flex items-center justify-center h-full">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p class="text-gray-500">Загрузка данных...</p>
                </div>
              </div>
              <div v-else class="flex items-center justify-center h-full">
                <p class="text-gray-500">Нет данных для отображения</p>
              </div>
            </div>
          </section>
        </div>

        <!-- Обновление данных -->
        <div class="text-center mt-8">
          <button 
            @click="refreshAllData"
            :disabled="isRefreshing"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="!isRefreshing">🔄 Обновить данные</span>
            <span v-else>⏳ Обновление...</span>
          </button>
          
          <p class="text-sm text-gray-500 mt-2">
            Последнее обновление: {{ lastUpdated }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { 
  getGeneralStats,
  getDailyStats,
  getRegionalStats,
  getDirectionsStats,
  getAllStats
} from '@/api/statistics';

// Состояние загрузки
const loadingDaily = ref(true);
const loadingRegional = ref(true);
const loadingDirections = ref(true);
const loadingGeneral = ref(true);
const isRefreshing = ref(false);

// Проверка готовности всех данных
const allDataLoaded = computed(() => {
  return !loadingDaily.value && 
         !loadingRegional.value && 
         !loadingDirections.value && 
         !loadingGeneral.value;
});

// Проверка наличия данных для графиков
const hasValidData = computed(() => {
  return {
    daily: dailyStats.value.length > 0,
    regional: regionalStats.value.length > 0,
    directions: directionsStats.value.length > 0,
    general: Object.keys(generalStats.value).length > 0
  };
});

// Данные
const dailyStats = ref([]);
const regionalStats = ref([]);
const directionsStats = ref([]);
const generalStats = ref({});

// UI состояние
const showRegionalChart = ref(true);
const lastUpdated = ref(new Date().toLocaleString('ru-RU'));

// ApexCharts конфигурации
const dailyChartOptions = ref({
  chart: {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
    animations: { enabled: true }
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      dataLabels: { position: 'top' }
    }
  },
  dataLabels: {
    enabled: true,
    offsetY: -20,
    style: { fontSize: '12px', colors: ['#304758'] }
  },
  xaxis: {
    categories: [],
    position: 'bottom',
    labels: { 
      style: { colors: '#666', fontSize: '12px' },
      rotate: -45,
      rotateAlways: true
    }
  },
  yaxis: {
    labels: { style: { colors: '#666', fontSize: '12px' } }
  },
  colors: ['#3B82F6', '#22C55E', '#EF4444', '#F59E0B'],
  legend: { 
    position: 'top', 
    horizontalAlign: 'center',
    fontSize: '12px',
    itemMargin: { horizontal: 5, vertical: 0 }
  },
  responsive: [{
    breakpoint: 768,
    options: {
      plotOptions: {
        bar: {
          horizontal: false
        }
      },
      legend: {
        position: 'bottom'
      },
      xaxis: {
        labels: {
          style: { fontSize: '10px' },
          rotate: -90
        }
      }
    }
  }],
  series: []
});

const dailyChartSeries = ref([]);

const regionalChartOptions = ref({
  chart: {
    type: 'donut',
    height: 320
  },
  labels: [],
  colors: [
    '#3B82F6', '#22C55E', '#EF4444', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#0EA5E9', '#F97316'
  ],
  legend: { 
    position: 'bottom',
    fontSize: '12px',
    itemMargin: { horizontal: 5, vertical: 2 }
  },
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Всего',
            fontSize: '16px',
            fontWeight: 600
          }
        }
      }
    }
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        height: 280
      },
      legend: {
        position: 'bottom',
        fontSize: '10px'
      }
    }
  }],
  series: []
});

const regionalChartSeries = ref([]);

const directionsChartOptions = ref({
  chart: {
    type: 'bar',
    height: 320,
    toolbar: { show: false }
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: true,
      dataLabels: { position: 'top' }
    }
  },
  dataLabels: {
    enabled: true,
    style: { fontSize: '12px', colors: ['#fff'] }
  },
  xaxis: {
    categories: [],
    labels: { style: { colors: '#666', fontSize: '12px' } }
  },
  yaxis: {
    labels: { 
      style: { colors: '#666', fontSize: '11px' },
      maxWidth: 200
    }
  },
  colors: ['#3B82F6', '#22C55E', '#EF4444'],
  legend: { 
    position: 'top', 
    horizontalAlign: 'center',
    fontSize: '12px',
    itemMargin: { horizontal: 5, vertical: 0 }
  },
  responsive: [{
    breakpoint: 768,
    options: {
      plotOptions: {
        bar: {
          horizontal: false
        }
      },
      legend: {
        position: 'bottom'
      },
      yaxis: {
        labels: {
          style: { fontSize: '10px' },
          maxWidth: 150
        }
      }
    }
  }],
  series: []
});

const directionsChartSeries = ref([]);

// API функции
async function fetchGeneralStats() {
  try {
    loadingGeneral.value = true;
    const result = await getGeneralStats();
    
    if (result.success) {
      generalStats.value = result.data;
    } else {
      console.error('Ошибка загрузки общей статистики:', result.error);
    }
  } catch (error) {
    console.error('Ошибка загрузки общей статистики:', error);
  } finally {
    loadingGeneral.value = false;
  }
}

async function fetchDailyStats() {
  try {
    loadingDaily.value = true;
    const result = await getDailyStats();
    
    if (result.success && result.data.length > 0) {
      dailyStats.value = result.data;
      
      // Подготавливаем данные для графика
      const categories = result.data.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('ru-RU', { 
          month: 'short', 
          day: 'numeric' 
        });
      });
      
      dailyChartOptions.value.xaxis.categories = categories;
      dailyChartSeries.value = [
        {
          name: 'Всего заявлений',
          data: result.data.map(item => Number(item.total_applications) || 0)
        },
        {
          name: 'Принято',
          data: result.data.map(item => Number(item.accepted_applications) || 0)
        },
        {
          name: 'Отклонено',
          data: result.data.map(item => Number(item.rejected_applications) || 0)
        },
        {
          name: 'На рассмотрении',
          data: result.data.map(item => Number(item.pending_applications) || 0)
        }
      ];
      
      // Обновляем цвета для всех серий
      dailyChartOptions.value.colors = ['#3B82F6', '#22C55E', '#EF4444', '#F59E0B'];
      
      // Принудительно обновляем опции для триггера реактивности
      dailyChartOptions.value = { ...dailyChartOptions.value };
      
    } else {
      dailyChartSeries.value = [];
    }
  } catch (error) {
    console.error('Ошибка загрузки статистики по датам:', error);
    dailyChartSeries.value = [];
  } finally {
    loadingDaily.value = false;
  }
}

async function fetchRegionalStats() {
  try {
    loadingRegional.value = true;
    const result = await getRegionalStats();
    
    if (result.success && result.data.length > 0) {
      regionalStats.value = result.data;
      
      // Фильтруем данные с количеством > 0
      const validData = result.data.filter(item => item.total_applications > 0);
      
      if (validData.length > 0) {
        // Подготавливаем данные для графика
        regionalChartOptions.value.labels = validData.map(item => item.region_name);
        regionalChartSeries.value = validData.map(item => Number(item.total_applications));
        
        // Обновляем опции для триггера реактивности
        regionalChartOptions.value = { ...regionalChartOptions.value };
      } else {
        regionalChartSeries.value = [];
        regionalChartOptions.value.labels = [];
      }
    } else {
      regionalChartSeries.value = [];
      regionalChartOptions.value.labels = [];
    }
  } catch (error) {
    console.error('Ошибка загрузки региональной статистики:', error);
    regionalChartSeries.value = [];
    regionalChartOptions.value.labels = [];
  } finally {
    loadingRegional.value = false;
  }
}

async function fetchDirectionsStats() {
  try {
    loadingDirections.value = true;
    const result = await getDirectionsStats();
    
    if (result.success && result.data.length > 0) {
      directionsStats.value = result.data;
      
      // Фильтруем данные с количеством > 0
      const validData = result.data.filter(item => item.total_applications > 0);
      
      if (validData.length > 0) {
        // Подготавливаем данные для графика
        const categories = validData.map(item => 
          item.direction_name.length > 30 
            ? item.direction_name.substring(0, 30) + '...'
            : item.direction_name
        );
        
        directionsChartOptions.value.xaxis.categories = categories;
        directionsChartSeries.value = [
          {
            name: 'Всего заявлений',
            data: validData.map(item => Number(item.total_applications) || 0)
          },
          {
            name: 'Принято',
            data: validData.map(item => Number(item.accepted_applications) || 0)
          },
          {
            name: 'Отклонено',
            data: validData.map(item => Number(item.rejected_applications) || 0)
          }
        ];
        
        // Обновляем цвета для всех серий
        directionsChartOptions.value.colors = ['#3B82F6', '#22C55E', '#EF4444'];
        
        // Обновляем опции для триггера реактивности
        directionsChartOptions.value = { ...directionsChartOptions.value };
      } else {
        directionsChartSeries.value = [];
        directionsChartOptions.value.xaxis.categories = [];
      }
    } else {
      directionsChartSeries.value = [];
      directionsChartOptions.value.xaxis.categories = [];
    }
  } catch (error) {
    console.error('Ошибка загрузки статистики по направлениям:', error);
    directionsChartSeries.value = [];
    directionsChartOptions.value.xaxis.categories = [];
  } finally {
    loadingDirections.value = false;
  }
}

// UI функции
function toggleRegionalView() {
  showRegionalChart.value = !showRegionalChart.value;
}

async function refreshAllData() {
  isRefreshing.value = true;
  
  try {
    await Promise.all([
      fetchGeneralStats(),
      fetchDailyStats(),
      fetchRegionalStats(),
      fetchDirectionsStats()
    ]);
    
    lastUpdated.value = new Date().toLocaleString('ru-RU');
    
  } catch (error) {
    console.error('Ошибка обновления данных:', error);
  } finally {
    isRefreshing.value = false;
  }
}

// Lifecycle
onMounted(async () => {
  console.log('Component mounted, loading data...');
  await refreshAllData();
});
</script>

<style scoped>
/* Дополнительные стили для лучшего отображения */
.container {
  max-width: 1200px;
}

/* Анимации */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Стили для таблицы */
table {
  font-size: 0.875rem;
}

th {
  background-color: #f9fafb;
}

tr:hover {
  background-color: #f9fafb;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .md\\:grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style> 