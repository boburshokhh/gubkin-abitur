<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Заголовок страницы -->
    <section class="py-10 md:py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl md:text-4xl font-bold mb-4">
            Направления подготовки
          </h1>
          <p class="text-lg opacity-90">
            Ташкентский филиал Российского государственного университета нефти и газа имени И.М. Губкина предлагает образовательные программы по следующим направлениям подготовки бакалавриата
          </p>
        </div>
      </div>
    </section>

    <!-- Содержимое страницы -->
    <section class="py-12 md:py-16">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-5xl mx-auto">
          <!-- Фильтры -->
          <div class="mb-10 flex flex-wrap gap-4">
            <BaseButton 
              v-for="field in studyFields" 
              :key="field.id"
              :variant="selectedField === field.id ? 'primary' : 'outline'"
              @click="selectedField = selectedField === field.id ? 'all' : field.id"
              class="mb-2"
            >
              {{ field.name }}
            </BaseButton>
          </div>
          
          <!-- Список направлений -->
          <div class="space-y-8">
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
                  <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-primary-600" :class="direction.icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path :d="getIconPath(direction.iconType)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                    </svg>
                  </div>
                </div>
                
                <!-- Информация о направлении -->
                <div class="flex-grow">
                  <h2 class="text-xl font-bold text-gray-900 mb-2">
                    {{ direction.name }}
                  </h2>
                  
                  <div class="mb-4 flex flex-wrap gap-2">
                    <BaseBadge v-for="tag in direction.tags" :key="tag" color="primary" class="mr-2">
                      {{ tag }}
                    </BaseBadge>
                  </div>
                  
                  <p class="text-gray-600 mb-4">
                    {{ direction.description }}
                  </p>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 class="font-medium text-gray-900 mb-1">Экзамены для поступления:</h4>
                      <ul class="list-disc list-inside text-gray-600">
                        <li v-for="exam in direction.exams" :key="exam">{{ exam }}</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 class="font-medium text-gray-900 mb-1">Длительность обучения:</h4>
                      <p class="text-gray-600">{{ direction.duration }}</p>
                      
                      <h4 class="font-medium text-gray-900 mt-3 mb-1">Количество мест:</h4>
                      <p class="text-gray-600">{{ direction.places }}</p>
                    </div>
                  </div>
                  
                  <BaseButton tag="router-link" :to="`/directions/${direction.id}`" variant="primary">
                    Подробнее о направлении
                  </BaseButton>
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
import { ref, computed } from 'vue';
import { BaseButton, BaseCard, BaseBadge } from '@/components/ui';

// Области обучения для фильтрации
const studyFields = [
  { id: 'it', name: 'IT и информатика' },
  { id: 'engineering', name: 'Инженерия' },
  { id: 'geology', name: 'Геология' },
  { id: 'economics', name: 'Экономика' }
];

// Выбранная область обучения (для фильтрации)
const selectedField = ref('all');

// Демо-данные направлений обучения
const directions = ref([
  {
    id: 'petroleum-engineering',
    name: 'Нефтегазовое дело',
    tags: ['Инженерия', 'Нефть и газ'],
    field: 'engineering',
    iconType: 'drill',
    description: 'Подготовка специалистов по разработке нефтяных и газовых месторождений, бурению скважин, транспортировке и хранению углеводородов.',
    exams: ['Математика', 'Физика', 'Русский язык'],
    duration: '4 года (бакалавриат)',
    places: '60 бюджетных мест'
  },
  {
    id: 'information-systems',
    name: 'Информационные системы и технологии',
    tags: ['IT', 'Программирование'],
    field: 'it',
    iconType: 'computer',
    description: 'Обучение проектированию, разработке и эксплуатации информационных систем для нефтегазовой отрасли, включая программирование, базы данных и сетевые технологии.',
    exams: ['Математика', 'Информатика', 'Русский язык'],
    duration: '4 года (бакалавриат)',
    places: '30 бюджетных мест'
  },
  {
    id: 'applied-geology',
    name: 'Прикладная геология',
    tags: ['Геология', 'Разведка'],
    field: 'geology',
    iconType: 'chart',
    description: 'Подготовка специалистов по поиску и разведке месторождений нефти и газа, изучению строения земной коры и геологическому моделированию.',
    exams: ['Математика', 'Географика', 'Русский язык'],
    duration: '4 года (бакалавриат)',
    places: '40 бюджетных мест'
  },
  {
    id: 'oil-economics',
    name: 'Экономика нефтегазовой отрасли',
    tags: ['Экономика', 'Менеджмент'],
    field: 'economics',
    iconType: 'chart',
    description: 'Обучение основам экономики, управления и планирования в нефтегазовом секторе, анализу рынков энергоресурсов и оценке инвестиционных проектов.',
    exams: ['Математика', 'Обществознание', 'Русский язык'],
    duration: '4 года (бакалавриат)',
    places: '25 бюджетных мест'
  },
  {
    id: 'chemical-engineering',
    name: 'Химическая технология',
    tags: ['Инженерия', 'Химия'],
    field: 'engineering',
    iconType: 'beaker',
    description: 'Подготовка специалистов по переработке нефти и газа, нефтехимическому синтезу, производству масел, топлив и других продуктов нефтехимии.',
    exams: ['Математика', 'Химия', 'Русский язык'],
    duration: '4 года (бакалавриат)',
    places: '35 бюджетных мест'
  },
  {
    id: 'automation',
    name: 'Автоматизация технологических процессов',
    tags: ['IT', 'Инженерия'],
    field: 'it',
    iconType: 'cog',
    description: 'Обучение проектированию и эксплуатации систем автоматического управления технологическими процессами в нефтегазовой отрасли.',
    exams: ['Математика', 'Физика', 'Русский язык'],
    duration: '4 года (бакалавриат)',
    places: '30 бюджетных мест'
  }
]);

// Отфильтрованные направления
const filteredDirections = computed(() => {
  if (selectedField.value === 'all') {
    return directions.value;
  }
  return directions.value.filter(dir => dir.field === selectedField.value);
});

// Функция для получения пути SVG иконки
const getIconPath = (type) => {
  const paths = {
    drill: 'M12 22V12M12 8V2M19 15V2M5 15V2M19 15H5M5 22H19M5 15C5 18.866 8.13401 22 12 22C15.866 22 19 18.866 19 15',
    computer: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    chart: 'M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
    beaker: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    cog: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
  };
  
  return paths[type] || paths.cog;
};
</script> 