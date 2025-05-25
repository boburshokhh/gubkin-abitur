<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Заголовок страницы -->
    <section class="py-10 md:py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-6">
          <router-link to="/directions" class="inline-flex items-center text-white opacity-90 hover:opacity-100">
            <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад к списку направлений
          </router-link>
        </div>

        <div class="max-w-4xl mx-auto" v-if="direction">
          <h1 class="text-3xl md:text-4xl font-bold mb-4">
            {{ direction.name }}
          </h1>
          <div class="flex flex-wrap gap-2 mb-4">
            <BaseBadge v-for="tag in direction.tags" :key="tag" color="light" class="text-sm">
              {{ tag }}
            </BaseBadge>
          </div>
          <p class="text-lg opacity-90">
            {{ direction.description }}
          </p>
        </div>
        
        <div v-else class="max-w-4xl mx-auto text-center">
          <BaseLoader color="light" size="lg" />
          <p class="mt-4">Загрузка информации о направлении...</p>
        </div>
      </div>
    </section>

    <!-- Содержимое страницы -->
    <section class="py-12 md:py-16" v-if="direction">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-5xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Основная информация -->
            <div class="md:col-span-2 space-y-8">
              <!-- О программе -->
              <BaseCard>
                <template #header>
                  <h2 class="text-xl font-bold text-gray-900">О программе</h2>
                </template>
                
                <div class="prose max-w-none">
                  <p>{{ direction.fullDescription }}</p>
                  
                  <h3>Чему вы научитесь:</h3>
                  <ul>
                    <li v-for="(skill, index) in direction.skills" :key="index">{{ skill }}</li>
                  </ul>
                  
                  <h3>Карьерные возможности:</h3>
                  <p>{{ direction.career }}</p>
                </div>
              </BaseCard>
              
              <!-- Учебный план -->
              <BaseCard>
                <template #header>
                  <h2 class="text-xl font-bold text-gray-900">Учебный план</h2>
                </template>
                
                <div class="space-y-6">
                  <div v-for="(year, index) in direction.curriculum" :key="index">
                    <h3 class="text-lg font-medium text-gray-900 mb-3">{{ year.year }}</h3>
                    
                    <div class="relative">
                      <div class="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
                      
                      <div class="space-y-4">
                        <div 
                          v-for="(subject, subjectIndex) in year.subjects" 
                          :key="subjectIndex"
                          class="relative pl-10"
                        >
                          <div class="absolute left-0 top-1 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span class="text-primary-700 font-medium">{{ subjectIndex + 1 }}</span>
                          </div>
                          <h4 class="text-base font-medium text-gray-900">{{ subject.name }}</h4>
                          <p class="text-sm text-gray-600">{{ subject.description }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </BaseCard>
              
              <!-- Профили и специальности -->
              <BaseCard v-if="directionProfiles.length > 0">
                <template #header>
                  <h2 class="text-xl font-bold text-gray-900">
                    <span v-if="direction.program_type === 'specialist'">Специализации</span>
                    <span v-else>Профили подготовки</span>
                  </h2>
                </template>
                
                <div class="space-y-8">
                  <div v-for="(profile, index) in directionProfiles" :key="profile.id" class="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                    <h3 class="text-lg font-medium text-gray-900 mb-2">{{ profile.name }}</h3>
                    <p v-if="profile.description" class="text-gray-600 mb-4">{{ profile.description }}</p>
                    
                    <!-- Специальности профиля -->
                    <div v-if="profileSpecialties[profile.id] && profileSpecialties[profile.id].length > 0" class="mt-4">
                      <h4 class="text-base font-medium text-gray-800 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                          <path d="M3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zm9.3 7.176A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                        Специальности:
                      </h4>
                      <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <table class="w-full text-sm">
                          <thead>
                            <tr class="border-b border-gray-200">
                              <th class="pb-2 text-left text-gray-600 font-medium">Код</th>
                              <th class="pb-2 text-left text-gray-600 font-medium">Наименование</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(specialty, specIndex) in profileSpecialties[profile.id]" :key="specialty.id" class="border-b border-gray-100 last:border-b-0">
                              <td class="py-3 text-gray-800 font-medium">{{ specialty.code }}</td>
                              <td class="py-3 text-gray-800">
                                {{ specialty.name }}
                                <p v-if="specialty.description" class="text-xs text-gray-500 mt-1">{{ specialty.description }}</p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </BaseCard>
            </div>
            
            <!-- Боковая панель -->
            <div class="space-y-6">
              <!-- Основная информация -->
              <BaseCard>
                <template #header>
                  <h2 class="text-lg font-bold text-gray-900">Информация о программе</h2>
                </template>
                
                <ul class="space-y-4">
                  <li>
                    <div class="text-sm text-gray-500">Длительность обучения:</div>
                    <div class="font-medium">{{ direction.duration }}</div>
                  </li>
                  <li>
                    <div class="text-sm text-gray-500">Уровень образования:</div>
                    <div class="font-medium">{{ direction.level }}</div>
                  </li>
                  <li>
                    <div class="text-sm text-gray-500">Количество мест:</div>
                    <div class="font-medium">{{ direction.places }}</div>
                  </li>
                  <li>
                    <div class="text-sm text-gray-500">Стоимость обучения:</div>
                    <div class="font-medium">{{ direction.tuition }}</div>
                  </li>
                  <li>
                    <div class="text-sm text-gray-500">Язык обучения:</div>
                    <div class="font-medium">{{ direction.language }}</div>
                  </li>
                </ul>
              </BaseCard>
              
              <!-- Вступительные испытания -->
              <BaseCard>
                <template #header>
                  <h2 class="text-lg font-bold text-gray-900">Вступительные испытания</h2>
                </template>
                
                <ul class="list-disc list-inside space-y-2">
                  <li v-for="(exam, index) in direction.exams" :key="index">{{ exam }}</li>
                </ul>
                
                <div class="mt-6">
                  <p class="text-sm text-gray-600 mb-4">Минимальные баллы для поступления определяются по результатам конкурса прошлого года.</p>
                  
                  <router-link to="/faq" class="text-primary-600 hover:text-primary-700 font-medium text-sm">
                    Подробнее о вступительных испытаниях
                  </router-link>
                </div>
              </BaseCard>
              
              <!-- Контакты -->
              <BaseCard>
                <template #header>
                  <h2 class="text-lg font-bold text-gray-900">Контакты</h2>
                </template>
                
                <div class="space-y-3">
                  <p class="text-sm text-gray-600">
                    Для получения дополнительной информации обращайтесь в приемную комиссию:
                  </p>
                  
                  <div class="flex">
                    <svg class="w-5 h-5 mr-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>+998 71 262-71-01</span>
                  </div>
                  
                  <div class="flex">
                    <svg class="w-5 h-5 mr-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>admission@gubkin.uz</span>
                  </div>
                </div>
              </BaseCard>
            </div>
          </div>
          
          <!-- Кнопка подачи заявления -->
          <div class="mt-12 text-center">
            <BaseButton tag="router-link" to="/register" variant="primary" size="lg">
              Подать документы
            </BaseButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BaseCard, BaseBadge, BaseLoader, BaseButton } from '@/components/ui';
