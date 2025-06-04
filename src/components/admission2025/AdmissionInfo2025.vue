<template>
  <section class="py-12 md:py-20 bg-white">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Общая информация о приеме
          </h2>
          <p class="text-lg text-gray-600">
            Прием на 1-й курс 2025/2026 учебного года
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Основная информация -->
          <BaseCard bordered class="h-full">
            <template #header>
              <div class="flex items-center">
                <div class="rounded-full bg-primary-100 p-3 mr-3">
                  <svg class="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900">Учебное заведение</h3>
              </div>
            </template>
            <div class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Название</dt>
                <dd class="text-base text-gray-900">Филиал Российского государственного университета нефти и газа (НИУ) имени И.М. Губкина в г. Ташкенте</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Программы</dt>
                <dd class="text-base text-gray-900">Бакалавриат и специалитет</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Форма обучения</dt>
                <dd class="text-base text-gray-900">Очная (дневная)</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Язык обучения</dt>
                <dd class="text-base text-gray-900">Русский</dd>
              </div>
            </div>
          </BaseCard>

          <!-- Квота и условия -->
          <BaseCard bordered class="h-full">
            <template #header>
              <div class="flex items-center">
                <div class="rounded-full bg-green-100 p-3 mr-3">
                  <svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900">Квота и условия</h3>
              </div>
            </template>
            <div class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Общая квота на 2025 год</dt>
                <dd class="text-2xl font-bold text-green-600">330 человек</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Основа приема</dt>
                <dd class="text-base text-gray-900">Конкурсная основа по результатам вступительных испытаний или ЕГЭ</dd>
              </div>
              <div class="bg-yellow-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-2">Для бюджетников (граждане РУз):</h4>
                <p class="text-sm text-gray-700">
                  Обязательство отработки не менее 3 лет на предприятиях нефтегазовой отрасли Узбекистана
                </p>
              </div>
            </div>
          </BaseCard>

          <!-- Сроки подачи документов -->
          <BaseCard bordered class="h-full">
            <template #header>
              <div class="flex items-center">
                <div class="rounded-full bg-blue-100 p-3 mr-3">
                  <svg class="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900">Сроки приема</h3>
              </div>
            </template>
            <div class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Сроки подачи документов</dt>
                <dd class="text-lg font-bold text-blue-600">16 июня - 01 июля 2025</dd>
                <dd class="text-sm text-gray-600">(включительно)</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Формат приема</dt>
                <dd class="text-base text-gray-900">Очно («off-line») и дистанционно («on-line»)</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Режим online</dt>
                <dd class="text-base text-gray-900">24 часа в сутки</dd>
              </div>
            </div>
          </BaseCard>

          <!-- Конкурсные группы -->
          <BaseCard bordered class="h-full">
            <template #header>
              <div class="flex items-center">
                <div class="rounded-full bg-purple-100 p-3 mr-3">
                  <svg class="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900">Выбор направлений</h3>
              </div>
            </template>
            <div class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Максимум направлений</dt>
                <dd class="text-2xl font-bold text-purple-600">до 3</dd>
                <dd class="text-sm text-gray-600">конкурсных групп</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Условие</dt>
                <dd class="text-base text-gray-900">Единый набор вступительных испытаний с указанием приоритета</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Вступительные испытания</dt>
                <dd class="text-base text-gray-900">Одинаковые для бюджетных и платных мест</dd>
              </div>
            </div>
          </BaseCard>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { BaseCard, BaseButton } from '@/components/ui';
</script> 