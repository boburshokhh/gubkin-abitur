<template>
  <div class="container mx-auto p-4 md:p-8">
    <h1 class="text-2xl font-bold text-center mb-8 text-gray-700">Обзор статистики приёмной кампании</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <section class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-6 text-center text-primary-700">СТАТИСТИКА ПО ПРИЕМУ ДОКУМЕНТОВ ПО ДАТАМ</h2>
        <!-- Здесь будет диаграмма по датам -->
        <div class="chart-container h-96">
          <p class="text-center text-gray-500">Загрузка данных для статистики по датам...</p>
        </div>
      </section>

      <section class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-6 text-center text-primary-700">Статистика поступивших документов по регионам</h2>
        <!-- Здесь будет диаграмма по регионам -->
        <div class="chart-container h-96">
          <p class="text-center text-gray-500">Загрузка данных для статистики по регионам...</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
// import { supabase } from '@/lib/supabaseClient'; // Предполагаемый путь к вашему клиенту Supabase
// import Chart from 'chart.js/auto'; // Если будете использовать Chart.js

// TODO: Определить интерфейсы для данных

// const dailySubmissions = ref<any[]>([]); // Данные для статистики по датам
// const regionalSubmissions = ref<any[]>([]); // Данные для статистики по регионам
// const isLoading = ref(false);
// const error = ref<string | null>(null);

// TODO: Реализовать функции для загрузки данных из Supabase
async function fetchDailySubmissions() {
  // isLoading.value = true;
  // error.value = null;
  // try {
    // Пример запроса (нужно адаптировать):
    // const { data, error: dbError } = await supabase
    //   .rpc('get_daily_submission_stats'); // Предполагается, что у вас есть такая функция в БД

    // if (dbError) throw dbError;
    // dailySubmissions.value = data;
    // console.log('Daily submissions:', data);
    // renderDailyChart();
  // } catch (err: any) {
  //   console.error('Error fetching daily submissions:', err);
  //   error.value = 'Не удалось загрузить статистику по датам.';
  // } finally {
  //   isLoading.value = false;
  // }
  console.log("Заглушка: fetchDailySubmissions вызвана");
}

async function fetchRegionalSubmissions() {
  // isLoading.value = true;
  // error.value = null;
  // try {
    // Пример запроса (нужно адаптировать):
    // const { data, error: dbError } = await supabase
    //   .rpc('get_regional_submission_stats'); // Предполагается, что у вас есть такая функция в БД

    // if (dbError) throw dbError;
    // regionalSubmissions.value = data;
    // console.log('Regional submissions:', data);
    // renderRegionalChart();
  // } catch (err: any) {
  //   console.error('Error fetching regional submissions:', err);
  //   error.value = 'Не удалось загрузить статистику по регионам.';
  // } finally {
  //   isLoading.value = false;
  // }
   console.log("Заглушка: fetchRegionalSubmissions вызвана");
}

// TODO: Реализовать функции для отрисовки диаграмм (например, с Chart.js)
// function renderDailyChart() {
  // Логика отрисовки диаграммы по датам
// }

// function renderRegionalChart() {
  // Логика отрисовки диаграммы по регионам
// }

onMounted(async () => {
  await fetchDailySubmissions();
  await fetchRegionalSubmissions();
});

</script>

<style scoped>
.chart-container {
  position: relative;
  /* Можно задать фиксированную высоту или управлять ею через классы Tailwind */
}
</style> 