import { directions, profiles, specialties } from '@/api/supabase';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const directionSlug = computed(() => route.params.id);
const direction = ref(null);
const directionProfiles = ref([]);
const profileSpecialties = ref({});
const isLoading = ref(true);
const notFound = ref(false);

// Загрузка данных направления, профилей и специальностей
const fetchDirectionData = async () => {
  isLoading.value = true;
  notFound.value = false;
  
  try {
    // Получаем направление по его slug
    const { data: directionData, error: directionError } = await directions.getAll();
    
    if (directionError) throw directionError;
    
    // Ищем направление с нужным slug
    const foundDirection = directionData.find(d => d.slug === directionSlug.value);
    
    if (!foundDirection) {
      notFound.value = true;
      toast.error('Направление не найдено');
      return;
    }
    
    direction.value = foundDirection;
    
    // Загружаем профили для этого направления
    const { data: dirProfiles, error: profilesError } = await profiles.getByDirectionId(foundDirection.id);
    
    if (profilesError) throw profilesError;
    
    directionProfiles.value = dirProfiles || [];
    
    // Загружаем специальности для каждого профиля
    await Promise.all(directionProfiles.value.map(async (profile) => {
      const { data: profileSpecs, error: specialtiesError } = await specialties.getByProfileId(profile.id);
      
      if (specialtiesError) throw specialtiesError;
      
      if (profileSpecs && profileSpecs.length > 0) {
        profileSpecialties.value[profile.id] = profileSpecs;
      }
    }));
    
    // Добавляем дополнительную информацию для отображения
    enrichDirectionData();
    
  } catch (error) {
    console.error('Ошибка при загрузке данных направления:', error);
    toast.error('Ошибка при загрузке данных');
  } finally {
    isLoading.value = false;
  }
};

