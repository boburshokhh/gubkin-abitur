<template>
  <section class="py-12 md:py-20 bg-gray-50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Направления подготовки 2025
          </h2>
          <p class="text-lg text-gray-600">
            5 направлений, 11 специализаций, 330 мест
          </p>
        </div>

        <div class="space-y-8">
          <!-- 1. Технология геологической разведки -->
          <BaseCard bordered>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="rounded-full bg-green-100 p-3 mr-4">
                    <svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900">21.05.03 «Технология геологической разведки»</h3>
                    <span class="text-sm text-gray-600">Специалитет</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-green-600">30</div>
                  <div class="text-sm text-gray-500">мест</div>
                </div>
              </div>
            </template>
            <div>
              <div class="bg-green-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-2">Специализация:</h4>
                <div class="flex items-center justify-between">
                  <span class="text-gray-700">Цифровой геоинжиниринг </span>
                  <span class="text-sm font-medium text-green-700">30 мест</span>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- 2. Нефтегазовое дело -->
          <BaseCard bordered>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="rounded-full bg-blue-100 p-3 mr-4">
                    <svg class="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900">21.03.01 «Нефтегазовое дело»</h3>
                    <span class="text-sm text-gray-600">Бакалавриат</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-blue-600">120</div>
                  <div class="text-sm text-gray-500">мест</div>
                </div>
              </div>
            </template>
            <div class="space-y-3">
              <h4 class="font-semibold text-gray-900">Профили подготовки:</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-blue-50 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-700">Бурение нефтяных и газовых скважин </span>
                    <span class="text-sm font-medium text-blue-700">30 мест</span>
                  </div>
                </div>
                <div class="bg-blue-50 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-700">Эксплуатация и обслуживание объектов добычи нефти </span>
                    <span class="text-sm font-medium text-blue-700">30 мест</span>
                  </div>
                </div>
                <div class="bg-blue-50 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-700">Эксплуатация и обслуживание объектов добычи газа </span>
                    <span class="text-sm font-medium text-blue-700">30 мест</span>
                  </div>
                </div>
                <div class="bg-blue-50 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-700">Транспорт и хранение нефти, газа </span>
                    <span class="text-sm font-medium text-blue-700">30 мест</span>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- 3. Нефтегазовые техника и технологии -->
          <BaseCard bordered>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="rounded-full bg-orange-100 p-3 mr-4">
                    <svg class="h-6 w-6 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900">21.05.06 «Нефтегазовые техника и технологии»</h3>
                    <span class="text-sm text-gray-600">Специалитет</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-orange-600">90</div>
                  <div class="text-sm text-gray-500">мест</div>
                </div>
              </div>
            </template>
            <div class="space-y-3">
              <h4 class="font-semibold text-gray-900">Специализации:</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-orange-50 rounded-lg p-4">
                  <div class="text-center">
                    <div class="text-sm text-gray-700 mb-2">Технология бурения нефтяных и газовых скважин </div>
                    <span class="text-sm font-medium text-orange-700">30 мест</span>
                  </div>
                </div>
                <div class="bg-orange-50 rounded-lg p-4">
                  <div class="text-center">
                    <div class="text-sm text-gray-700 mb-2">Разработка и эксплуатация нефтяных месторождений </div>
                    <span class="text-sm font-medium text-orange-700">30 мест</span>
                  </div>
                </div>
                <div class="bg-orange-50 rounded-lg p-4">
                  <div class="text-center">
                    <div class="text-sm text-gray-700 mb-2">Разработка и эксплуатация газовых месторождений </div>
                    <span class="text-sm font-medium text-orange-700">30 мест</span>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- 4. Экономика -->
          <BaseCard bordered>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="rounded-full bg-purple-100 p-3 mr-4">
                    <svg class="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900">38.03.01 «Экономика»</h3>
                    <span class="text-sm text-gray-600">Бакалавриат</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-purple-600">30</div>
                  <div class="text-sm text-gray-500">мест</div>
                </div>
              </div>
            </template>
            <div>
              <div class="bg-purple-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-2">Профиль подготовки:</h4>
                <div class="flex items-center justify-between">
                  <span class="text-gray-700">Экономика и проекты устойчивого развития энергетики </span>
                  <span class="text-sm font-medium text-purple-700">30 мест</span>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- 5. Менеджмент -->
          <BaseCard bordered>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="rounded-full bg-indigo-100 p-3 mr-4">
                    <svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900">38.03.02 «Менеджмент»</h3>
                    <span class="text-sm text-gray-600">Бакалавриат</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-indigo-600">60</div>
                  <div class="text-sm text-gray-500">мест</div>
                </div>
              </div>
            </template>
            <div class="space-y-3">
              <h4 class="font-semibold text-gray-900">Профили подготовки:</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-indigo-50 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-gray-700">Управление бизнесом в энергетике </span>
                    <span class="text-sm font-medium text-indigo-700">30 мест</span>
                  </div>
                </div>
                <div class="bg-indigo-50 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-gray-700">Международный менеджмент </span>
                    <span class="text-sm font-medium text-indigo-700">30 мест</span>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Важная информация -->
        <div class="mt-12">
          <BaseCard bordered>
            <template #header>
              <div class="flex items-center">
                <svg class="h-6 w-6 text-yellow-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 class="text-xl font-bold text-gray-900">Важная информация</h3>
              </div>
            </template>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">Вступительные испытания:</h4>
                <p class="text-gray-700 text-sm">
                  Одинаковые для всех направлений как для бюджетных мест, так и для мест по договорам об оказании платных образовательных услуг.
                </p>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">Выбор направлений:</h4>
                <p class="text-gray-700 text-sm">
                  Абитуриенты могут указать до <strong>3 конкурсных групп</strong> с единым набором вступительных испытаний с указанием приоритета.
                </p>
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