<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <!-- Иконка -->
        <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
          <svg class="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833-.23 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <!-- Заголовок -->
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          Приемная кампания завершена
        </h2>
        
        <!-- Описание -->
        <p class="text-lg text-gray-600 mb-6">
          Прием документов на 2025 учебный год закрыт. Подача новых заявлений временно недоступна.
        </p>
        
        <!-- Дополнительная информация -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3 text-left">
              <h3 class="text-sm font-medium text-blue-800">
                Что можно сделать:
              </h3>
              <ul class="mt-2 text-sm text-blue-700 space-y-1">
                <li>• Просмотреть статус уже поданных заявлений</li>
                <li>• Следить за результатами приемной кампании</li>
                <li>• Получить справочную информацию</li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Кнопки действий -->
        <div class="space-y-3">
          <router-link 
            to="/dashboard" 
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Перейти в личный кабинет
          </router-link>
          
          <router-link 
            to="/statistics" 
            class="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Посмотреть статистику
          </router-link>
          
          <router-link 
            to="/" 
            class="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            На главную
          </router-link>
        </div>
        
        <!-- Контактная информация -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <p class="text-sm text-gray-500">
            По вопросам приемной кампании обращайтесь:
          </p>
          <p class="text-sm text-gray-700 mt-1">
            <a href="mailto:admission@gubkin.uz" class="text-primary-600 hover:text-primary-500">
              admission@gubkin.uz
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Этот компонент не требует дополнительной логики
</script> 