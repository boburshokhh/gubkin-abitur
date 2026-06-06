<template>
  <main>
    <!-- Заголовок с информацией о приёмной кампании -->
    <section class="py-10 md:py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Приёмная кампания 2026
          </h1>
          <p class="text-lg md:text-xl opacity-90 mb-8">
            Подай документы онлайн для поступления в Филиал РГУ нефти и газа (НИУ) имени И.М. Губкина в городе Ташкенте
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <BaseButton 
              v-if="isAdmissionOpen"
              tag="router-link" 
              to="/register" 
              size="lg" 
              variant="light" 
              class="font-semibold"
            >
              Подать документы
            </BaseButton>
            <BaseButton 
              v-else
              disabled
              size="lg" 
              variant="outline" 
              class="font-semibold text-gray-500 border-gray-300 cursor-not-allowed"
            >
              Прием документов на 2026 год закрыт
            </BaseButton>
            <BaseButton tag="router-link" to="/admission2025" size="lg" variant="primary" class="border border-white">
              Вся информация о приеме
            </BaseButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Преимущества университета -->
    <section class="py-12 md:py-20 bg-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl md:text-3xl font-bold text-center mb-12">
          Почему Филиал РГУ нефти и газа (НИУ) имени И.М. Губкина в городе Ташкенте?
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <BaseCard bordered hover>
            <template #header>
              <div class="flex items-center">
                <div class="rounded-full bg-primary-100 p-3 mr-3">
                  <svg class="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900">Современный кампус</h3>
              </div>
            </template>
            <p class="text-gray-600">
              Наш Филиал оснащен современными учебными аудиториями, лабораториями и уникальными тренажерами для практического обучения.
            </p>
          </BaseCard>
          
          <BaseCard bordered hover>
            <template #header>
              <div class="flex items-center">
                <div class="rounded-full bg-primary-100 p-3 mr-3">
                  <svg class="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900">Высокое качество образования</h3>
              </div>
            </template>
            <p class="text-gray-600">
              Студенты получают образование по российским образовательным стандартам с привлечением ведущих профессоров и экспертов нефтегазовой отрасли.
            </p>
          </BaseCard>
          
          <BaseCard bordered hover>
            <template #header>
              <div class="flex items-center">
                <div class="rounded-full bg-primary-100 p-3 mr-3">
                  <svg class="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900">Гарантированное трудоустройство</h3>
              </div>
            </template>
            <p class="text-gray-600">
              Тесное сотрудничество с ведущими нефтегазовыми компаниями обеспечивает студентам стажировки и перспективное трудоустройство после окончания обучения.
            </p>
          </BaseCard>
        </div>
      </div>
    </section>

    <!-- Быстрая статистика приемной кампании 2026 -->
    <section class="py-12 md:py-16 bg-primary-50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900">
            Приемная кампания 2026/2027 в цифрах
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="text-center">
              <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div class="text-3xl md:text-4xl font-bold text-primary-600 mb-2">330</div>
                <div class="text-gray-600">Всего мест</div>
              </div>
            </div>
            
            <div class="text-center">
              <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div class="text-3xl md:text-4xl font-bold text-green-600 mb-2">5</div>
                <div class="text-gray-600">Направлений обучения</div>
              </div>
            </div>
            
            <div class="text-center">
              <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div class="text-3xl md:text-4xl font-bold text-blue-600 mb-2">11</div>
                <div class="text-gray-600">Специализаций</div>
              </div>
            </div>
            
            <div class="text-center">
              <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div class="text-3xl md:text-4xl font-bold text-orange-600 mb-2">16</div>
                <div class="text-gray-600">дней для подачи</div>
              </div>
            </div>
          </div>
          
          <div class="text-center mt-10">
            <BaseButton tag="router-link" to="/admission2025" size="lg" variant="primary">
              Узнать подробности
            </BaseButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Важные даты -->
    <section class="py-12 md:py-20 bg-gray-50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl md:text-3xl font-bold text-center mb-12">
          Важные даты приемной кампании
        </h2>
        
        <div class="max-w-3xl mx-auto">
          <div class="relative">
            <!-- Вертикальная линия -->
            <div class="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary-200"></div>
            
            <!-- Даты -->
            <div class="space-y-12 relative">
              <div class="flex items-center">
                <div class="flex-1 pr-8 md:pr-16 text-right">
                  <h3 class="text-lg font-semibold text-primary-700">16 июня - 1 июля</h3>
                  <p class="text-gray-600">Прием документов для поступления</p>
                </div>
                <div class="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div class="flex-1 pl-8 md:pl-16"></div>
              </div>
              
              <div class="flex items-center">
                <div class="flex-1 pr-8 md:pr-16"></div>
                <div class="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="flex-1 pl-8 md:pl-16 text-left">
                  <h3 class="text-lg font-semibold text-primary-700">3 - 12 июля</h3>
                  <p class="text-gray-600">Вступительные испытания</p>
                </div>
              </div>
              
              <div class="flex items-center">
                <div class="flex-1 pr-8 md:pr-16 text-right">
                  <h3 class="text-lg font-semibold text-primary-700">15 июля</h3>
                  <p class="text-gray-600">Публикация рейтинговых списков</p>
                </div>
                <div class="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="flex-1 pl-8 md:pl-16"></div>
              </div>
              
              <div class="flex items-center">
                <div class="flex-1 pr-8 md:pr-16"></div>
                <div class="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div class="flex-1 pl-8 md:pl-16 text-left">
                  <h3 class="text-lg font-semibold text-primary-700">20 - 25 июля</h3>
                  <p class="text-gray-600">Зачисление по результатам конкурса</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Вопросы и ответы -->
      <section class="py-12 md:py-20 bg-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl md:text-3xl font-bold text-center mb-12">
          Частые вопросы абитуриентов
        </h2>
        
        <div class="max-w-3xl mx-auto space-y-6">
          <BaseCard v-for="(faq, index) in faqs" :key="index" bordered>
            <h3 class="text-lg font-medium text-gray-900 mb-2">{{ faq.question }}</h3>
            <p class="text-gray-600">{{ faq.answer }}</p>
          </BaseCard>
          
          <div class="text-center mt-10">
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <BaseButton tag="router-link" to="/faq" variant="primary">
                Все вопросы и ответы
              </BaseButton>
              <BaseButton tag="router-link" to="/admission2025" variant="outline">
                Полная информация о приеме 2026
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue';
import { ref } from 'vue';
import { BaseCard } from '@/components/ui';

// Проверка статуса приемной кампании
const isAdmissionOpen = import.meta.env.VITE_ADMISSION_OPEN === 'true';

// Демо-данные для секции FAQ
const faqs = ref([
  {
    question: "С какого числа начинается прием документов?",
    answer: "Прием документов на 1-й курс в 2026 году проходит с 16 июня по 1 июля (включительно) в очном и дистанционном формате."
  },
  {
    question: "В какой форме проходят вступительные экзамены?",
    answer: "Экзамены проводятся письменно (математика, русский язык) и устно (английский язык). Образцы билетов доступны на сайте Филиала."
  },
  {
    question: "Какие документы нужны для поступления?",
    answer: "Оригинал и копия документа об образовании, паспорт, нотариально заверенный перевод, фото 3×4, при подаче онлайн — сканы в pdf или jpg."
  }
]);
</script> 