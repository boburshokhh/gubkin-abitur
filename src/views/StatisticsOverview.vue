<template>
  <el-container class="statistics-page">
    <el-main class="statistics-page__main">
      <el-card shadow="never" class="statistics-page__hero">
        <h1 class="statistics-page__title">Обзор статистики приёмной кампании</h1>
        <el-text type="info">
          Актуальная статистика поступления в Филиал РГУ нефти и газа имени И.М. Губкина
        </el-text>
      </el-card>

      <el-skeleton v-if="!allDataLoaded" :rows="10" animated />

      <template v-else>
        <el-row :gutter="16" class="statistics-page__grid">
          <el-col
            v-for="card in summaryCards"
            :key="card.label"
            :xs="24"
            :sm="12"
            :lg="6"
          >
            <el-card shadow="never" class="statistics-page__stat-card">
              <el-statistic :title="card.label" :value="card.value" />
            </el-card>
          </el-col>
        </el-row>

        <el-card shadow="never" class="statistics-page__section">
          <template #header>
            <div class="statistics-page__section-header">
              <span>Статистика поступления заявлений по периодам</span>
              <el-tag effect="light">Последние 15 дней</el-tag>
            </div>
          </template>

          <el-table v-if="recentDailyStats.length" :data="recentDailyStats" border stripe>
            <el-table-column label="Дата" min-width="130">
              <template #default="{ row }">{{ formatDate(row.date) }}</template>
            </el-table-column>
            <el-table-column prop="new_applications" label="Новые" min-width="100" />
            <el-table-column prop="total_applications" label="Всего" min-width="100" />
            <el-table-column prop="accepted_applications" label="Принято" min-width="110" />
            <el-table-column prop="rejected_applications" label="Отклонено" min-width="120" />
            <el-table-column prop="pending_applications" label="На рассмотрении" min-width="150" />
          </el-table>
          <el-empty v-else description="Нет данных за последние дни" />
        </el-card>

        <el-card shadow="never" class="statistics-page__section">
          <template #header>
            <div class="statistics-page__section-header">
              <span>Статистика по всем регионам</span>
              <el-tag type="success" effect="light">{{ allRegions.length }} регионов</el-tag>
            </div>
          </template>

          <el-table v-if="allRegions.length" :data="allRegions" border stripe max-height="420">
            <el-table-column prop="region_name" label="Регион" min-width="240" />
            <el-table-column prop="region_code" label="Код" width="110" />
            <el-table-column prop="total_applications" label="Всего" width="110" />
            <el-table-column prop="accepted_applications" label="Принято" width="120" />
            <el-table-column prop="rejected_applications" label="Отклонено" width="130" />
            <el-table-column prop="pending_applications" label="На рассмотрении" width="160" />
          </el-table>
          <el-empty v-else description="Нет данных по регионам" />
        </el-card>

        <el-card shadow="never" class="statistics-page__section">
          <template #header>
            <div class="statistics-page__section-header">
              <span>Статистика по всем профилям и специализациям</span>
              <el-tag type="primary" effect="light">{{ allPrograms.length }} профилей</el-tag>
            </div>
          </template>

          <el-table v-if="allPrograms.length" :data="allPrograms" border stripe max-height="420">
            <el-table-column prop="profile_name" label="Профиль/Специализация" min-width="320" show-overflow-tooltip />
            <el-table-column prop="direction_code" label="Код" width="120" />
            <el-table-column prop="level_name" label="Уровень" min-width="150" />
            <el-table-column prop="total_applications" label="Заявлений" width="120" />
            <el-table-column prop="accepted_applications" label="Принято" width="120" />
            <el-table-column prop="rejected_applications" label="Отклонено" width="130" />
            <el-table-column prop="pending_applications" label="На рассмотрении" width="160" />
          </el-table>
          <el-empty v-else description="Нет данных по программам" />
        </el-card>

        <el-card shadow="never" class="statistics-page__footer">
          <el-space wrap>
            <el-button type="primary" :loading="isRefreshing" @click="refreshAllData">
              Обновить данные
            </el-button>
            <el-text type="info">Последнее обновление: {{ lastUpdated }}</el-text>
          </el-space>
        </el-card>
      </template>
    </el-main>
  </el-container>
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

const summaryCards = computed(() => [
  { label: 'Всего заявлений', value: generalStats.value.total_applications || 0 },
  { label: 'Принято', value: generalStats.value.accepted_applications || 0 },
  { label: 'На рассмотрении', value: generalStats.value.pending_applications || 0 },
  { label: 'Отклонено', value: generalStats.value.rejected_applications || 0 },
  { label: 'Всего профилей', value: programsStats.value.length || 0 },
  { label: 'Профили с заявлениями', value: activePrograms.value || 0 },
  { label: 'Нужно общежитие', value: generalStats.value.accommodation_needed || 0 },
  { label: 'Олимпиадники', value: generalStats.value.olympiad_participants || 0 }
]);

// Показываем все программы, отсортированные по количеству заявлений
const allPrograms = computed(() => 
  [...programsStats.value]
    .sort((a, b) => b.total_applications - a.total_applications)
);

// Показываем все регионы, отсортированные по количеству заявлений  
const allRegions = computed(() => 
  [...regionalStats.value]
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
.statistics-page {
  min-height: 100vh;
  background: var(--el-bg-color-page);
}

.statistics-page__main {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.statistics-page__hero,
.statistics-page__section,
.statistics-page__footer {
  margin-bottom: 18px;
  border-radius: 12px;
}

.statistics-page__hero {
  text-align: center;
}

.statistics-page__title {
  margin: 0 0 8px;
  color: var(--el-text-color-primary);
  font-size: 28px;
  font-weight: 700;
}

.statistics-page__grid {
  margin-bottom: 2px;
}

.statistics-page__stat-card {
  margin-bottom: 16px;
  border-radius: 12px;
}

.statistics-page__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .statistics-page__main {
    padding: 12px;
  }

  .statistics-page__section-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>