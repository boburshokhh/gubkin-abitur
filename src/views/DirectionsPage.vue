<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Заголовок страницы -->
    <section class="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div class="container mx-auto px-6">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl font-bold mb-4">
            Направления подготовки
          </h1>
          <p class="text-lg opacity-90">
            Филиал РГУ нефти и газа (НИУ) имени И.М. Губкина в городе Ташкенте
          </p>
        </div>
      </div>
    </section>

    <!-- Содержимое страницы -->
    <section class="py-16">
      <div class="container mx-auto px-6">
        <div class="max-w-5xl mx-auto">
          <!-- Переключатель типа программы -->
          <div class="mb-12 flex justify-center">
            <div class="inline-flex rounded-lg shadow-sm p-1 bg-white border">
              <button
                @click="selectedProgramType = 'bachelor'"
                class="px-8 py-3 rounded-md text-sm font-medium transition-all"
                :class="selectedProgramType === 'bachelor' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'"
              >
                Бакалавриат (4 года)
              </button>
              <button
                @click="selectedProgramType = 'specialist'"
                class="px-8 py-3 rounded-md text-sm font-medium transition-all"
                :class="selectedProgramType === 'specialist' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'"
              >
                Специалитет (5 лет)
              </button>
            </div>
          </div>
          
          <!-- Загрузка данных -->
          <div v-if="isLoading" class="text-center py-16">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-4"></div>
            <p class="text-gray-500">Загрузка данных...</p>
          </div>
          
          <!-- Фильтры направлений -->
          <div v-else-if="filteredByProgramType.length > 0" class="mb-12 flex justify-center">
            <div class="flex flex-wrap gap-3">
              <BaseButton 
                v-for="field in availableStudyFields" 
                :key="field.id"
                :variant="selectedField === field.id ? 'primary' : 'outline'"
                @click="selectedField = selectedField === field.id ? 'all' : field.id"
                size="sm"
              >
                {{ getFieldName(field) }}
              </BaseButton>
            </div>
          </div>
          
          <!-- Сообщение, если направлений нет -->
          <div v-if="!isLoading && filteredDirections.length === 0" class="text-center py-16">
            <div class="text-6xl mb-4">🎓</div>
            <h3 class="text-xl font-medium text-gray-700 mb-2">Направления не найдены</h3>
            <p class="text-gray-500">Попробуйте изменить параметры фильтрации</p>
          </div>
          
          <!-- Список направлений -->
          <div v-else-if="!isLoading" class="grid gap-8 md:grid-cols-1 lg:grid-cols-1">
            <div 
              v-for="direction in filteredDirections" 
              :key="direction.id"
              class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow flex flex-col"
            >
              <!-- Заголовок направления -->
              <div class="mb-6">
                <div class="flex items-center gap-4 mb-3">
                  <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-6 h-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path :d="getIconPath(direction.icon_type)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                    </svg>
                  </div>
                  <div class="flex-grow">
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">
                      {{ direction.name }}
                    </h2>
                    <div class="flex gap-2 flex-wrap">
                      <span 
                        v-for="tag in direction.tags" 
                        :key="tag" 
                        class="inline-block px-3 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full"
                      >
                        {{ tag }}
                      </span>
                    </div>
                  </div>
                </div>
                <p class="text-gray-600 text-lg leading-relaxed">
                  {{ direction.description }}
                </p>
              </div>
                  
              <!-- Основная информация -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 flex-grow">
                <!-- Вступительные испытания -->
                <div class="space-y-4 h-full">
                  <h4 class="text-lg font-semibold text-gray-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    Вступительные испытания
                  </h4>
                  <div class="bg-gray-50 rounded-lg p-4 space-y-3 flex-grow">
                    <div 
                      v-for="(exam, index) in direction.exam_details" 
                      :key="index" 
                      class="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                    >
                      <span class="text-gray-800 font-medium">{{ exam.subject }}</span>
                      <div class="text-right">
                        <div class="text-gray-900 font-semibold">{{ exam.minScore }} баллов</div>
                        <div class="text-sm text-gray-500">{{ exam.form }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Детали программы -->
                <div class="space-y-4 h-full">
                  <h4 class="text-lg font-semibold text-gray-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                    </svg>
                    Детали программы
                  </h4>
                  <div class="bg-gray-50 rounded-lg p-4 space-y-4 flex-grow">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Длительность:</span>
                      <span class="text-gray-900 font-medium">{{ direction.duration }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Количество мест:</span>
                      <span class="text-gray-900 font-medium">{{ direction.places }}</span>
                    </div>
                    <div class="flex justify-between pt-2 border-t border-gray-200">
                      <span class="text-gray-600">Тип программы:</span>
                      <span class="text-gray-900 font-medium">
                        <span v-if="direction.program_type === 'bachelor'" class="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                          Бакалавриат
                        </span>
                        <span v-else class="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs">
                          Специалитет
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
                  
              <!-- Профили подготовки -->
              <div v-if="directionProfiles[direction.id] && directionProfiles[direction.id].length > 0" class="mb-6">
                <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clip-rule="evenodd" />
                  </svg>
                  <span v-if="direction.program_type === 'specialist'">Специализация</span>
                  <span v-else>Профили подготовки</span>
                </h4>
                <div class="grid gap-4">
                  <div 
                    v-for="(profile, index) in directionProfiles[direction.id]" 
                    :key="index" 
                    class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <h5 class="font-semibold text-gray-800 mb-2">{{ profile.name }}</h5>
                    <p v-if="profile.description" class="text-gray-600 mb-3">{{ profile.description }}</p>
                        
                    <!-- Специальности профиля -->
                    <div v-if="profileSpecialties[profile.id] && profileSpecialties[profile.id].length > 0" class="mt-3 pt-3 border-t border-gray-100">
                      <h6 class="text-sm font-medium text-gray-700 mb-2">Специальности:</h6>
                      <ul class="space-y-1">
                        <li v-for="(specialty, specIndex) in profileSpecialties[profile.id]" :key="specIndex" class="text-sm">
                          <span class="font-medium text-primary-600">{{ specialty.code }}</span>
                          <span class="text-gray-700"> — {{ specialty.name }}</span>
                          <p v-if="specialty.description" class="text-xs text-gray-500 mt-1 ml-4">{{ specialty.description }}</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Ссылка на подробную информацию -->
              <div class="mt-auto pt-6 border-t border-gray-100">
                <a 
                  href="https://gubkin.uz/ru/sveden/napravleniya-i-spesialnosti-podgotovki" 
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center px-6 py-3 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 hover:text-primary-700 transition-all duration-200 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                  Подробная информация на официальном сайте
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-1 opacity-50" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { BaseButton } from '@/components/ui';
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
  const icons = {
    'drill': 'M17 4a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a2 2 0 002 2h4a2 2 0 002-2V4z',
    'book': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    'chart': 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
    'calculator': 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    'atom': 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    'flask': 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
  };
  
  return icons[iconType] || icons['book'];
};
</script> 

<style scoped>
/* Дополнительные стили для анимаций и улучшения UI */
.transition-all {
  transition: all 0.3s ease;
}
</style> 