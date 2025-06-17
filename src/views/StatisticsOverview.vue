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

      <!-- Общий лоадер -->
      <div v-if="!allDataLoaded" class="flex items-center justify-center min-h-[400px]">
        <div class="text-center">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-gray-600 text-lg">Загрузка статистики...</p>
        </div>
      </div>

      <!-- Основной контент -->
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

        <!-- Дополнительные карточки -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div class="flex items-center">
              <div class="text-purple-500 text-2xl mr-3">📚</div>
              <div>
                <p class="text-sm text-gray-600">Всего профилей</p>
                <p class="text-2xl font-bold text-gray-800">{{ programsStats.length || 0 }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
            <div class="flex items-center">
              <div class="text-indigo-500 text-2xl mr-3">🎯</div>
              <div>
                <p class="text-sm text-gray-600">Профили с заявлениями</p>
                <p class="text-2xl font-bold text-gray-800">{{ activePrograms || 0 }}</p>
              </div>
            </div>
          </div>
          
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

        <!-- Статистика по датам (полная таблица) -->
        <section class="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            Статистика поступления заявлений по периодам (последние 15 дней)
          </h2>
          <div class="overflow-x-auto">
            <table v-if="recentDailyStats.length > 0" class="min-w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Новые</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Всего</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Принято</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Отклонено</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">На рассмотрении</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="day in recentDailyStats" :key="day.date">
                  <td class="px-4 py-2 text-sm text-gray-900">{{ formatDate(day.date) }}</td>
                  <td class="px-4 py-2 text-sm font-semibold text-blue-600">{{ day.new_applications }}</td>
                  <td class="px-4 py-2 text-sm font-semibold text-gray-800">{{ day.total_applications }}</td>
                  <td class="px-4 py-2 text-sm font-semibold text-green-600">{{ day.accepted_applications }}</td>
                  <td class="px-4 py-2 text-sm font-semibold text-red-600">{{ day.rejected_applications }}</td>
                  <td class="px-4 py-2 text-sm font-semibold text-yellow-600">{{ day.pending_applications }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="text-center py-8 text-gray-500">
              Нет данных за последние дни
            </div>
          </div>
        </section>

        <!-- Статистика по всем регионам -->
        <section class="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            Статистика по всем регионам ({{ allRegions.length }} регионов)
          </h2>
          <div class="overflow-x-auto max-h-96">
            <table v-if="allRegions.length > 0" class="min-w-full">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Регион</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Код</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Всего</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Принято</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Отклонено</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">На рассмотрении</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="region in allRegions" :key="region.region_id" :class="{ 'bg-yellow-50': region.total_applications > 0 }">
                  <td class="px-4 py-2 text-sm text-gray-900">{{ region.region_name }}</td>
                  <td class="px-4 py-2 text-sm text-gray-600">{{ region.region_code }}</td>
                  <td class="px-4 py-2 text-sm font-semibold" :class="region.total_applications > 0 ? 'text-blue-600' : 'text-gray-400'">
                    {{ region.total_applications }}
                  </td>
                  <td class="px-4 py-2 text-sm font-semibold text-green-600">{{ region.accepted_applications }}</td>
                  <td class="px-4 py-2 text-sm font-semibold text-red-600">{{ region.rejected_applications }}</td>
                  <td class="px-4 py-2 text-sm font-semibold text-yellow-600">{{ region.pending_applications }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="text-center py-8 text-gray-500">
              Нет данных по регионам
            </div>
          </div>
        </section>

        <!-- Статистика по всем профилям -->
        <section class="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            Статистика по всем профилям и специализациям ({{ allPrograms.length }} профилей)
          </h3>
          
          <div class="overflow-x-auto max-h-96">
            <table v-if="allPrograms.length > 0" class="min-w-full">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Профиль/Специализация
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Код
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Уровень
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Заявлений
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Принято
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Отклонено
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    На рассмотрении
                  </th>

                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="program in allPrograms" :key="program.profile_id" :class="{ 'bg-blue-50': program.total_applications > 0 }">
                  <td class="px-4 py-2 text-sm text-gray-900 max-w-xs">
                    <div class="truncate" :title="program.profile_name">
                      {{ program.profile_name }}
                    </div>
                  </td>
                  <td class="px-4 py-2 text-sm text-blue-600 font-medium">{{ program.direction_code }}</td>
                  <td class="px-4 py-2 text-sm text-gray-600">{{ program.level_name }}</td>
                  <td class="px-4 py-2 text-sm font-semibold" :class="program.total_applications > 0 ? 'text-gray-900' : 'text-gray-400'">
                    {{ program.total_applications }}
                  </td>
                  <td class="px-4 py-2 text-sm text-green-600 font-semibold">{{ program.accepted_applications }}</td>
                  <td class="px-4 py-2 text-sm text-red-600 font-semibold">{{ program.rejected_applications }}</td>
                  <td class="px-4 py-2 text-sm text-yellow-600 font-semibold">{{ program.pending_applications }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="text-center py-8 text-gray-500">
              Нет данных по программам
            </div>
          </div>
        </section>

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

// Состояние загрузки
const loadingGeneral = ref(true);
const loadingDaily = ref(true);
const loadingRegional = ref(true);
const loadingPrograms = ref(true);

// UI состояние
const isRefreshing = ref(false);
const lastUpdated = ref(new Date().toLocaleString('ru-RU'));

// Вычисляемые свойства
const allDataLoaded = computed(() => 
  !loadingGeneral.value && 
  !loadingDaily.value && 
  !loadingRegional.value && 
  !loadingPrograms.value
);

const activePrograms = computed(() => 
  programsStats.value.filter(p => p.total_applications > 0).length
);

// Показываем все программы, отсортированные по количеству заявлений
const allPrograms = computed(() => 
  programsStats.value
    .sort((a, b) => b.total_applications - a.total_applications)
);

// Показываем все регионы, отсортированные по количеству заявлений  
const allRegions = computed(() => 
  regionalStats.value
    .sort((a, b) => b.total_applications - a.total_applications)
);

// Показываем последние 15 дней
const recentDailyStats = computed(() => 
  dailyStats.value.slice(0, 15)
);

// Утилиты
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { 
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
};

// API функции
async function fetchGeneralStats() {
  try {
    loadingGeneral.value = true;
    const result = await getGeneralStats();
    
    if (result.success) {
      generalStats.value = result.data;
    }
  } catch (error) {
    // Ошибка обработана в API функции
  } finally {
    loadingGeneral.value = false;
  }
}

async function fetchDailyStats() {
  try {
    loadingDaily.value = true;
    const result = await getDailyStats(15); // Получаем данные за последние 15 дней
    
    if (result.success && result.data.length > 0) {
      dailyStats.value = result.data;
    }
  } catch (error) {
    // Ошибка обработана в API функции
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
    }
  } catch (error) {
    // Ошибка обработана в API функции
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
    }
  } catch (error) {
    // Ошибка обработана в API функции
  } finally {
    loadingPrograms.value = false;
  }
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
    // Ошибки обработаны в отдельных функциях
  } finally {
    isRefreshing.value = false;
  }
}

// Lifecycle
onMounted(() => {
  fetchGeneralStats();
  fetchDailyStats();
  fetchRegionalStats();
  fetchProgramStats();
});
</script>

<style scoped>
.container {
  max-width: 1400px;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

table { font-size: 0.875rem; }
th { background-color: #f9fafb; }
tr:hover { background-color: #f9fafb; }

/* Прокрутка для длинных таблиц */
.max-h-96 {
  max-height: 24rem;
  overflow-y: auto;
}

/* Липкий заголовок для прокручиваемых таблиц */
.sticky {
  position: sticky;
  z-index: 10;
}

@media (max-width: 768px) {
  .grid-cols-2 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .md\\:grid-cols-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>