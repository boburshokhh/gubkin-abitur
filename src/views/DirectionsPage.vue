<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Заголовок страницы -->
    <section class="py-10 md:py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl md:text-4xl font-bold mb-4">
            Направления и специальности подготовки
          </h1>
          <p class="text-lg opacity-90">
            Филиал РГУ нефти и газа (НИУ) имени И.М. Губкина в городе Ташкенте предлагает образовательные программы по различным направлениям подготовки
          </p>
        </div>
      </div>
    </section>

    <!-- Содержимое страницы -->
    <section class="py-12 md:py-16">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-5xl mx-auto">
          <!-- Переключатель типа программы -->
          <div class="mb-10 flex flex-col items-center">
            <div class="inline-flex rounded-md shadow-sm p-1 bg-gray-100 mb-6">
              <button
                @click="selectedProgramType = 'bachelor'"
                class="px-6 py-3 rounded-md text-sm font-medium transition-all"
                :class="selectedProgramType === 'bachelor' ? 'bg-primary-600 text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-200'"
              >
                Бакалавриат (4 года)
              </button>
              <button
                @click="selectedProgramType = 'specialist'"
                class="px-6 py-3 rounded-md text-sm font-medium transition-all"
                :class="selectedProgramType === 'specialist' ? 'bg-primary-600 text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-200'"
              >
                Специалитет (5 лет)
              </button>
            </div>
            <p class="text-gray-600 text-center max-w-2xl">
              <span v-if="selectedProgramType === 'bachelor'">
                <strong>Бакалавриат</strong> — это базовое высшее образование с присвоением академической степени «бакалавр» (4 года обучения)
              </span>
              <span v-else>
                <strong>Специалитет</strong> — это классическое высшее образование с присвоением квалификации «специалист» (5 лет обучения)
              </span>
            </p>
          </div>
          
          <!-- Загрузка данных -->
          <div v-if="isLoading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-4"></div>
            <p class="text-gray-500">Загрузка данных...</p>
          </div>
          
          <!-- Фильтры направлений -->
          <div v-else-if="filteredByProgramType.length > 0" class="mb-10 flex flex-wrap gap-4">
            <BaseButton 
              v-for="field in availableStudyFields" 
              :key="field.id"
              :variant="selectedField === field.id ? 'primary' : 'outline'"
              @click="selectedField = selectedField === field.id ? 'all' : field.id"
              class="mb-2"
            >
              {{ getFieldName(field) }}
            </BaseButton>
          </div>
          
          <!-- Сообщение, если направлений нет -->
          <div v-if="!isLoading && filteredDirections.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">🎓</div>
            <h3 class="text-xl font-medium text-gray-700 mb-2">Направления не найдены</h3>
            <p class="text-gray-500">Попробуйте изменить параметры фильтрации</p>
          </div>
          
          <!-- Список направлений -->
          <div v-else-if="!isLoading" class="space-y-10">
            <BaseCard 
              v-for="direction in filteredDirections" 
              :key="direction.id"
              bordered
              hover
              class="transition-all"
            >
              <div class="flex flex-col md:flex-row md:items-start gap-6">
                <!-- Иконка направления -->
                <div class="flex-shrink-0">
                  <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg class="w-10 h-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path :d="getIconPath(direction.icon_type)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                    </svg>
                  </div>
                </div>
                
                <!-- Информация о направлении -->
                <div class="flex-grow">
                  <div class="flex flex-wrap items-start justify-between gap-4 mb-2">
                    <h2 class="text-2xl font-bold text-gray-900">
                    {{ direction.name }}
                  </h2>
                  
                    <div class="flex gap-2">
                      <BaseBadge v-for="tag in direction.tags" :key="tag" color="primary" class="text-sm">
                      {{ tag }}
                    </BaseBadge>
                    </div>
                  </div>
                  
                  <p class="text-gray-600 mb-6 text-lg">
                    {{ direction.description }}
                  </p>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h4 class="font-medium text-gray-900 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                        Вступительные испытания:
                      </h4>
                      <div class="ml-2">
                        <table class="w-full text-sm">
                          <thead>
                            <tr class="border-b border-gray-200">
                              <th class="pb-2 text-left text-gray-600 font-medium">Предмет</th>
                              <th class="pb-2 text-center text-gray-600 font-medium">Мин. балл</th>
                              <th class="pb-2 text-center text-gray-600 font-medium">Форма</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(exam, index) in direction.exam_details" :key="index" class="border-b border-gray-100">
                              <td class="py-2 text-gray-800">{{ exam.subject }}</td>
                              <td class="py-2 text-center text-gray-800">{{ exam.minScore }}</td>
                              <td class="py-2 text-center text-gray-600">{{ exam.form }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div class="mb-4">
                        <h4 class="font-medium text-gray-900 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                          </svg>
                          Длительность обучения:
                        </h4>
                        <p class="text-gray-600 ml-7">{{ direction.duration }}</p>
                      </div>
                      
                      <div>
                        <h4 class="font-medium text-gray-900 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                          </svg>
                          Количество мест:
                        </h4>
                        <p class="text-gray-600 ml-7">{{ direction.places }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Профили подготовки -->
                  <div v-if="directionProfiles[direction.id] && directionProfiles[direction.id].length > 0" class="mb-6">
                    <h4 class="font-medium text-gray-900 mb-4 flex items-center text-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clip-rule="evenodd" />
                      </svg>
                      <span v-if="direction.program_type === 'specialist'">Специализация:</span>
                      <span v-else>Профили подготовки:</span>
                    </h4>
                    <div class="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                      <div v-for="(profile, index) in directionProfiles[direction.id]" :key="index" class="p-4 hover:bg-gray-50 transition-colors">
                        <h5 class="font-medium text-gray-800 mb-1">{{ profile.name }}</h5>
                        <p v-if="profile.description" class="text-gray-600 text-sm mb-3">{{ profile.description }}</p>
                        
                        <!-- Специальности профиля -->
                        <div v-if="profileSpecialties[profile.id] && profileSpecialties[profile.id].length > 0" class="mt-3">
                          <h6 class="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                              <path d="M3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zm9.3 7.176A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>
                            Специальности:
                          </h6>
                          <ul class="pl-6 list-disc text-sm text-gray-600 space-y-1">
                            <li v-for="(specialty, specIndex) in profileSpecialties[profile.id]" :key="specIndex">
                              <span class="font-medium">{{ specialty.code }}</span> - {{ specialty.name }}
                              <p v-if="specialty.description" class="text-xs text-gray-500 ml-5 mt-0.5">{{ specialty.description }}</p>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Информация о поступлении -->
                  <div class="bg-primary-50 p-4 rounded-lg border border-primary-100 mt-6 mb-6">
                    <h4 class="font-medium text-gray-900 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                      </svg>
                      Информация о поступлении
                    </h4>
                    <div class="text-gray-600 text-sm space-y-2 ml-7">
                      <p>Приём документов: с 15 июня по 30 июня (включительно)</p>
                      <p>Адрес подачи документов: Республика Узбекистан, г. Ташкент, Мирзо-Улугбекский район, ул. Дурмон Йули, 34</p>
                      <p>Телефон приемной комиссии: (+99871) 262-70-19</p>
                      <p><strong>Необходимые документы:</strong> паспорт, документ об образовании, медицинская справка, фотографии, военный билет или приписное свидетельство (для юношей)</p>
                      <p class="text-primary-600 font-medium">Узнать подробнее о процессе поступления можно на <a href="https://gubkin.uz/ru/sveden/napravleniya-i-spesialnosti-podgotovki" target="_blank" class="underline">официальном сайте Филиала</a></p>
                    </div>
                  </div>
                  
                  <div class="flex flex-wrap gap-4">
                  <BaseButton tag="router-link" :to="`/directions/${direction.slug}`" variant="primary">
                    Подробнее о направлении
                  </BaseButton>
                    
                    <BaseButton tag="a" href="https://gubkin.uz/ru/sveden/napravleniya-i-spesialnosti-podgotovki" target="_blank" variant="outline">
                      Официальная страница
                    </BaseButton>
                  </div>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { BaseButton, BaseCard, BaseBadge } from '@/components/ui';
import { directions, profiles, specialties } from '@/api/supabase';

// Области обучения для фильтрации
const studyFields = [
  { id: 'oil', name: 'Нефтегазовое дело' },
  { id: 'economics', name: 'Экономика' },
  { id: 'management', name: 'Менеджмент' },
  { id: 'geology', name: 'Геология' }
];

// Состояние загрузки
const isLoading = ref(true);

// Тип программы (бакалавриат/специалитет)
const selectedProgramType = ref('bachelor');

// Выбранная область обучения (для фильтрации)
const selectedField = ref('all');

// Данные направлений обучения университета
const directionsData = ref([]);

// Данные профилей
const directionProfiles = reactive({});

// Данные специальностей (группируем по профилям)
const profileSpecialties = reactive({});

// Загрузка данных с использованием API функций
onMounted(async () => {
  try {
    // Получаем направления
    const { data: fetchedDirections, error: directionsError } = await directions.getAll();
    
    if (directionsError) throw directionsError;
    
    // Получаем все профили
    const { data: allProfiles, error: profilesError } = await profiles.getAll();
    
    if (profilesError) throw profilesError;
    
    // Получаем все специальности
    const { data: allSpecialties, error: specialtiesError } = await specialties.getAll();
    
    if (specialtiesError) throw specialtiesError;
    
    // Устанавливаем данные направлений
    directionsData.value = fetchedDirections;
    
    // Группируем профили по направлениям
    allProfiles.forEach(profile => {
      if (!directionProfiles[profile.direction_id]) {
        directionProfiles[profile.direction_id] = [];
      }
      directionProfiles[profile.direction_id].push(profile);
    });
    
    // Группируем специальности по профилям
    allSpecialties.forEach(specialty => {
      if (!profileSpecialties[specialty.profile_id]) {
        profileSpecialties[specialty.profile_id] = [];
      }
      profileSpecialties[specialty.profile_id].push(specialty);
    });
    
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  } finally {
    isLoading.value = false;
  }
});

// Фильтрация по типу программы (бакалавриат/специалитет)
const filteredByProgramType = computed(() => {
  return directionsData.value.filter(dir => dir.program_type === selectedProgramType.value);
});

// Доступные области обучения для выбранного типа программы
const availableStudyFields = computed(() => {
  const fields = new Set(filteredByProgramType.value.map(dir => dir.field));
  return studyFields.filter(field => fields.has(field.id));
});

// Отфильтрованные направления по типу программы и области обучения
const filteredDirections = computed(() => {
  if (selectedField.value === 'all') {
    return filteredByProgramType.value;
  }
  return filteredByProgramType.value.filter(dir => dir.field === selectedField.value);
});

// Функция для получения правильного названия области обучения
const getFieldName = (field) => {
  return field.name;
};

// Получение пути для иконки направления
const getIconPath = (iconType) => {
  // Набор путей для различных SVG иконок
  const icons = {
    'drill': 'M17 4a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a2 2 0 002 2h4a2 2 0 002-2V4z',
    'book': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    'chart': 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
    'calculator': 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    'atom': 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    'flask': 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
  };
  
  // Возвращаем путь для иконки или запасной вариант
  return icons[iconType] || icons['book'];
};

// Получение ФИО студента
const getFullName = (profile) => {
  return `${profile.lastName || ''} ${profile.firstName || ''} ${profile.middleName || ''}`.trim();
};
</script> 

<style scoped>
/* Дополнительные стили для анимаций и улучшения UI */
.transition-all {
  transition: all 0.3s ease;
}
</style> 