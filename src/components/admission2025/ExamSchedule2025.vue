<template>
  <section class="py-12 md:py-20 bg-gray-50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Расписание вступительных испытаний
          </h2>
          <p class="text-lg text-gray-600">
            Экзамены проводятся в помещениях Филиала (Ташкент, Мирзо-Улугбекский район, ул. Дурмон йули, дом 34)
          </p>
        </div>

        <!-- График экзаменов -->
        <div class="space-y-6">
          <!-- Математика -->
          <BaseCard bordered>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="rounded-full bg-blue-100 p-3 mr-4">
                    <svg class="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900">Математика</h3>
                    <span class="text-sm text-gray-600">Письменно, 2 часа</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-blue-600">03 июля</div>
                  <div class="text-sm text-gray-500">09:00</div>
                </div>
              </div>
            </template>
            <div class="space-y-4">
              <div class="bg-blue-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-2">Для всех направлений:</h4>
                <p class="text-sm text-gray-700">
                  Обязательный экзамен для всех специальностей. Результат оценивается по 100-балльной шкале.
                </p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 class="font-medium text-gray-900 mb-2">Просмотр работ:</h5>
                  <p class="text-sm text-gray-700">04-05 июля, 10:00-13:00</p>
                </div>
                <div>
                  <h5 class="font-medium text-gray-900 mb-2">Апелляция:</h5>
                  <p class="text-sm text-gray-700">04-05 июля, 13:00-15:00</p>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- Русский язык -->
          <BaseCard bordered>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="rounded-full bg-green-100 p-3 mr-4">
                    <svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900">Русский язык</h3>
                    <span class="text-sm text-gray-600">Письменно, 2 часа</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-green-600">08 июля</div>
                  <div class="text-sm text-gray-500">09:00</div>
                </div>
              </div>
            </template>
            <div class="space-y-4">
              <div class="bg-green-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-2">Для всех направлений:</h4>
                <p class="text-sm text-gray-700">
                  Обязательный экзамен для всех специальностей. Результат оценивается по 100-балльной шкале.
                </p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 class="font-medium text-gray-900 mb-2">Просмотр работ:</h5>
                  <p class="text-sm text-gray-700">09 июля, 10:00-13:00</p>
                </div>
                <div>
                  <h5 class="font-medium text-gray-900 mb-2">Апелляция:</h5>
                  <p class="text-sm text-gray-700">09 июля, 13:00-15:00</p>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- Английский язык -->
          <BaseCard bordered>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="rounded-full bg-purple-100 p-3 mr-4">
                    <svg class="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900">Английский язык</h3>
                    <span class="text-sm text-gray-600">Устно, 30-40 минут подготовки</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-purple-600">11-12 июля</div>
                  <div class="text-sm text-gray-500">09:00</div>
                </div>
              </div>
            </template>
            <div class="space-y-4">
              <div class="bg-purple-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-2">Только для «Экономика» и «Менеджмент»:</h4>
                <p class="text-sm text-gray-700">
                  Специальный экзамен для экономических направлений. Результат оценивается по 100-балльной шкале.
                </p>
              </div>
              
              <div class="bg-yellow-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-2">Содержание экзамена:</h4>
                <ul class="text-sm text-gray-700 space-y-1">
                  <li>• Чтение и перевод текста</li>
                  <li>• Понимание текста (5-6 вопросов на английском)</li>
                  <li>• Беседа по темам: Узбекистан, Россия, Англия, семья, школа, спорт</li>
                  <li>• Автобиография и профориентация</li>
                </ul>
              </div>
              
              <div class="bg-red-50 rounded-lg p-4">
                <h4 class="font-semibold text-red-800 mb-2">Важно!</h4>
                <p class="text-sm text-red-700">
                  Результаты устного экзамена <strong>не подлежат апелляции</strong>
                </p>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Правила проведения экзаменов -->
        <div class="mt-12">
          <BaseCard bordered>
            <template #header>
              <div class="flex items-center">
                <svg class="h-6 w-6 text-red-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 class="text-xl font-bold text-gray-900">Правила проведения экзаменов</h3>
              </div>
            </template>
            <div class="space-y-6">
              <!-- Допуск и документы -->
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">Допуск на экзамен:</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-blue-50 rounded-lg p-4">
                    <h5 class="font-medium text-gray-900 mb-2">Необходимые документы:</h5>
                    <ul class="text-sm text-gray-700 space-y-1">
                      <li>• Экзаменационный лист</li>
                      <li>• Паспорт/ID-карта</li>
                    </ul>
                  </div>
                  <div class="bg-green-50 rounded-lg p-4">
                    <h5 class="font-medium text-gray-900 mb-2">Получение экзаменационного листа:</h5>
                    <p class="text-sm text-gray-700">
                      В день экзамена с 07:00 до 08:45
                    </p>
                  </div>
                </div>
              </div>

              <!-- Запреты -->
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">Категорически запрещается:</h4>
                <div class="bg-red-50 rounded-lg p-4">
                  <ul class="text-sm text-red-700 space-y-2">
                    <li class="flex items-start">
                      <span class="text-red-600 mr-2">•</span>
                      <span>Проносить мобильные телефоны, микрокалькуляторы, компьютеры и другие средства телекоммуникации</span>
                    </li>
                    <li class="flex items-start">
                      <span class="text-red-600 mr-2">•</span>
                      <span>Покидать аудиторию во время экзамена (кроме случаев плохого самочувствия в сопровождении наблюдателя)</span>
                    </li>
                    <li class="flex items-start">
                      <span class="text-red-600 mr-2">•</span>
                      <span>Опаздывать к началу экзамена</span>
                    </li>
                  </ul>
                  <div class="mt-3 p-3 bg-red-100 rounded-md">
                    <p class="text-sm text-red-800 font-medium">
                      За нарушение правил - удаление с экзамена и отстранение от дальнейшего участия в конкурсе!
                    </p>
                  </div>
                </div>
              </div>

              <!-- Использование ЕГЭ -->
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">Результаты ЕГЭ:</h4>
                <div class="bg-blue-50 rounded-lg p-4">
                  <p class="text-sm text-gray-700">
                    Поступающие (резиденты и не резиденты РУз), сдавшие ЕГЭ, могут заявить результаты ЕГЭ по одному или нескольким предметам. 
                    Баллы ЕГЭ включаются в общую сумму баллов.
                  </p>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Публикация результатов -->
        <div class="mt-8">
          <BaseCard bordered>
            <template #header>
              <div class="flex items-center">
                <svg class="h-6 w-6 text-green-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-xl font-bold text-gray-900">После экзаменов</h3>
              </div>
            </template>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">Публикация результатов:</h4>
                <div class="text-lg">
                  <span class="font-bold text-green-600">15 июля 2025</span>
                </div>
                <p class="text-sm text-gray-600 mt-2">
                  Рейтинговые списки по всем направлениям
                </p>
              </div>
              
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">Зачисление:</h4>
                <div class="text-lg">
                  <span class="font-bold text-blue-600">20-25 июля 2025</span>
                </div>
                <p class="text-sm text-gray-600 mt-2">
                  По результатам конкурса
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