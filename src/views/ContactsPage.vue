<template>
  <main>
    <!-- Hero секция -->
    <section class="py-12 md:py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Контакты
          </h1>
          <p class="text-lg md:text-xl opacity-90 mb-8">
            Свяжитесь с приемной комиссией Филиала Губкинского университета в Ташкенте
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <BaseButton tag="a" href="tel:+998712000156" size="lg" variant="light" class="font-semibold">
              <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Позвонить сейчас
            </BaseButton>
            <BaseButton tag="a" href="https://t.me/gubkin_uz" target="_blank" size="lg" variant="primary" class="border border-white">
              <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Написать в Telegram
            </BaseButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Контактная информация -->
    <ContactInfo2025 />

    <!-- Дополнительная информация -->
    <section class="py-12 md:py-16 bg-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Быстрые ссылки -->
            <BaseCard bordered class="h-full">
              <template #header>
                <h3 class="text-xl font-semibold text-gray-900">Быстрые ссылки</h3>
              </template>
              <div class="space-y-4">
                <router-link 
                  to="/admission2025" 
                  class="flex items-center p-3 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <svg class="h-5 w-5 text-primary-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <div class="font-medium text-gray-900">Приемная кампания 2025</div>
                    <div class="text-sm text-gray-600">Полная информация о поступлении</div>
                  </div>
                </router-link>
                
                <router-link 
                  to="/directions" 
                  class="flex items-center p-3 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <svg class="h-5 w-5 text-primary-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div>
                    <div class="font-medium text-gray-900">Направления обучения</div>
                    <div class="text-sm text-gray-600">Все специальности и программы</div>
                  </div>
                </router-link>
                
                <router-link 
                  to="/register" 
                  class="flex items-center p-3 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <svg class="h-5 w-5 text-primary-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <div>
                    <div class="font-medium text-gray-900">Подать документы</div>
                    <div class="text-sm text-gray-600">Онлайн подача заявления</div>
                  </div>
                </router-link>
              </div>
            </BaseCard>

            <!-- Часто задаваемые вопросы -->
            <BaseCard bordered class="h-full">
              <template #header>
                <h3 class="text-xl font-semibold text-gray-900">Часто задаваемые вопросы</h3>
              </template>
              <div class="space-y-4">
                <div>
                  <h4 class="font-medium text-gray-900 mb-1">Когда начинается прием документов?</h4>
                  <p class="text-sm text-gray-600">Прием документов начинается 16 июня 2025 года</p>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 mb-1">Можно ли подать документы онлайн?</h4>
                  <p class="text-sm text-gray-600">Да, документы можно подать онлайн через наш сайт</p>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 mb-1">Какие экзамены нужно сдавать?</h4>
                  <p class="text-sm text-gray-600">Математика и русский язык для всех направлений, английский для экономики и менеджмента</p>
                </div>
                <div class="mt-4">
                  <router-link 
                    to="/faq" 
                    class="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Посмотреть все вопросы →
                  </router-link>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import ContactInfo2025 from '@/components/admission2025/ContactInfo2025.vue';
import { BaseButton, BaseCard } from '@/components/ui';
</script> 