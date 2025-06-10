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
              <span :class="!loadingPrograms ? 'text-green-600' : 'text-gray-400'">
                {{ !loadingPrograms ? '✅' : '⏳' }}
              </span>
              <span>Статистика по программам</span>
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

        <!-- Дополнительные карточки статистики -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          

          
          <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-teal-500">
            <div class="flex items-center">
              <div class="text-teal-500 text-2xl mr-3">🏠</div>
              <div>
                <p class="text-sm text-gray-600">Нужно общежитие</p>
                <p class="text-2xl font-bold text-gray-800">{{ generalStats.accommodation_needed || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-pink-500">
            <div class="flex items-center">
              <div class="text-pink-500 text-2xl mr-3">🏆</div>
              <div>
                <p class="text-sm text-gray-600">Олимпиадники</p>
                <p class="text-2xl font-bold text-gray-800">{{ generalStats.olympiad_participants || 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Графики статистики -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Статистика по датам -->
          <section class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">
              Статистика по датам
              </h2>
            <div class="h-80">
              <apexchart
                v-if="dailyChartSeries.length > 0"
                type="bar"
                height="320"
                :options="dailyChartOptions"
                :series="dailyChartSeries"
              />
              <div v-else class="flex items-center justify-center h-full">
                <p class="text-gray-500">Нет данных</p>
              </div>
            </div>
          </section>

          <!-- Статистика по регионам -->
          <section class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">
              Статистика по регионам
            </h2>
            <div class="h-80">
              <apexchart
                v-if="regionalChartSeries.length > 0"
                type="donut"
                height="320"
                :options="regionalChartOptions"
                :series="regionalChartSeries"
              />
              <div v-else class="flex items-center justify-center h-full">
                <p class="text-gray-500">Нет данных</p>
              </div>
            </div>
          </section>
        </div>

        <!-- Статистика по профилям и специализациям -->
        <div class="grid grid-cols-1 gap-8 mb-8">
          <!-- Статистика по профилям/специализациям -->
          <section class="bg-white p-6 rounded-lg shadow-md">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-800">
                Статистика по профилям и специализациям
              </h3>
              <button 
                @click="toggleProfilesView"
                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                {{ showProfilesChart ? 'Показать таблицу' : 'Показать график' }}
              </button>
            </div>
            
            <div class="h-80">
              <apexchart
                v-if="allDataLoaded && hasValidData.programs && showProfilesChart && programsChartSeries.length > 0"
                type="line"
                height="320"
                :options="programsChartOptions"
                :series="programsChartSeries"
              />
              
              <!-- Таблица профилей -->
              <div v-if="allDataLoaded && hasValidData.programs && !showProfilesChart" class="overflow-auto h-full">
                <table class="min-w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Профиль/Специализация
                      </th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Код направления
                      </th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Уровень
                      </th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Заявлений
                      </th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Принято
                      </th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        На рассмотрении
                      </th>

                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="program in programsStatsFiltered" :key="program.profile_id">
                      <td class="px-4 py-2 text-sm text-gray-900 max-w-xs">
                        <div class="truncate" :title="program.profile_name">
                          {{ program.profile_name }}
                        </div>
                      </td>
                      <td class="px-4 py-2 text-sm text-blue-600 font-medium">{{ program.direction_code }}</td>
                      <td class="px-4 py-2 text-sm text-gray-600">{{ program.level_name }}</td>
                      <td class="px-4 py-2 text-sm text-gray-900 font-semibold">{{ program.total_applications }}</td>
                      <td class="px-4 py-2 text-sm text-green-600 font-semibold">{{ program.accepted_applications }}</td>
                      <td class="px-4 py-2 text-sm text-yellow-600 font-semibold">{{ program.pending_applications }}</td>
                      
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
              
              <div v-if="allDataLoaded && !hasValidData.programs" class="flex items-center justify-center h-full">
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
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
  getProgramStats
} from '@/api/statistics';

// Данные статистики
const generalStats = ref({});
const dailyStats = ref([]);
const regionalStats = ref([]);
const programsStats = ref([]);
// Убираем directionsStats - больше не нужно

// Состояние загрузки для каждого блока
const loadingGeneral = ref(true);
const loadingDaily = ref(true);
const loadingRegional = ref(true);
const loadingPrograms = ref(true);
// Убираем loadingDirections - больше не нужно

// UI состояние
const showRegionalChart = ref(true);
const showProfilesChart = ref(true);
const isRefreshing = ref(false);
const lastUpdated = ref(new Date().toLocaleString('ru-RU'));

// Вычисляемые свойства
const allDataLoaded = computed(() => 
  !loadingGeneral.value && 
  !loadingDaily.value && 
  !loadingRegional.value && 
  !loadingPrograms.value
);

const hasValidData = computed(() => ({
  daily: dailyStats.value.length > 0,
  regional: regionalStats.value.length > 0,
  programs: programsStats.value.length > 0
}));

const programsStatsFiltered = computed(() => 
  programsStats.value.filter(p => p.total_applications > 0).slice(0, 10)
);

// Конфигурация графиков
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
  }
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
  }
});

