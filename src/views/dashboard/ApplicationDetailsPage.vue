<template>
  <main class="container mx-auto px-4 py-6 md:py-8">
    <h1 class="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Детали заявления</h1>

    <!-- Навигационные кнопки -->
    <div class="bg-white shadow rounded-lg mb-6 md:mb-8 p-3 md:p-4">
      <div class="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4">
        <router-link 
          to="/dashboard/applications" 
          class="px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center sm:justify-start"
          :class="[$route.path.includes('/dashboard/applications') && !$route.params.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200']"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Мои заявления
          </span>
        </router-link>
        
        <router-link 
          to="/dashboard/profile" 
          class="px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center sm:justify-start"
          :class="[$route.path === '/dashboard/profile' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200']"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Мой профиль
          </span>
        </router-link>
        
        <router-link 
          to="/register" 
          class="px-3 md:px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center sm:justify-start"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Подать новое заявление
          </span>
        </router-link>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center">
        <svg class="h-6 w-6 text-red-600 mr-3 mb-2 sm:mb-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="text-lg font-medium">Ошибка при загрузке данных</h3>
          <p class="mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-else-if="application">
      <!-- Статус заявления -->
      <div class="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div class="bg-primary-600 px-4 py-3 md:px-6 md:py-4 flex flex-col sm:flex-row justify-between sm:items-center">
          <h2 class="text-lg md:text-xl font-medium text-white mb-2 sm:mb-0">Заявление №{{ application.id }}</h2>
          <span 
            :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium max-w-fit', 
              getStatusClass(application.status_id)
            ]"
          >
            {{ getStatusText(application.status_id) }}
          </span>
        </div>
      </div>

      <!-- Вкладки для переключения информации -->
      <div class="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div class="border-b border-gray-200 overflow-x-auto">
          <nav class="flex min-w-max">
            <button 
              @click="activeTab = 'details'"
              :class="[
                'py-3 md:py-4 px-4 md:px-6 text-center font-medium text-xs sm:text-sm border-b-2 focus:outline-none whitespace-nowrap',
                activeTab === 'details' 
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Данные заявления
              </span>
            </button>
            <button 
              @click="activeTab = 'documents'"
              :class="[
                'py-3 md:py-4 px-4 md:px-6 text-center font-medium text-xs sm:text-sm border-b-2 focus:outline-none whitespace-nowrap',
                activeTab === 'documents' 
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Документы
                <span v-if="application.documents?.length" class="ml-1 sm:ml-2 bg-gray-100 text-gray-800 py-0.5 px-2 rounded-full text-xs">
                  {{ application.documents.length }}
                </span>
              </span>
            </button>
            <button 
              @click="activeTab = 'history'"
              :class="[
                'py-3 md:py-4 px-4 md:px-6 text-center font-medium text-xs sm:text-sm border-b-2 focus:outline-none whitespace-nowrap',
                activeTab === 'history' 
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                История изменений
              </span>
            </button>
            <button 
              @click="activeTab = 'comments'"
              :class="[
                'py-3 md:py-4 px-4 md:px-6 text-center font-medium text-xs sm:text-sm border-b-2 focus:outline-none whitespace-nowrap',
                activeTab === 'comments' 
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Комментарии
              </span>
            </button>
          </nav>
        </div>
        
        <!-- Содержимое вкладок -->
        <div class="p-4 md:p-6">
          <!-- Вкладка с основными данными заявления -->
          <div v-if="activeTab === 'details'">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6">
              <div>
                <h3 class="text-gray-500 text-sm font-medium mb-1">Направление обучения</h3>
                <p class="text-gray-900">{{ application.direction?.name || 'Не указано' }}</p>
              </div>
              <div>
                <h3 class="text-gray-500 text-sm font-medium mb-1">Дата подачи</h3>
                <p class="text-gray-900">{{ formatDate(application.created_at) }}</p>
              </div>
              <div>
                <h3 class="text-gray-500 text-sm font-medium mb-1">Форма обучения</h3>
                <p class="text-gray-900">{{ getStudyFormText(application.study_form) }}</p>
              </div>
              <div>
                <h3 class="text-gray-500 text-sm font-medium mb-1">Финансирование</h3>
                <p class="text-gray-900">{{ getFundingFormText(application.funding_form) }}</p>
              </div>
              <!-- Другие данные заявления -->
              <div>
                <h3 class="text-gray-500 text-sm font-medium mb-1">Статус заявления</h3>
                <div class="flex items-center">
                  <span 
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', 
                      getStatusClass(application.status_id)
                    ]"
                  >
                    {{ getStatusText(application.status_id) }}
                  </span>
                </div>
              </div>
              <div>
                <h3 class="text-gray-500 text-sm font-medium mb-1">Последнее обновление</h3>
                <p class="text-gray-900">{{ formatDate(application.updated_at) }}</p>
              </div>
            </div>
            
            <!-- Показываем уведомления в зависимости от статуса -->
            <div v-if="application.status_id === 'additional_info'" class="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div class="flex flex-col sm:flex-row">
                <svg class="h-5 w-5 text-yellow-400 mr-2 mb-2 sm:mb-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 class="text-sm font-medium text-yellow-800">Требуется дополнительная информация</h4>
                  <p class="mt-1 text-sm text-yellow-700">{{ application.admin_comment || 'Пожалуйста, свяжитесь с приемной комиссией для уточнения деталей.' }}</p>
                </div>
              </div>
            </div>
            
            <div v-if="application.status_id === 'rejected'" class="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div class="flex flex-col sm:flex-row">
                <svg class="h-5 w-5 text-red-400 mr-2 mb-2 sm:mb-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 class="text-sm font-medium text-red-800">Заявление отклонено</h4>
                  <p class="mt-1 text-sm text-red-700">{{ application.admin_comment || 'Причина отклонения не указана. Свяжитесь с приемной комиссией для получения дополнительной информации.' }}</p>
                </div>
              </div>
            </div>
            
            <div v-if="application.status_id === 'approved'" class="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div class="flex flex-col sm:flex-row">
                <svg class="h-5 w-5 text-green-400 mr-2 mb-2 sm:mb-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 class="text-sm font-medium text-green-800">Заявление одобрено</h4>
                  <p class="mt-1 text-sm text-green-700">{{ application.admin_comment || 'Поздравляем! Ваше заявление принято. Ожидайте дальнейших инструкций от приемной комиссии.' }}</p>
                </div>
              </div>
            </div>

            <!-- Кнопки действий -->
            <div class="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button 
                v-if="application.status_id === 'draft'"
                @click="submitApplication"
                class="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                :disabled="isSubmitting"
              >
                <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSubmitting ? 'Отправка...' : 'Отправить на рассмотрение' }}
              </button>
              
              <router-link 
                to="/dashboard/applications" 
                class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Вернуться к списку
              </router-link>
            </div>
          </div>

          <!-- Вкладка с документами -->
          <div v-else-if="activeTab === 'documents'">
            <div v-if="application.documents?.length" class="space-y-4">
              <div 
                v-for="document in application.documents" 
                :key="document.id" 
                class="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 md:p-4 border rounded-lg hover:bg-gray-50"
              >
                <div class="flex items-center mb-3 sm:mb-0">
                  <div class="flex-shrink-0 mr-3">
                    <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-opacity-10" :class="getFileIconBgColor(document.file_name)">
                      <svg v-if="getFileType(document.file_name) === 'pdf'" class="h-6 w-6" :class="getFileIconColor(document.file_name)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        <text x="12" y="16" text-anchor="middle" font-size="7" font-weight="bold" fill="currentColor">PDF</text>
                      </svg>
                      <svg v-else-if="getFileType(document.file_name) === 'image'" class="h-6 w-6" :class="getFileIconColor(document.file_name)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <svg v-else-if="getFileType(document.file_name) === 'doc'" class="h-6 w-6" :class="getFileIconColor(document.file_name)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <svg v-else-if="getFileType(document.file_name) === 'sheet'" class="h-6 w-6" :class="getFileIconColor(document.file_name)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <svg v-else-if="getFileType(document.file_name) === 'archive'" class="h-6 w-6" :class="getFileIconColor(document.file_name)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      <svg v-else class="h-6 w-6" :class="getFileIconColor(document.file_name)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                    </div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h4 class="text-sm font-medium text-gray-900 truncate">{{ document.document_type?.name || 'Документ' }}</h4>
                    <div class="flex items-center mt-1">
                      <p class="text-xs text-gray-500 truncate mr-2 max-w-[180px] sm:max-w-[240px]">
                        {{ getFileName(document.file_name) }}
                      </p>
                      <span class="text-xs px-1.5 py-0.5 rounded" :class="getFileExtensionClass(document.file_name)">
                        {{ getFileExtension(document.file_name) }}
                      </span>
                      <span class="ml-2 text-xs text-gray-500 font-medium">
                        {{ formatFileSize(document.file_size) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-2 sm:ml-4">
                  <a 
                    :href="getDocumentUrl(document)" 
                    target="_blank" 
                    download
                    class="flex-1 sm:flex-none inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Скачать
                  </a>
                  <a 
                    :href="getDocumentUrl(document)" 
                    target="_blank" 
                    class="flex-1 sm:flex-none inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Просмотреть
                  </a>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <svg class="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <h3 class="text-gray-900 font-medium">Нет загруженных документов</h3>
              <p class="text-gray-500 mt-1">К этому заявлению еще не прикреплены документы</p>
            </div>
          </div>

          <!-- Вкладка с историей изменений -->
          <div v-else-if="activeTab === 'history'">
            <div class="relative">
              <div class="absolute top-0 bottom-0 left-3 w-0.5 bg-gray-200"></div>
              <div v-if="isHistoryLoading" class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
              <div v-else-if="applicationHistory.length" class="space-y-6 relative z-10">
                <div 
                  v-for="historyItem in sortedHistory" 
                  :key="historyItem.id" 
                  class="flex items-start"
                >
                  <div 
                    :class="[
                      'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1 -ml-3', 
                      getHistoryStatusColor(historyItem.status_id)
                    ]"
                  >
                    <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <div class="flex flex-col sm:flex-row sm:items-center">
                      <h4 class="text-sm font-medium text-gray-900">{{ getStatusText(historyItem.status_id) }}</h4>
                      <span class="sm:ml-2 text-xs text-gray-500">{{ formatDate(historyItem.created_at) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="flex justify-center py-12">
                <div class="text-center">
                  <svg class="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 class="text-gray-900 font-medium">История изменений пуста</h3>
                  <p class="text-gray-500 mt-1">Пока нет записей об изменении статуса заявления</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Вкладка с комментариями -->
          <div v-else-if="activeTab === 'comments'">
            <div v-if="sortedComments.length" class="space-y-4">
              <div 
                v-for="historyItem in sortedComments" 
                :key="historyItem.id" 
                class="rounded-lg border border-gray-200 p-4"
              >
                <div class="flex flex-col sm:flex-row">
                  <div class="flex items-start">
                    <div 
                      :class="[
                        'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3', 
                        getHistoryStatusColor(historyItem.status_id)
                      ]"
                    >
                      <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <div>
                      <div class="flex items-center mb-1">
                        <h4 class="text-sm font-medium text-gray-800">{{ getStatusText(historyItem.status_id) }}</h4>
                        <span class="mx-2 text-gray-300">•</span>
                        <span class="text-xs text-gray-500">{{ formatDate(historyItem.created_at) }}</span>
                      </div>
                      <p class="text-sm text-gray-600">{{ historyItem.comment }}</p>
                      <div v-if="historyItem.created_by_user" class="mt-2 text-xs text-gray-500">
                        Комментарий от: {{ historyItem.created_by_user.first_name }} {{ historyItem.created_by_user.last_name }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="flex justify-center py-12">
              <div class="text-center">
                <svg class="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <h3 class="text-gray-900 font-medium">Комментариев нет</h3>
                <p class="text-gray-500 mt-1">К этому заявлению пока не оставлено комментариев</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApplicationStore } from '@/stores/application';
import { supabase, applications } from '@/api/supabase';

const route = useRoute();
const router = useRouter();
const appStore = useApplicationStore();

const isLoading = ref(true);
const error = ref('');
const isSubmitting = ref(false);
const activeTab = ref('details');

// Получаем заявление из хранилища
const application = computed(() => appStore.currentApplication);

// История изменений статусов
const applicationHistory = ref([]);
const isHistoryLoading = ref(false);

// Добавляем computed свойства для сортировки истории и комментариев
const sortedHistory = computed(() => {
  return [...applicationHistory.value].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

const sortedComments = computed(() => {
  return [...applicationHistory.value]
    .filter(item => item.comment)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

// Загрузка данных при монтировании компонента
onMounted(async () => {
  const applicationId = route.params.id;
  if (!applicationId) {
    router.push('/dashboard/applications');
    return;
  }
  
  isLoading.value = true;
  try {
    // Загружаем данные заявления
    const success = await appStore.loadApplication(applicationId);
    if (!success) {
      error.value = appStore.error || 'Не удалось загрузить данные заявления';
    } else {
      // Загружаем историю изменений статуса
      await loadApplicationHistory(applicationId);
    }
  } catch (err) {
    console.error('Ошибка при загрузке заявления:', err);
    error.value = err.message || 'Произошла ошибка при загрузке заявления';
  } finally {
    isLoading.value = false;
  }
});

// Загрузка истории изменений статусов
async function loadApplicationHistory(applicationId) {
  isHistoryLoading.value = true;
  try {
    const { data, error: historyError } = await applications.getApplicationHistory(applicationId);
    
    if (historyError) {
      console.error('Ошибка при загрузке истории заявления:', historyError);
      return;
    }
    
    if (data && data.length > 0) {
      applicationHistory.value = data;
    } else {
      // Если истории нет, добавляем исходное создание заявки
      if (application.value) {
        applicationHistory.value = [{
          id: 'initial',
          status_id: application.value.status_id,
          created_at: application.value.created_at,
          application_id: application.value.id,
          comment: 'Заявление создано'
        }];
      }
    }
  } catch (err) {
    console.error('Ошибка при загрузке истории:', err);
  } finally {
    isHistoryLoading.value = false;
  }
}

// Отправка заявления на рассмотрение
async function submitApplication() {
  if (!application.value || application.value.status_id !== 'draft') return;
  
  isSubmitting.value = true;
  try {
    const result = await appStore.submitApplication(application.value.id);
    if (!result.success) {
      throw new Error(result.error || 'Не удалось отправить заявление');
    }
    
    // Обновляем историю после успешной отправки заявления
    await loadApplicationHistory(application.value.id);
  } catch (err) {
    console.error('Ошибка при отправке заявления:', err);
    error.value = err.message;
  } finally {
    isSubmitting.value = false;
  }
}

// Получение URL документа
function getDocumentUrl(document) {
  if (document.publicUrl) {
    return document.publicUrl;
  }
  
  try {
    // Проверяем наличие необходимых данных
    if (!document.file_path) {
      console.error('Отсутствует путь к файлу:', document);
      return '#';
    }
    
    // В новых версиях Supabase структура возвращаемых данных отличается
    // Правильное имя бакета может отличаться - проверьте в консоли Supabase
    const { data } = supabase.storage
      .from('application_documents') // Правильное имя бакета из Supabase
      .getPublicUrl(document.file_path);
    
    console.log('Получен URL файла:', data);
    
    return data?.publicUrl || '#';
  } catch (error) {
    console.error('Ошибка при получении URL файла:', error);
    return '#';
  }
}

// Форматирование размера файла
function formatFileSize(bytes) {
  if (!bytes) return '0 Байт';
  const k = 1024;
  const sizes = ['Байт', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Форматирование даты
function formatDate(dateString) {
  if (!dateString) return 'Не указана';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Получение текста для статуса заявления
function getStatusText(statusId) {
  const statusMap = {
    10: 'Подана',
    11: 'Принята',
    12: 'Отклонена'
  };
  return statusMap[statusId] || 'Неизвестный статус';
}

// Получение класса для отображения статуса
function getStatusClass(statusId) {
  const classMap = {
    10: 'bg-blue-100 text-blue-800',
    11: 'bg-green-100 text-green-800',
    12: 'bg-red-100 text-red-800'
  };
  return classMap[statusId] || 'bg-gray-100 text-gray-800';
}

// Получение цвета для истории изменений
function getHistoryStatusColor(statusId) {
  const colorMap = {
    10: 'bg-blue-500',
    11: 'bg-green-500',
    12: 'bg-red-500'
  };
  return colorMap[statusId] || 'bg-gray-500';
}

// Получение текста для формы обучения
function getStudyFormText(form) {
  const formMap = {
    'full-time': 'Очная',
    'part-time': 'Заочная',
    'distance': 'Дистанционная'
  };
  return formMap[form] || 'Не указана';
}

// Получение текста для типа финансирования
function getFundingFormText(form) {
  const formMap = {
    'budget': 'Бюджет',
    'contract': 'Контракт'
  };
  return formMap[form] || 'Не указан';
}

// Получение имени файла без расширения
function getFileName(filename) {
  if (!filename) return '';
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;
}

// Получение расширения файла
function getFileExtension(filename) {
  if (!filename) return '';
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.substring(lastDotIndex + 1).toUpperCase() : '';
}

// Получение типа файла на основе расширения
function getFileType(filename) {
  if (!filename) return 'other';
  
  const extension = getFileExtension(filename).toLowerCase();
  
  if (['pdf'].includes(extension)) {
    return 'pdf';
  } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
    return 'image';
  } else if (['doc', 'docx', 'rtf', 'txt'].includes(extension)) {
    return 'doc';
  } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
    return 'sheet';
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
    return 'archive';
  }
  
  return 'other';
}

// Получение цвета иконки в зависимости от типа файла
function getFileIconColor(filename) {
  const type = getFileType(filename);
  
  const colorMap = {
    'pdf': 'text-red-500',
    'image': 'text-blue-500',
    'doc': 'text-indigo-500',
    'sheet': 'text-green-500',
    'archive': 'text-amber-500',
    'other': 'text-gray-500'
  };
  
  return colorMap[type] || 'text-gray-500';
}

// Получение цвета фона для иконки в зависимости от типа файла
function getFileIconBgColor(filename) {
  const type = getFileType(filename);
  
  const bgColorMap = {
    'pdf': 'bg-red-500',
    'image': 'bg-blue-500',
    'doc': 'bg-indigo-500',
    'sheet': 'bg-green-500',
    'archive': 'bg-amber-500',
    'other': 'bg-gray-500'
  };
  
  return bgColorMap[type] || 'bg-gray-500';
}

// Получение класса для отображения расширения файла
function getFileExtensionClass(filename) {
  const type = getFileType(filename);
  
  const classMap = {
    'pdf': 'bg-red-100 text-red-800',
    'image': 'bg-blue-100 text-blue-800',
    'doc': 'bg-indigo-100 text-indigo-800',
    'sheet': 'bg-green-100 text-green-800',
    'archive': 'bg-amber-100 text-amber-800',
    'other': 'bg-gray-100 text-gray-800'
  };
  
  return classMap[type] || 'bg-gray-100 text-gray-800';
}
</script> 