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
            Ответы на вопросы абитуриентов о поступлении в Филиал РГУ нефти и газа (НИУ) имени И.М. Губкина в городе Ташкенте
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
                <p v-if="!faq.hasLists && !faq.answerIntro">{{ faq.answer }}</p>
                <div v-else-if="faq.answerIntro && !faq.hasLists">
                  <p class="mb-2">{{ faq.answerIntro }}</p>
                  <p v-if="faq.answerOutro">{{ faq.answerOutro }}</p>
                </div>
                <div v-else-if="faq.hasLists">
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
              Свяжитесь с приемной комиссией Филиала РГУ нефти и газа (НИУ) имени И.М. Губкина в городе Ташкенте
            </p>
            <div class="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="tel:+998712000156" 
                class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100"
              >
                <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +998 71 200-01-56
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
  { id: 'general', name: 'Общие вопросы' },
  { id: 'application', name: 'Подача документов' },
  { id: 'exams', name: 'Вступительные испытания' },
  { id: 'study', name: 'Обучение' },
  { id: 'dormitory', name: 'Общежитие' },
  { id: 'documents', name: 'Документы' }
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
    question: 'Является ли информация на официальном сайте Филиала www.gubkin.uz достоверной?',
    answer: 'Да, информация на официальном сайте и в телеграм канале Филиала является достоверной.',
    category: 'general',
    hasLists: false
  },
  {
    id: 2,
    question: 'С какого числа начинается прием документов для приема на 1-й курс Филиала в 2025 году?',
    answer: 'Приемная комиссия принимает документы от абитуриентов с 16 июня по 1 июля 2025 года (включительно) в очном «off-line» и дистанционном «on-line» формате.',
    category: 'application',
    hasLists: false
  },
  {
    id: 3,
    question: 'Экзамены будут в виде тестов?',
    answerIntro: 'Экзамены проводятся в письменной (математика, русский язык) и устной (английский язык) форме.',
    answerOutro: 'С образцами билетов вступительных экзаменов можно ознакомиться по ссылке: https://gubkin.ru/info/enrollee/admission_board/postupayushchim-v-bakalavriat/priyem-na-ochnuyu-formu-obucheniya/programmy-i-obraztsy-biletov-vstupitelnykh-ispytaniy.php',
    category: 'exams',
    hasLists: false
  },
  {
    id: 4,
    question: 'Сколько стоит обучение?',
    answer: 'Стоимость обучения с 1 марта 2020 года составляет 28 размеров МРОТ.',
    category: 'study',
    hasLists: false
  },
  {
    id: 5,
    question: 'Кому предоставляют места в Доме для проживания студентов?',
    answer: 'Места в Домах для проживания студентов предоставляются на период обучения иногородним студентам.',
    category: 'dormitory',
    hasLists: false
  },
  {
    id: 6,
    question: 'Как мне получить общежитие?',
    answer: 'При подаче документов вам необходимо указать в заявлении, что вы нуждаетесь в общежитии и представить заявление после решения мандатной комиссии о рекомендации Вас к зачислению.',
    category: 'dormitory',
    hasLists: false
  },
  {
    id: 7,
    question: 'На сколько профилей подготовки (специальностей) можно подать заявление?',
    answer: 'Абитуриенты в своем заявлении могут указать до 3 конкурсных групп с указанием их приоритета с единым набором вступительных испытаний.',
    category: 'application',
    hasLists: false
  },
  {
    id: 8,
    question: 'Обязательно ли предъявление подлинника документа об образовании при поступлении в Филиал?',
    answerIntro: 'В соответствии с Правилами приёма в Филиал при подаче заявления о приеме в вуз абитуриент представляет оригинал и ксерокопию документа государственного образца об образовании.',
    answerOutro: 'В случае подачи документов в форме on-line, все документы предоставляются в отсканированной цветной форме в формате pdf или jpg и отправляются на электронную почту приёмной комиссии.',
    category: 'application',
    hasLists: false
  },
  {
    id: 9,
    question: 'Сроки подачи документов?',
    answer: 'За сроками начала и окончания приёмной кампании следите за новостями на официальном телеграм-канале t.me/gubkin_uz и на странице официального сайта Филиала https://gubkin.uz/ru/sveden/priemnaya-komissiya',
    category: 'application',
    hasLists: false
  },
  {
    id: 10,
    question: 'Нужно ли представлять в приемную комиссию медицинскую справку?',
    answer: 'Медицинская справка (по форме 086-У) с указанием полученных прививок предоставляется после поступления в Филиал.',
    category: 'documents',
    hasLists: false
  },
  {
    id: 11,
    question: 'Какой период действительна медицинская справка формы 0-86?',
    answer: 'Медицинская справка формы 0-86 действительна в течение 6 месяцев.',
    category: 'documents',
    hasLists: false
  },
  {
    id: 12,
    question: 'Есть ли в вузе военная кафедра и кому предоставляется отсрочка от службы в армии?',
    answer: 'Военной кафедры в Филиале нет, на время обучения предоставляется отсрочка от службы в армии для студентов, обучающихся в Филиале.',
    category: 'general',
    hasLists: false
  },
  {
    id: 13,
    question: 'Предоставляется ли общежитие абитуриентам на время сдачи вступительных экзаменов в вузе?',
    answer: 'На время сдачи вступительных испытаний абитуриентам общежитие не предоставляется.',
    category: 'dormitory',
    hasLists: false
  },
  {
    id: 14,
    question: 'Что значит степень бакалавра?',
    answer: 'Это первая академическая ступень в трехуровневой структуре высшего образования. Степень «бакалавр» – это базовое высшее образование. Нормативный срок обучения составляет 4 года. Диплом бакалавра дает право на работу по направлению и (или) поступление в магистратуру. Эта степень включена в международную классификацию, она понятна за рубежом.',
    category: 'study',
    hasLists: false
  },
  {
    id: 15,
    question: 'Какие документы необходимо представить в приемную комиссию?',
    answer: 'Пакет необходимых документов вы можете посмотреть на странице официального сайта Филиала https://gubkin.uz/ru/sveden/neobhodimye-dokumenty',
    category: 'application',
    hasLists: false
  },
  {
    id: 16,
    question: 'Нужно ли нотариально заверять копии документов?',
    answer: 'При подаче документов в Филиал Вы предоставляете нотариально заверенный перевод 1-й страницы паспорта на русский язык.',
    category: 'application',
    hasLists: false
  },
  {
    id: 17,
    question: 'В каких случаях мои документы не примут?',
    answer: 'Если вы предоставили не полный пакет документов. При успешном приеме документов Вас об этом уведомит ответственный сотрудник приемной комиссии. В обратном случае рекомендуется обратиться в call-центр Филиала.',
    category: 'application',
    hasLists: false
  },
  {
    id: 18,
    question: 'По итогам результатов мандатной комиссии, обязательно ли одному из родителей присутствовать при заключении договора на обучение на платно-контрактной основе?',
    answer: 'Да, обязательно.',
    category: 'application',
    hasLists: false
  },
  {
    id: 19,
    question: 'Может ли один из родителей заключить договор без меня?',
    answer: 'Родитель или опекун сможет заключить договор без вашего присутствия, но только в том случае, если у него на руках будет нотариально заверенная доверенность от вас.',
    category: 'application',
    hasLists: false
  },
  {
    id: 20,
    question: 'Можно ли гражданину Республики Узбекистан, являющегося студентом Российского ВУЗа оформить перевод в Филиал РГУ нефти и газа (НИУ) им.И.М.Губкина в г.Ташкенте на контрактной основе?',
    answer: 'Филиал РГУ нефти и газа (НИУ) имени И.М. Губкина в г.Ташкенте является структурным подразделением головного университета, т.е. РГУ нефти и газа (НИУ) имени И.М. Губкина в г.Москве. Все вопросы, связанные с переводом студентов из одного вуза в другой вуз Российской Федерации, регламентируется Порядком перевода обучающихся в другую организацию, осуществляющую образовательную деятельность по образовательным программа среднего профессионального и (или) высшего образования, утвержденного приказом министерства образования и науки Российской Федерации от 10 февраля 2017 г. N 124.',
    category: 'study',
    hasLists: false
  },
  {
    id: 21,
    question: 'Можно ли члену сборной Узбекистана по спорту поступать в ваш ВУЗ и возможно ли совмещение спортивной и учебной деятельности?',
    answer: 'В филиале РГУ нефти и газа имени И.М. Губкина в г. Ташкенте обучается ряд студентов, являющихся членами сборных команд республики по слалому, восточным единоборствам и другим видам спорта. Все они успешно сочетают учебу и занятия спортом.',
    category: 'study',
    hasLists: false
  },
  {
    id: 22,
    question: 'Можно ли студенту ВУЗа Республики Узбекистан поступать в магистратуру вашего Филиала?',
    answer: 'В филиале РГУ нефти и газа (НИУ) имени И.М. Губкина в г.Ташкенте обучение по программам магистратуры не осуществляется.',
    category: 'study',
    hasLists: false
  },
  {
    id: 23,
    question: 'Есть ли для абитуриентов, имеющих инвалидность, льготы при поступлении в Филиал РГУ нефти и газа (НИУ) имени И.М.Губкина в г.Ташкенте?',
    answer: 'В филиале РГУ нефти и газа имени И.М. Губкина в г.Ташкенте льгот при поступлении для людей, имеющих инвалидность, не предусмотрены.',
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