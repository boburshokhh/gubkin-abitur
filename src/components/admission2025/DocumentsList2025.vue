<template>
  <section class="py-12 md:py-20 bg-white">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Необходимые документы
          </h2>
          <p class="text-lg text-gray-600">
            Для участия во вступительных испытаниях абитуриенты представляют в приемную комиссию Филиала следующие документы в очном «off-line» и дистанционном «on-line» формате (документы предоставляются в электронном виде)
          </p>
        </div>

        <div class="space-y-6">
          <!-- 1. Документ об образовании -->
          <BaseCard bordered class="overflow-hidden">
            <template #header>
              <div class="flex items-center">
                <div class="rounded-full bg-green-100 p-3 mr-4">
                  <svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-gray-900">1. Документ об образовании</h3>
                  <span class="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full mt-1">
                    Обязательно
                  </span>
                </div>
              </div>
            </template>
            <div class="space-y-4">
              <p class="text-gray-700 font-medium">
                Оригинал или копия документа государственного образца об образовании (аттестат о среднем образовании, диплом о среднем и профессиональном образовании).
              </p>
              
              <div class="bg-purple-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-2">1.1. Для участников Губкинской олимпиады:</h4>
                <p class="text-sm text-gray-700">
                  Победители, призёры и участники 1-Губкинской предметной Олимпиады прилагают также цветную копию диплома/сертификата.
                </p>
              </div>

              <div class="bg-yellow-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-2">Для второго высшего образования:</h4>
                <p class="text-sm text-gray-700">
                  Лица, желающие получить второе высшее образование, представляют в приемную комиссию копию диплома о высшем образовании.
                </p>
              </div>
            </div>
          </BaseCard>

          <!-- 2. Паспорт -->
          <BaseCard bordered class="overflow-hidden">
            <template #header>
              <div class="flex items-center">
                <div class="rounded-full bg-orange-100 p-3 mr-4">
                  <svg class="h-6 w-6 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 012-2h2a2 2 0 012 2v2m-4 0a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-gray-900">2. Документы, удостоверяющие личность</h3>
                  <span class="inline-block px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full mt-1">
                    Обязательно
                  </span>
                </div>
              </div>
            </template>
            <div class="space-y-4">
              <p class="text-gray-700 font-medium">
                Отсканированная цветная копия первой страницы паспорта (лицевая и обратная сторона ID-карты) в формате «pdf» и копия нотариально заверенного перевода первой страницы паспорта (лицевой стороны ID-карты) или копия свидетельства о рождении на кириллице.
              </p>
              
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex items-start">
                  <svg class="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 class="font-semibold text-red-800 mb-1">Важно!</h4>
                    <p class="text-sm text-red-700">
                      Абитуриенты, которым на момент подачи документов в приемную комиссию исполнилось 16 лет и не имеющие паспорт (ID-карту), не будут допущены до экзаменов.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- 3. Фотография -->
          <BaseCard bordered class="overflow-hidden">
            <template #header>
              <div class="flex items-center">
                <div class="rounded-full bg-purple-100 p-3 mr-4">
                  <svg class="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-gray-900">3. Фотография</h3>
                  <span class="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full mt-1">
                    Обязательно
                  </span>
                </div>
              </div>
            </template>
            <div class="bg-purple-50 rounded-lg p-4">
              <p class="text-gray-700 font-medium">
                Фотография 3х4 см (цветное фото, на белом фоне, протокольный вид).
              </p>
            </div>
          </BaseCard>

          <!-- 4. Заполнение формы -->
          <BaseCard bordered class="overflow-hidden">
            <template #header>
              <div class="flex items-center">
                <div class="rounded-full bg-blue-100 p-3 mr-4">
                  <svg class="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-gray-900">4. Подача документов</h3>
                  <span class="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full mt-1">
                    Обязательно
                  </span>
                </div>
              </div>
            </template>
            <div class="space-y-4">
              <p class="text-gray-700">
                Абитуриент заполняет на официальном сайте Филиала <a href="https://gubkin.uz" target="_blank" class="text-blue-600 underline font-medium">https://gubkin.uz</a> (вкладка Абитуриенту/Онлайн подача документов), форму и отправляет необходимые документы в приемную комиссию.
              </p>
              
              <div class="bg-green-50 rounded-lg p-4">
                <div class="flex items-start">
                  <svg class="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h4 class="font-semibold text-green-800 mb-1">SMS-подтверждение</h4>
                    <p class="text-sm text-green-700">
                      После проверки и регистрации полученных документов абитуриент получает на номер телефона, указанный абитуриентом в заявлении, смс-оповещение о приеме документов с указанием регистрационного номера личного дела.
                    </p>
                  </div>
                </div>
              </div>

              <div class="bg-blue-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-2">Важная информация:</h4>
                <p class="text-sm text-gray-700">
                  Абитуриенты в своем заявлении могут указать до 3 конкурсных групп с указанием их приоритета с единым набором вступительных испытаний!
                </p>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Сроки и контакты -->
        <div class="mt-12">
          <BaseCard bordered>
            <template #header>
              <div class="flex items-center">
                <svg class="h-6 w-6 text-primary-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 class="text-xl font-bold text-gray-900">Сроки и режим работы</h3>
              </div>
            </template>
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-semibold text-gray-900 mb-3">Сроки приема документов:</h4>
                  <div class="text-lg">
                    <span class="font-bold text-primary-600">с 16 июня по 1 июля (включительно) 2025 года</span>
                  </div>
                  <p class="text-sm text-gray-600 mt-2">
                    в очном «off-line» и дистанционном «on-line» формате
                  </p>
                  <p class="text-sm text-gray-600 mt-1">
                    Документы принимаются в режиме on-line 24 часа в сутки.
                  </p>
                </div>
                
                <div>
                  <h4 class="font-semibold text-gray-900 mb-3">Адрес приемной комиссии:</h4>
                  <p class="text-gray-700 mb-3">
                    город Ташкент, Мирзо Улугбекский район, улица Дурмон йули, дом 34
                  </p>
                  <div class="space-y-2 text-sm">
                    <div class="flex items-center">
                      <svg class="h-4 w-4 text-primary-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>Call-центр: (+99871) 200-01-56</span>
                    </div>
                    <div class="text-gray-600">
                      Ответственное лицо – Копаненко Кристина Александровна
                    </div>
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
import { BaseCard, BaseButton } from '@/components/ui';
</script> 