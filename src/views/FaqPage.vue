<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Заголовок страницы -->
    <section class="py-10 md:py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl md:text-4xl font-bold mb-4">
            Часто задаваемые вопросы
          </h1>
          <p class="text-lg opacity-90">
            Ответы на вопросы абитуриентов о поступлении в Ташкентский филиал Университета Губкина
          </p>
        </div>
      </div>
    </section>

    <!-- Содержимое страницы -->
    <section class="py-12 md:py-16">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
          <!-- Категории вопросов -->
          <div class="mb-12">
            <div class="flex flex-wrap gap-4">
              <button 
                v-for="category in categories" 
                :key="category.id"
                :class="[
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors', 
                  selectedCategory === category.id 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                ]"
                @click="selectedCategory = category.id"
              >
                {{ category.name }}
              </button>
            </div>
          </div>
          
          <!-- Вопросы и ответы -->
          <div class="space-y-6">
            <BaseCard 
              v-for="faq in filteredFaqs" 
              :key="faq.id"
              class="overflow-hidden transition-all duration-300 cursor-pointer"
              :class="{ 'shadow-md': openFaqId === faq.id }"
              bordered
              hover
              @click="toggleFaq(faq.id)"
            >
              <div class="flex justify-between items-start">
                <h3 class="text-lg font-medium text-gray-900 pr-8">
                  {{ faq.question }}
                </h3>
                <div class="flex-shrink-0 mt-1">
                  <svg 
                    class="h-5 w-5 text-primary-600 transition-transform duration-300" 
                    :class="{ 'rotate-180': openFaqId === faq.id }"
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fill-rule="evenodd" 
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                      clip-rule="evenodd" 
                    />
                  </svg>
                </div>
              </div>
              <div 
                v-show="openFaqId === faq.id" 
                class="mt-4 text-gray-600"
              >
                <p v-if="!faq.hasLists">{{ faq.answer }}</p>
                <div v-else>
                  <p class="mb-2">{{ faq.answerIntro }}</p>
                  <ul class="list-disc list-inside space-y-1 mb-2 ml-4">
                    <li v-for="(item, index) in faq.answerList" :key="index">
                      {{ item }}
                    </li>
                  </ul>
                  <p v-if="faq.answerOutro">{{ faq.answerOutro }}</p>
                </div>
              </div>
            </BaseCard>
          </div>
          
          <!-- Не нашли ответ? -->
          <div class="mt-16 bg-white p-8 rounded-lg border border-gray-200 text-center">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">
              Не нашли ответ на свой вопрос?
            </h2>
            <p class="text-gray-600 mb-6">
              Свяжитесь с приемной комиссией Ташкентского филиала Университета Губкина
            </p>
            <div class="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="tel:+998712627101" 
                class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100"
              >
                <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +998 71 262-71-01
              </a>
              <a 
                href="mailto:info@gubkin.uz" 
                class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100"
              >
                <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@gubkin.uz
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { BaseCard } from '@/components/ui';

// Категории вопросов
const categories = [
  { id: 'all', name: 'Все вопросы' },
  { id: 'application', name: 'Подача документов' },
  { id: 'exams', name: 'Вступительные испытания' },
  { id: 'study', name: 'Обучение' },
  { id: 'dormitory', name: 'Общежитие' },
  { id: 'student-life', name: 'Студенческая жизнь' }
];

// Текущая выбранная категория
const selectedCategory = ref('all');

// ID открытого вопроса 
const openFaqId = ref(null);

// Функция для открытия/закрытия вопроса
const toggleFaq = (id) => {
  if (openFaqId.value === id) {
    openFaqId.value = null;
  } else {
    openFaqId.value = id;
  }
};

