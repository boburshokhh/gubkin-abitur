<template>
  <section class="py-12 md:py-20 bg-gray-50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Контакты приемной комиссии
          </h2>
          <p class="text-lg text-gray-600">
            Свяжитесь с нами для получения дополнительной информации
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Основная контактная информация -->
          <BaseCard bordered class="h-full">
            <template #header>
              <div class="flex items-center">
                <div class="rounded-full bg-primary-100 p-3 mr-3">
                  <svg class="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900">Адрес и местоположение</h3>
              </div>
            </template>
            <div class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Адрес</dt>
                <dd class="text-base text-gray-900">
                  Город Ташкент, Мирзо Улугбекский район, улица Дурмон йули, дом 34
                </dd>
              </div>
              <div class="bg-primary-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-2">Как добраться:</h4>
                <ul class="space-y-1 text-sm text-gray-700">
                  <li class="flex items-start">
                    <span class="text-primary-600 mr-2">•</span>
                    Метро: станция "Буюк ипак йули"
                  </li>
                  <li class="flex items-start">
                    <span class="text-primary-600 mr-2">•</span>
                    Остановка автобуса  "Институт механики"
                    Автобус: № 25, 151, Маршрутка: № 31м
                  </li>
                  
                  <li class="flex items-start">
                    <span class="text-primary-600 mr-2">•</span>
                    Ориентир: рядом с Институт микробиологии академии наук Республики Узбекистан
                  </li>
                </ul>
              </div>
            </div>
          </BaseCard>

          <!-- Call-центр -->
          <BaseCard bordered class="h-full">
            <template #header>
              <div class="flex items-center">
                <div class="rounded-full bg-green-100 p-3 mr-3">
                  <svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900">Call-центр</h3>
              </div>
            </template>
            <div class="space-y-4">
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600 mb-2">
                  <a href="tel:+998712000156" class="hover:underline">
                    (+99871) 200-01-56
                  </a>
                </div>
                <p class="text-sm text-gray-600">Горячая линия приемной комиссии</p>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500 mb-2">Ответственное лицо</dt>
                <dd class="text-base text-gray-900 font-semibold">Гафурова Умида Ирмухаматовна</dd>
              </div>

              <div class="bg-green-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-3">Время работы call-центра:</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-700">Понедельник – пятница:</span>
                    <span class="font-medium text-gray-900">09:00 – 18:00</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-700">Суббота:</span>
                    <span class="font-medium text-gray-900">09:00 – 17:00</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-700">Воскресенье:</span>
                    <span class="font-medium text-red-600">Выходной</span>
                  </div>
                  <div class="pt-2 border-t border-green-200">
                    <div class="flex justify-between">
                      <span class="text-gray-700">Технический перерыв:</span>
                      <span class="font-medium text-gray-900">13:00 – 14:00</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">(ежедневно)</p>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- Онлайн-ресурсы -->
          <BaseCard bordered class="h-full">
            <template #header>
              <div class="flex items-center">
                <div class="rounded-full bg-blue-100 p-3 mr-3">
                  <svg class="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900">Онлайн-ресурсы</h3>
              </div>
            </template>
            <div class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-500 mb-2">Официальный сайт</dt>
                <dd>
                  <a 
                    href="https://gubkin.uz" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <svg class="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6l-7 7" />
                    </svg>
                    https://gubkin.uz
                  </a>
                </dd>
              </div>

              <div>
                <dt class="text-sm font-medium text-gray-500 mb-2">Официальный Telegram-канал</dt>
                <dd>
                  <a 
                    href="https://t.me/gubkin_uz" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <svg class="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    t.me/gubkin_uz
                  </a>
                </dd>
              </div>

              <div class="bg-blue-50 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-2">Следите за обновлениями:</h4>
                <ul class="space-y-1 text-sm text-gray-700">
                  <li class="flex items-start">
                    <span class="text-blue-600 mr-2">•</span>
                    Актуальная информация о приеме
                  </li>
                  <li class="flex items-start">
                    <span class="text-blue-600 mr-2">•</span>
                    Расписание консультаций и экзаменов
                  </li>
                  <li class="flex items-start">
                    <span class="text-blue-600 mr-2">•</span>
                    Важные объявления и изменения
                  </li>
                </ul>
              </div>
            </div>
          </BaseCard>

          <!-- Техническая поддержка -->
          <BaseCard bordered class="h-full">
            <template #header>
              <div class="flex items-center">
                <div class="rounded-full bg-purple-100 p-3 mr-3">
                  <svg class="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900">Техническая поддержка</h3>
              </div>
            </template>
            <div class="space-y-4">
              <p class="text-gray-700">
                Если у вас возникли технические проблемы с подачей документов онлайн, обратитесь за помощью:
              </p>

              <div class="space-y-3">
                <div class="flex items-center p-3 bg-purple-50 rounded-lg">
                  <svg class="h-5 w-5 text-purple-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <div class="font-medium text-gray-900">Телефон поддержки</div>
                    <div class="text-sm text-gray-600">
                      <a href="tel:+998712000156" class="text-purple-600 hover:underline">
                        (+99871) 200-01-56
                      </a>
                    </div>
                  </div>
                </div>

                <div class="flex items-center p-3 bg-purple-50 rounded-lg">
                  <svg class="h-5 w-5 text-purple-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <div>
                    <div class="font-medium text-gray-900">Telegram</div>
                    <div class="text-sm text-gray-600">
                      <a href="https://t.me/gubkin_uz" target="_blank" class="text-purple-600 hover:underline">
                        @gubkin_uz
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="flex items-start">
                  <svg class="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 class="font-semibold text-yellow-800 mb-1">Рекомендации</h4>
                    <ul class="text-sm text-yellow-700 space-y-1">
                      <li>• Используйте актуальную версию браузера</li>
                      <li>• Проверьте стабильность интернет-соединения</li>
                      <li>• Подготовьте документы в формате PDF (до 5 МБ)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Карта (заглушка) -->
        <div class="mt-12 max-w-4xl mx-auto">
          <div class="bg-white rounded-lg shadow-md border border-gray-200">
              <!-- Header -->
              <div class="p-6 border-b border-gray-200">
                  <div class="flex items-center">
                      <div class="rounded-full bg-gray-100 p-3 mr-3">
                          <svg class="h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                      </div>
                      <h3 class="text-xl font-semibold text-gray-900">Расположение на карте</h3>
                  </div>
              </div>
              
              <!-- Map Content -->
              <div class="p-6">
                  <div class="rounded-lg overflow-hidden shadow-sm">
                      <iframe 
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2995.764941041147!2d69.3396315746695!3d41.335724471306484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38aef45c4a6715f1%3A0x1539ad8e2d2b776e!2z0KTQuNC70LjQsNC7INCg0JPQoyDQvdC10YTRgtC4INC4INCz0LDQt9CwINCyINCz0L7RgNC-0LTQtSDQotCw0YjQutC10L3RgtC1LCDQuNC80LXQvdC4INCT0YPQsdC60LjQvdCw!5e0!3m2!1sru!2s!4v1749582147213!5m2!1sru!2s" 
                          width="100%" 
                          height="400" 
                          style="border:0;" 
                          allowfullscreen="" 
                          loading="lazy" 
                          referrerpolicy="no-referrer-when-downgrade">
                      </iframe>
                  </div>
                  
                  <!-- Address Information -->
                  <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div class="flex items-center">
                          <svg class="h-5 w-5 text-gray-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p class="text-gray-700 font-medium">
                              г. Ташкент, Мирзо Улугбекский район, ул. Дурмон йули, 34
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { BaseCard, BaseButton } from '@/components/ui';
</script> 