// Обогащение данных направления дополнительной информацией для отображения
const enrichDirectionData = () => {
  if (!direction.value) return;
  
  // Заполняем стандартные поля, если они отсутствуют
  if (!direction.value.fullDescription) {
    direction.value.fullDescription = direction.value.description;
  }
  
  // Добавляем навыки, если их нет
  if (!direction.value.skills) {
    direction.value.skills = [
      'Использовать современные методы и технологии в профессиональной области',
      'Решать профессиональные задачи с использованием специализированного программного обеспечения',
      'Работать в команде и эффективно коммуницировать с коллегами и партнерами',
      'Анализировать данные и делать обоснованные выводы'
    ];
  }
  
  // Добавляем информацию о карьере
  if (!direction.value.career) {
    direction.value.career = 'Выпускники программы могут работать в ведущих компаниях отрасли, занимая должности специалистов, руководителей подразделений, экспертов и консультантов. Многие выпускники также продолжают обучение в магистратуре и аспирантуре, выбирая академическую или научную карьеру.';
  }
  
  // Информация о программе
  direction.value.level = direction.value.program_type === 'bachelor' ? 'Бакалавриат' : 'Специалитет';
  direction.value.language = 'Русский';
  direction.value.tuition = 'По договору с вузом';
  
  // Добавляем учебный план, если его нет
  if (!direction.value.curriculum) {
    direction.value.curriculum = [
          {
            year: '1 курс',
            subjects: [
          { name: 'Высшая математика', description: 'Основы математического анализа, линейной алгебры и дифференциальных уравнений' },
          { name: 'Информатика', description: 'Основы алгоритмизации и программирования' },
          { name: 'Физика', description: 'Основы механики, электромагнетизма и оптики' },
          { name: 'Иностранный язык', description: 'Английский язык для профессиональной коммуникации' },
          { name: 'История', description: 'История России и мировых цивилизаций' }
            ]
          },
          {
            year: '2 курс',
            subjects: [
          { name: 'Теоретическая механика', description: 'Изучение законов механического движения и взаимодействия материальных тел' },
          { name: 'Сопротивление материалов', description: 'Изучение прочности и деформации твердых тел под действием сил' },
          { name: 'Термодинамика', description: 'Изучение тепловых процессов и их преобразований' },
          { name: 'Философия', description: 'Основы философской мысли и методологии науки' },
          { name: 'Профильные дисциплины', description: 'Дисциплины соответствующие выбранному направлению подготовки' }
        ]
      }
    ];
  }
  
  // Добавляем экзамены
  if (!direction.value.exams) {
    const examTexts = [];
    if (direction.value.exam_details) {
      direction.value.exam_details.forEach(exam => {
        examTexts.push(`${exam.subject} (минимальный балл: ${exam.minScore}, форма: ${exam.form})`);
      });
    } else {
      examTexts.push('Математика (профильный уровень) - ЕГЭ или вступительный экзамен');
      examTexts.push('Русский язык - ЕГЭ или вступительный экзамен');
      examTexts.push('Физика или информатика (по выбору) - ЕГЭ или вступительный экзамен');
    }
    direction.value.exams = examTexts;
  }
};

onMounted(() => {
  fetchDirectionData();
});
</script> 