// Список всех вопросов с ответами
const faqs = [
  {
    id: 1,
    question: 'Какие документы нужны для поступления?',
    answer: 'Для поступления необходимы: заявление о приеме, паспорт, документ об образовании с приложением (аттестат/диплом), результаты вступительных испытаний, 6 фотографий 3х4 см, медицинская справка по форме 086-У.',
    category: 'application',
    hasLists: false
  },
  {
    id: 2,
    question: 'Как проходят вступительные испытания?',
    answer: 'Вступительные испытания проводятся в форме тестирования по профильным предметам в зависимости от выбранного направления подготовки. Проверьте список необходимых предметов для каждой специальности в разделе "Направления обучения".',
    category: 'exams',
    hasLists: false
  },
  {
    id: 3,
    question: 'Возможно ли подать документы онлайн?',
    answer: 'Да, вы можете подать документы через наш онлайн-портал для абитуриентов. Для этого необходимо зарегистрироваться в системе и загрузить сканы всех необходимых документов в личном кабинете.',
    category: 'application',
    hasLists: false
  },
  {
    id: 4,
    question: 'Какие формы обучения доступны?',
    answer: 'В Ташкентском филиале доступны следующие формы обучения: очная (дневная) форма обучения - длительностью 4 года для программ бакалавриата, 2 года для программ магистратуры.',
    category: 'study',
    hasLists: false
  },
  {
    id: 5,
    question: 'Предоставляется ли общежитие иногородним студентам?',
    answerIntro: 'Да, Ташкентский филиал предоставляет общежитие иногородним студентам. Для заселения в общежитие необходимы следующие документы:',
    answerList: [
      'Заявление на предоставление места в общежитии',
      'Паспорт и его копия',
      'Медицинская справка',
      'Справка о составе семьи',
      'Фотографии 3х4 (4 шт.)'
    ],
    answerOutro: 'Заселение производится в порядке очереди с учетом социальных категорий студентов.',
    category: 'dormitory',
    hasLists: true
  },
  {
    id: 6,
    question: 'Какие студенческие организации действуют в университете?',
    answerIntro: 'В университете действуют различные студенческие организации:',
    answerList: [
      'Студенческий совет',
      'Научное студенческое общество',
      'Спортивный клуб',
      'Творческие коллективы (театральная студия, вокальная студия, танцевальный коллектив)',
      'Клуб дебатов',
      'Волонтерское движение'
    ],
    category: 'student-life',
    hasLists: true
  },
  {
    id: 7,
    question: 'Есть ли подготовительные курсы перед поступлением?',
    answer: 'Да, филиал проводит подготовительные курсы для абитуриентов по всем предметам вступительных испытаний. Курсы проводятся в очном формате и длятся от 3 до 6 месяцев. Запись на курсы осуществляется в деканате подготовительного отделения.',
    category: 'exams',
    hasLists: false
  },
  {
    id: 8,
    question: 'Какие льготы предоставляются при поступлении?',
    answerIntro: 'При поступлении в Ташкентский филиал могут предоставляться следующие льготы:',
    answerList: [
      'Инвалидам I и II групп - право на внеконкурсное зачисление при успешной сдаче вступительных испытаний',
      'Детям-сиротам и детям, оставшимся без попечения родителей - преимущественное право при прочих равных условиях',
      'Победителям и призерам международных и республиканских олимпиад - особые права при поступлении',
      'Выпускникам профильных колледжей - льготы при поступлении на соответствующие направления'
    ],
    category: 'application',
    hasLists: true
  },
  {
    id: 9,
    question: 'Как происходит процесс обучения?',
    answer: 'Обучение проходит по семестровой системе. Каждый семестр включает в себя лекционные, практические и лабораторные занятия, а также самостоятельную работу студентов. В конце семестра проводится экзаменационная сессия. Используется кредитно-модульная система оценивания (ECTS).',
    category: 'study',
    hasLists: false
  },
  {
    id: 10,
    question: 'Какова стоимость обучения?',
    answer: 'Стоимость обучения варьируется в зависимости от выбранного направления подготовки. Актуальная информация о стоимости обучения публикуется на официальном сайте филиала перед началом приемной кампании. Также предусмотрена возможность обучения на бюджетной основе по результатам конкурсного отбора.',
    category: 'application',
    hasLists: false
  }
];

// Отфильтрованные вопросы по категории
const filteredFaqs = computed(() => {
  if (selectedCategory.value === 'all') {
    return faqs;
  }
  return faqs.filter(faq => faq.category === selectedCategory.value);
});
</script> 