const regionalChartSeries = ref([]);

const programsChartOptions = ref({
  chart: {
    type: 'line',
    height: 320,
    toolbar: { show: false },
    animations: { enabled: true }
  },
  dataLabels: {
    enabled: true,
    style: {
      fontSize: '12px',
      fontWeight: 'bold',
      colors: ['#304758']
    },
    background: {
      enabled: true,
      foreColor: '#fff',
      borderRadius: 2,
      borderWidth: 1,
      borderColor: '#fff',
      opacity: 0.9
    }
  },
  stroke: {
    width: 3,
    curve: 'smooth'
  },
  markers: {
    size: 6,
    strokeWidth: 2,
    strokeColors: '#fff'
  },
  xaxis: {
    categories: [],
    labels: {
      style: {
        colors: '#666',
        fontSize: '11px'
      },
      rotate: -45,
      rotateAlways: true,
      maxHeight: 120
    }
  },
  yaxis: {
    labels: { 
      style: {
        colors: '#666',
        fontSize: '12px'
      }
    },
    title: {
      text: 'Количество заявлений',
      style: {
        color: '#666',
        fontSize: '12px'
      }
    }
  },
  colors: ['#3B82F6', '#22C55E'],
  legend: { 
    position: 'top', 
    horizontalAlign: 'center',
    fontSize: '12px',
    itemMargin: { horizontal: 10, vertical: 5 }
  },
  grid: {
    borderColor: '#e7e7e7',
    strokeDashArray: 3
  },
  tooltip: {
    shared: true,
    intersect: false
  }
});

const programsChartSeries = ref([]);

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
    const result = await getDailyStats(7);
    
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
          name: 'Новые заявления',
          data: result.data.map(item => Number(item.new_applications) || 0)
        },
        {
          name: 'Принято',
          data: result.data.map(item => Number(item.accepted_applications) || 0)
        },
        {
          name: 'Отклонено',
          data: result.data.map(item => Number(item.rejected_applications) || 0)
        }
      ];
      
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

async function fetchProgramStats() {
  try {
    loadingPrograms.value = true;
    const result = await getProgramStats();
    
    if (result.success && result.data.length > 0) {
      programsStats.value = result.data;
      
      // Фильтруем только программы с заявлениями и берем топ-8
      const validData = result.data
        .filter(p => p.total_applications > 0)
        .sort((a, b) => b.total_applications - a.total_applications)
        .slice(0, 8);
      
      if (validData.length > 0) {
        // Подготавливаем категории для оси X
        programsChartOptions.value.xaxis.categories = validData.map(p => {
          const name = p.profile_name.length > 20 
            ? p.profile_name.substring(0, 20) + '...' 
            : p.profile_name;
          return `${name}`;
        });
        
        // Формируем данные для двух линий
        programsChartSeries.value = [
          {
            name: 'Всего заявлений',
            data: validData.map(p => parseInt(p.total_applications, 10))
          },
          {
            name: 'Принято',
            data: validData.map(p => parseInt(p.accepted_applications, 10))
          }
        ];
        
        // Обновляем для триггера реактивности
        programsChartOptions.value = { ...programsChartOptions.value };
      } else {
        programsChartSeries.value = [];
        programsChartOptions.value.xaxis.categories = [];
      }
    } else {
      programsChartSeries.value = [];
      programsChartOptions.value.xaxis.categories = [];
    }
  } catch (error) {
    console.error('Ошибка загрузки статистики по программам:', error);
    programsChartSeries.value = [];
    programsChartOptions.value.xaxis.categories = [];
  } finally {
    loadingPrograms.value = false;
  }
}

// UI функции
function toggleRegionalView() {
  showRegionalChart.value = !showRegionalChart.value;
}

function toggleProfilesView() {
  showProfilesChart.value = !showProfilesChart.value;
}

async function refreshAllData() {
  isRefreshing.value = true;
  
  try {
    await Promise.all([
      fetchGeneralStats(),
      fetchDailyStats(),
      fetchRegionalStats(),
      fetchProgramStats()
    ]);
    
    lastUpdated.value = new Date().toLocaleString('ru-RU');
    
  } catch (error) {
    console.error('Ошибка обновления данных:', error);
  } finally {
    isRefreshing.value = false;
  }
}

// Lifecycle
onMounted(() => {
  console.log('Component mounted, loading data...');
  fetchGeneralStats();
  fetchDailyStats();
  fetchRegionalStats();
  fetchProgramStats();
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