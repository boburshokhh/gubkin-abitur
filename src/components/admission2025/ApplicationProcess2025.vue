<template>
  <section class="py-12 md:py-20 bg-white">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Процесс подачи документов
          </h2>
          <p class="text-lg text-gray-600">
            Пошаговая инструкция для абитуриентов 2025 года
          </p>
        </div>

        <!-- Основные шаги -->
        <div class="space-y-8">
          <!-- Шаг 1: Выбор направлений -->
          <div class="flex items-start">
            <div class="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-6">
              1
            </div>
            <div class="flex-1">
              <BaseCard bordered>
                <template #header>
                  <h3 class="text-xl font-semibold text-gray-900">Выберите направления</h3>
                </template>
                <div class="space-y-4">
                  <p class="text-gray-700">
                    Определитесь с конкурсными группами, на которые хотите поступить.
                  </p>
                  <div class="bg-blue-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-2">Важно:</h4>
                    <ul class="text-sm text-gray-700 space-y-1">
                      <li>• Максимум <strong>до 3 конкурсных групп</strong></li>
                      <li>• Единый набор вступительных испытаний</li>
                      <li>• Укажите приоритет направлений</li>
                    </ul>
                  </div>
                </div>
              </BaseCard>
            </div>
          </div>

          <!-- Шаг 2: Подготовка документов -->
          <div class="flex items-start">
            <div class="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-6">
              2
            </div>
            <div class="flex-1">
              <BaseCard bordered>
                <template #header>
                  <h3 class="text-xl font-semibold text-gray-900">Подготовьте документы</h3>
                </template>
                <div class="space-y-4">
                  <p class="text-gray-700">
                    Соберите необходимые документы в электронном виде (форматы PDF, JPG).
                  </p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-yellow-50 rounded-lg p-3">
                      <h5 class="font-medium text-gray-900 text-sm mb-2">Обязательные документы:</h5>
                      <ul class="text-xs text-gray-700 space-y-1">
                        <li>• Документ об образовании</li>
                        <li>• Паспорт/ID (цветная копия)</li>
                        <li>• Нотариальный перевод</li>
                        <li>• Фотография 3×4 см</li>
                      </ul>
                    </div>
                    <div class="bg-purple-50 rounded-lg p-3">
                      <h5 class="font-medium text-gray-900 text-sm mb-2">Для участников олимпиады:</h5>
                      <ul class="text-xs text-gray-700 space-y-1">
                        <li>• Диплом/сертификат олимпиады</li>
                        <li>• Цветная копия</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </BaseCard>
            </div>
          </div>

          <!-- Шаг 3: Заполнение формы -->
          <div class="flex items-start">
            <div class="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-6">
              3
            </div>
            <div class="flex-1">
              <BaseCard bordered>
                <template #header>
                  <h3 class="text-xl font-semibold text-gray-900">Заполните форму на сайте</h3>
                </template>
                <div class="space-y-4">
                  <p class="text-gray-700">
                    Перейдите на <a href="https://gubkin.uz" target="_blank" class="text-blue-600 underline font-medium">gubkin.uz</a> и заполните онлайн-форму.
                  </p>
                  
                  <div class="bg-green-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-2">Путь на сайте:</h4>
                    <p class="text-sm text-gray-700">
                      Абитуриенту → Онлайн подача документов
                    </p>
                  </div>

                  <div class="bg-blue-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-2">Режим работы онлайн-приема:</h4>
                    <p class="text-sm text-gray-700">
                      <strong>24 часа в сутки</strong> в период с 16 июня по 01 июля 2025 года
                    </p>
                  </div>
                </div>
              </BaseCard>
            </div>
          </div>

          <!-- Шаг 4: Получение подтверждения -->
          <div class="flex items-start">
            <div class="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-6">
              4
            </div>
            <div class="flex-1">
              <BaseCard bordered>
                <template #header>
                  <h3 class="text-xl font-semibold text-gray-900">Получите подтверждение</h3>
                </template>
                <div class="space-y-4">
                  <p class="text-gray-700">
                    После проверки документов получите SMS-подтверждение о регистрации.
                  </p>
                  
                  <div class="bg-green-50 rounded-lg p-4">
                    <div class="flex items-start">
                      <svg class="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <h4 class="font-semibold text-green-800 mb-1">SMS-уведомление</h4>
                        <p class="text-sm text-green-700">
                          Сообщение придет на номер телефона, указанный в заявлении, с <strong>регистрационным номером личного дела</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="bg-blue-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-2">При подаче очно:</h4>
                    <p class="text-sm text-gray-700">
                      Получите расписку установленной формы
                    </p>
                  </div>
                </div>
              </BaseCard>
            </div>
          </div>
        </div>

        <!-- Важные сроки -->
        <div class="mt-12">
          <BaseCard bordered>
            <template #header>
              <div class="flex items-center">
                <svg class="h-6 w-6 text-red-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 class="text-xl font-bold text-gray-900">Важные сроки</h3>
              </div>
            </template>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">Прием документов:</h4>
                <div class="text-lg">
                  <span class="font-bold text-red-600">16 июня - 01 июля 2025</span>
                </div>
                <p class="text-sm text-gray-600 mt-2">
                  (включительно)
                </p>
              </div>
              
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">Для участников олимпиад:</h4>
                <div class="text-lg">
                  <span class="font-bold text-purple-600">до 01 июля 2025</span>
                </div>
                <p class="text-sm text-gray-600 mt-2">
                  Подтверждающие документы
                </p>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Важная информация -->
        <div class="mt-8">
          <BaseCard bordered>
            <template #header>
              <div class="flex items-center">
                <svg class="h-6 w-6 text-yellow-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 class="text-xl font-bold text-gray-900">Обратите внимание</h3>
              </div>
            </template>
            <div class="space-y-4">
              <div class="bg-red-50 rounded-lg p-4">
                <h4 class="font-semibold text-red-800 mb-2">Отзыв документов:</h4>
                <p class="text-sm text-red-700">
                  Лица, забравшие документы после завершения приема документов, <strong>выбывают из конкурса</strong>.
                </p>
              </div>

              <div class="bg-yellow-50 rounded-lg p-4">
                <h4 class="font-semibold text-yellow-800 mb-2">Возрастное ограничение:</h4>
                <p class="text-sm text-yellow-700">
                  Абитуриенты, которым на момент подачи документов исполнилось 16 лет и не имеющие паспорт (ID-карту), <strong>не будут допущены до экзаменов</strong>.
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