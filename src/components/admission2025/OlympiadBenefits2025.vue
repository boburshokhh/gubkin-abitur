<template>
  <section class="py-12 md:py-20 bg-white">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Льготы для участников олимпиад
          </h2>
          <p class="text-lg text-gray-600">
            Особые условия поступления для победителей и участников олимпиад 2025 года
          </p>
        </div>

        <div class="space-y-8">
          <!-- Республиканская олимпиада -->
          <BaseCard bordered>
            <template #header>
              <div class="flex items-center">
                <div class="rounded-full bg-yellow-100 p-3 mr-4">
                  <svg class="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900">Республиканская олимпиада РУз 2025</h3>
                  <span class="text-sm text-gray-600">По математике для учащихся школ, лицеев и колледжей</span>
                </div>
              </div>
            </template>
            <div class="space-y-6">
              <!-- Для технических направлений -->
              <div class="bg-green-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-3">Для технических направлений:</h4>
                <div class="space-y-2">
                  <div class="flex items-center">
                    <svg class="h-5 w-5 text-green-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span class="text-sm text-gray-700">«Технология геологической разведки»</span>
                  </div>
                  <div class="flex items-center">
                    <svg class="h-5 w-5 text-green-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span class="text-sm text-gray-700">«Нефтегазовые техника и технологии»</span>
                  </div>
                  <div class="flex items-center">
                    <svg class="h-5 w-5 text-green-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span class="text-sm text-gray-700">«Нефтегазовое дело» (конкурсные группы 1-8)</span>
                  </div>
                </div>
                <div class="mt-3 p-3 bg-green-100 rounded-md">
                  <p class="text-sm text-green-800 font-medium">
                    Победители заключительного этапа принимаются <strong>БЕЗ ВСТУПИТЕЛЬНЫХ ИСПЫТАНИЙ</strong>
                  </p>
                </div>
              </div>

              <!-- Для экономических направлений -->
              <div class="bg-blue-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-3">Для «Экономика» и «Менеджмент»:</h4>
                <div class="space-y-2">
                  <div class="flex items-center">
                    <svg class="h-5 w-5 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm text-gray-700">Результат по математике засчитывается с <strong>наивысшим баллом (100 баллов)</strong></span>
                  </div>
                  <p class="text-xs text-gray-600 ml-7">
                    Остальные экзамены (русский язык, английский язык) сдаются в обычном порядке
                  </p>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- Губкинская олимпиада -->
          <BaseCard bordered>
            <template #header>
              <div class="flex items-center">
                <div class="rounded-full bg-blue-100 p-3 mr-4">
                  <svg class="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900">Губкинская предметная олимпиада 2025</h3>
                  <span class="text-sm text-gray-600">По русскому языку и математике</span>
                </div>
              </div>
            </template>
            <div class="space-y-6">
              <!-- Победители и призеры -->
              <div class="space-y-4">
                <div class="bg-gold-50 border border-gold-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                    <svg class="h-5 w-5 text-yellow-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l7 7 7-7M5 21l7-7 7 7" />
                    </svg>
                    Победители и призеры
                  </h4>
                  
                  <div class="space-y-3">
                    <div class="bg-green-50 rounded-md p-3">
                      <h5 class="font-medium text-green-800 mb-2">Технические направления:</h5>
                      <ul class="text-sm text-green-700 space-y-1">
                        <li>• «Технология геологической разведки»</li>
                        <li>• «Нефтегазовые техника и технологии»</li>
                        <li>• «Нефтегазовое дело» (конкурсные группы 1-8)</li>
                      </ul>
                      <div class="mt-2 p-2 bg-green-100 rounded">
                        <p class="text-sm text-green-800 font-medium">
                          Принимаются <strong>БЕЗ ВСТУПИТЕЛЬНЫХ ИСПЫТАНИЙ</strong>
                        </p>
                      </div>
                    </div>

                    <div class="bg-blue-50 rounded-md p-3">
                      <h5 class="font-medium text-blue-800 mb-2">«Экономика» и «Менеджмент»:</h5>
                      <div class="space-y-2">
                        <div class="flex items-start">
                          <span class="text-blue-600 mr-2">•</span>
                          <div>
                            <p class="text-sm text-blue-700"><strong>Победители:</strong> БЕЗ ВСТУПИТЕЛЬНЫХ ИСПЫТАНИЙ</p>
                          </div>
                        </div>
                        <div class="flex items-start">
                          <span class="text-blue-600 mr-2">•</span>
                          <div>
                            <p class="text-sm text-blue-700"><strong>Призеры:</strong> результаты по русскому языку и математике засчитываются с наивысшим баллом (100 баллов)</p>
                            <p class="text-xs text-blue-600 mt-1">Английский язык сдается в обычном порядке</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Участники -->
              <div class="bg-purple-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                  <svg class="h-5 w-5 text-purple-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Участники (не ставшие победителями и призерами)
                </h4>
                <div class="space-y-2">
                  <div class="flex items-start">
                    <span class="text-purple-600 mr-2">•</span>
                    <div>
                      <p class="text-sm text-purple-700">
                        Участникам Губкинской предметной олимпиады 2025 года по русскому
языку и математике, не ставшим победителями и призёрами, но набравшим не менее
40 баллов по соответствующим предметам, эти результаты могут быть зачтены в
качестве результатов вступительных испытаний с той же оценкой.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Важные условия -->
        <div class="mt-12">
          <BaseCard bordered>
            <template #header>
              <div class="flex items-center">
                <svg class="h-6 w-6 text-red-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 class="text-xl font-bold text-gray-900">Важные условия</h3>
              </div>
            </template>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">Сроки подачи документов:</h4>
                <div class="bg-red-50 rounded-lg p-4">
                  <div class="text-lg">
                    <span class="font-bold text-red-600">до 01 июля 2025 года</span>
                  </div>
                  <p class="text-sm text-red-700 mt-2">
                    Победители и призеры олимпиад должны представить в приемную комиссию Филиала подтверждающие документы
                  </p>
                </div>
              </div>
              
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">Для республиканской олимпиады:</h4>
                <div class="bg-yellow-50 rounded-lg p-4">
                  <div class="space-y-2 text-sm text-yellow-700">
                    <div class="flex items-start">
                      <span class="text-yellow-600 mr-2">•</span>
                      <span>Подтверждающие документы</span>
                    </div>
                    <div class="flex items-start">
                      <span class="text-yellow-600 mr-2">•</span>
                      <span>Нотариально заверенный перевод на русский язык</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Необходимые документы -->
        <div class="mt-8">
          <BaseCard bordered>
            <template #header>
              <div class="flex items-center">
                <svg class="h-6 w-6 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="text-xl font-bold text-gray-900">Необходимые документы</h3>
              </div>
            </template>
            <div class="space-y-4">
              <div class="bg-blue-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-2">Для участников Губкинской олимпиады:</h4>
                <p class="text-sm text-gray-700">
                  Цветная копия диплома/сертификата (прилагается к основному пакету документов)
                </p>
              </div>
              
              <div class="bg-yellow-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-2">Для участников Республиканской олимпиады:</h4>
                <div class="space-y-1 text-sm text-gray-700">
                  <div class="flex items-start">
                    <span class="text-yellow-600 mr-2">•</span>
                    <span>Подтверждающие документы о <strong>победе</strong></span>
                  </div>
                  <div class="flex items-start">
                    <span class="text-yellow-600 mr-2">•</span>
                    <span>Нотариально заверенный перевод документов на русский язык</span>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { BaseCard } from '@/components/ui';
</script> 