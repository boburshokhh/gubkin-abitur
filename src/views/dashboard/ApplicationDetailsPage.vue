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
      <!-- Уведомление о комментариях админа -->
      <div v-if="sortedComments.length" class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
                     <div class="ml-3 flex-1">
             <h3 class="text-sm font-medium text-amber-800">
               У вас {{ sortedComments.length }} {{ sortedComments.length === 1 ? 'новый комментарий' : sortedComments.length < 5 ? 'новых комментария' : 'новых комментариев' }}
             </h3>
             <p class="mt-1 text-sm text-amber-700">
               <span v-if="latestComment">
                 Последний комментарий ({{ formatDate(latestComment.created_at) }}): 
                 <span class="font-medium">"{{ latestComment.comment.length > 100 ? latestComment.comment.substring(0, 100) + '...' : latestComment.comment }}"</span>
               </span>
               <span v-else>Приемная комиссия оставила комментарии к вашему заявлению.</span>
               <button 
                 @click="activeTab = 'comments'" 
                 class="font-medium underline hover:no-underline ml-2"
               >
                 Просмотреть все комментарии
               </button>
             </p>
           </div>
          <div class="ml-auto flex-shrink-0">
            <span class="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {{ sortedComments.length }}
            </span>
          </div>
        </div>
      </div>

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
              @click="activeTab = 'personal'"
              :class="[
                'py-3 md:py-4 px-4 md:px-6 text-center font-medium text-xs sm:text-sm border-b-2 focus:outline-none whitespace-nowrap',
                activeTab === 'personal' 
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Личные данные
              </span>
            </button>
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
                Заявление и профили
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
                <span v-if="allDocuments.length" class="ml-1 sm:ml-2 bg-gray-100 text-gray-800 py-0.5 px-2 rounded-full text-xs">
                  {{ allDocuments.length }}
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
                'py-3 md:py-4 px-4 md:px-6 text-center font-medium text-xs sm:text-sm border-b-2 focus:outline-none whitespace-nowrap relative',
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
                <span v-if="sortedComments.length" class="ml-1 sm:ml-2 bg-orange-100 text-orange-800 py-0.5 px-2 rounded-full text-xs">
                  {{ sortedComments.length }}
                </span>
              </span>
              <!-- Индикатор новых комментариев -->
              <span v-if="sortedComments.length && activeTab !== 'comments'" class="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
            </button>
          </nav>
        </div>
        
        <!-- Содержимое вкладок -->
        <div class="p-4 md:p-6">
          <!-- Вкладка с личными данными -->
          <div v-if="activeTab === 'personal'">
            <!-- Личная информация -->
            <div class="mb-8">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Личная информация
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Фамилия</h4>
                  <p class="text-gray-900">{{ application.last_name || application.users?.last_name || 'Не указана' }}</p>
                </div>
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Имя</h4>
                  <p class="text-gray-900">{{ application.first_name || application.users?.first_name || 'Не указано' }}</p>
                </div>
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Отчество</h4>
                  <p class="text-gray-900">{{ application.middle_name || application.users?.middle_name || 'Не указано' }}</p>
                </div>
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Дата рождения</h4>
                  <p class="text-gray-900">{{ formatDate(application.birth_date || application.users?.birth_date) }}</p>
                </div>
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Пол</h4>
                  <p class="text-gray-900">{{ getGenderText(application.gender || application.users?.gender) }}</p>
                </div>
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Регион</h4>
                  <p class="text-gray-900">{{ application.regions?.name || application.users?.regions?.name || 'Не указан' }}</p>
                </div>
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Телефон</h4>
                  <p class="text-gray-900">{{ application.phone || application.users?.phone || 'Не указан' }}</p>
                </div>
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Телефон родителей</h4>
                  <p class="text-gray-900">{{ application.parent_phone || 'Не указан' }}</p>
                </div>
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Email</h4>
                  <p class="text-gray-900">{{ application.email || application.users?.email || 'Не указан' }}</p>
                </div>
              </div>
            </div>

            <!-- Паспортные данные -->
            <div class="mb-8">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Паспортные данные
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Серия и номер</h4>
                  <p class="text-gray-900">{{ application.passport_series || 'Не указан' }}</p>
                </div>
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Дата выдачи</h4>
                  <p class="text-gray-900">{{ formatDate(application.passport_issue_date) }}</p>
                </div>
                <div class="sm:col-span-2 lg:col-span-1">
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Кем выдан</h4>
                  <p class="text-gray-900">{{ application.passport_issued_by || 'Не указан' }}</p>
                </div>
              </div>
            </div>

            <!-- Данные об образовании -->
            <div class="mb-8">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Образование
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Уровень образования</h4>
                  <p class="text-gray-900">{{ getEducationLevelText(application.education_level) }}</p>
                </div>
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Учебное заведение</h4>
                  <p class="text-gray-900">{{ application.education_institution || 'Не указано' }}</p>
                </div>
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Год окончания</h4>
                  <p class="text-gray-900">{{ application.education_graduation_year || 'Не указан' }}</p>
                </div>
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Номер документа</h4>
                  <p class="text-gray-900">{{ application.education_document_number || application.document_number || 'Не указан' }}</p>
                </div>
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Дата выдачи документа</h4>
                  <p class="text-gray-900">{{ formatDate(application.education_document_date || application.document_date) }}</p>
                </div>
              </div>
            </div>

            <!-- Дополнительная информация -->
            <div class="mb-8">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Дополнительная информация
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Участник олимпиад</h4>
                  <p class="text-gray-900">{{ application.olympiad_participant ? 'Да' : 'Нет' }}</p>
                </div>
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Нуждается в общежитии</h4>
                  <p class="text-gray-900">{{ application.accommodation_needed ? 'Да' : 'Нет' }}</p>
                </div>
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Учебный год</h4>
                  <p class="text-gray-900">{{ application.academic_year || new Date().getFullYear() }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Вкладка с основными данными заявления -->
          <div v-else-if="activeTab === 'details'">
            <!-- Основная информация о заявлении -->
            <div class="mb-8">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Информация о заявлении
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Номер заявления</h4>
                  <p class="text-gray-900">{{ application.id }}</p>
                </div>
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Дата подачи</h4>
                  <p class="text-gray-900">{{ formatDate(application.created_at) }}</p>
                </div>
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Последнее обновление</h4>
                  <p class="text-gray-900">{{ formatDate(application.updated_at) }}</p>
                </div>
                <div>
                  <h4 class="text-gray-500 text-sm font-medium mb-1">Статус заявления</h4>
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
            </div>

            <!-- Выбранные направления и профили -->
            <div class="mb-8">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Выбранные направления и профили
                <span v-if="application.application_choices?.length" class="ml-2 bg-gray-100 text-gray-800 py-0.5 px-2 rounded-full text-xs">
                  {{ application.application_choices.length }}
                </span>
              </h3>
              <div v-if="application.application_choices?.length" class="space-y-4">
                <div 
                  v-for="(choice, index) in sortedChoices" 
                  :key="choice.id" 
                  class="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center mb-2">
                        <span class="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                          Приоритет {{ choice.priority }}
                        </span>
                      </div>
                      <h4 class="text-lg font-medium text-gray-900 mb-1">
                        {{ choice.profiles?.name || 'Название профиля не указано' }}
                      </h4>
                      <p class="text-sm text-gray-600 mb-2">
                        <span class="font-medium">Направление:</span> 
                        {{ choice.profiles?.directions?.name || 'Не указано' }}
                        <span v-if="choice.profiles?.directions?.code" class="text-gray-500 ml-1">
                          ({{ choice.profiles?.directions?.code }})
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <svg class="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h4 class="text-gray-900 font-medium">Направления не выбраны</h4>
                <p class="text-gray-500 mt-1">К этому заявлению не прикреплены выборы направлений</p>
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
            <div v-if="allDocuments.length" class="space-y-6">
              <!-- Основные документы -->
              <div v-if="application.documents?.length" class="mb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Документы
                  <span class="ml-2 bg-gray-100 text-gray-800 py-0.5 px-2 rounded-full text-xs">
                    {{ application.documents.length }}
                  </span>
                </h3>
                <div class="space-y-3">
                  <div 
                    v-for="document in application.documents" 
                    :key="`doc-${document.id}`" 
                    class="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 md:p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div class="flex items-center mb-3 sm:mb-0">
                      <div class="flex-shrink-0 mr-3">
                        <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-opacity-10" :class="getFileIconBgColor(document.file_name)">
                          <svg v-if="getFileType(document.file_name) === 'pdf'" class="h-6 w-6" :class="getFileIconColor(document.file_name)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <svg v-else-if="getFileType(document.file_name) === 'image'" class="h-6 w-6" :class="getFileIconColor(document.file_name)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
              </div>

              <!-- Файлы приложений -->
              <div v-if="application.application_files?.length" class="mb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Дополнительные файлы
                  <span class="ml-2 bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full text-xs">
                    {{ application.application_files.length }}
                  </span>
                </h3>
                <div class="space-y-3">
                  <div 
                    v-for="file in application.application_files" 
                    :key="`file-${file.id}`" 
                    class="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 md:p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div class="flex items-center mb-3 sm:mb-0">
                      <div class="flex-shrink-0 mr-3">
                        <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-opacity-10" :class="getFileIconBgColor(file.file_name)">
                          <svg v-if="getFileType(file.file_name) === 'image'" class="h-6 w-6" :class="getFileIconColor(file.file_name)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <svg v-else class="h-6 w-6" :class="getFileIconColor(file.file_name)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div class="min-w-0 flex-1">
                        <h4 class="text-sm font-medium text-gray-900 truncate">{{ getFileDisplayName(file) }}</h4>
                        <div class="flex items-center mt-1">
                          <p class="text-xs text-gray-500 truncate mr-2 max-w-[180px] sm:max-w-[240px]">
                            {{ getFileName(file.file_name) }}
                          </p>
                          <span class="text-xs px-1.5 py-0.5 rounded" :class="getFileExtensionClass(file.file_name)">
                            {{ getFileExtension(file.file_name) }}
                          </span>
                          <span class="ml-2 text-xs text-gray-500 font-medium">
                            {{ formatFileSize(file.file_size) }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2 sm:ml-4">
                      <a 
                        :href="getApplicationFileUrl(file)" 
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
                        :href="getApplicationFileUrl(file)" 
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
              </div>

              <!-- Сертификаты олимпиад -->
              <div v-if="application.olympiad_certificates?.length" class="mb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Сертификаты олимпиад
                  <span class="ml-2 bg-amber-100 text-amber-800 py-0.5 px-2 rounded-full text-xs">
                    {{ application.olympiad_certificates.length }}
                  </span>
                </h3>
                <div class="space-y-3">
                  <div 
                    v-for="cert in application.olympiad_certificates" 
                    :key="`cert-${cert.id}`" 
                    class="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 md:p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div class="flex items-center mb-3 sm:mb-0">
                      <div class="flex-shrink-0 mr-3">
                        <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-amber-100">
                          <svg class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                      </div>
                      <div class="min-w-0 flex-1">
                        <h4 class="text-sm font-medium text-gray-900 truncate">{{ cert.name || 'Сертификат олимпиады' }}</h4>
                        <div class="flex items-center mt-1">
                          <p class="text-xs text-gray-500 truncate mr-2 max-w-[180px] sm:max-w-[240px]">
                            {{ getFileName(cert.file_name) }}
                          </p>
                          <span class="text-xs px-1.5 py-0.5 rounded" :class="getFileExtensionClass(cert.file_name)">
                            {{ getFileExtension(cert.file_name) }}
                          </span>
                          <span class="ml-2 text-xs text-gray-500 font-medium">
                            {{ formatFileSize(cert.file_size) }}
                          </span>
                          <span v-if="cert.year" class="ml-2 text-xs text-gray-500">
                            {{ cert.year }} год
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2 sm:ml-4">
                      <a 
                        :href="getOlympiadCertificateUrl(cert)" 
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
                        :href="getOlympiadCertificateUrl(cert)" 
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
                class="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors duration-200"
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
const activeTab = ref('personal');

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
    .filter(item => item.comment && item.comment.trim() !== '')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

// Computed для получения последнего комментария
const latestComment = computed(() => {
  return sortedComments.value.length > 0 ? sortedComments.value[0] : null;
});

// Добавляем computed для сортировки выборов направлений
const sortedChoices = computed(() => {
  if (!application.value?.application_choices) return [];
  return [...application.value.application_choices].sort((a, b) => a.priority - b.priority);
});

// Computed для объединения всех документов
const allDocuments = computed(() => {
  const docs = [];
  
  // Основные документы
  if (application.value?.documents?.length) {
    docs.push(...application.value.documents);
  }
  
  // Файлы приложений
  if (application.value?.application_files?.length) {
    docs.push(...application.value.application_files);
  }
  
  // Сертификаты олимпиад
  if (application.value?.olympiad_certificates?.length) {
    docs.push(...application.value.olympiad_certificates);
  }
  
  return docs;
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
    // Используем новую функцию get_application_details, которая уже включает историю
    const { data, error: detailsError } = await applications.getById(applicationId);
    
    if (detailsError) {
      console.error('Ошибка при загрузке деталей заявления:', detailsError);
      return;
    }
    
    if (data && data.application_history && data.application_history.length > 0) {
      applicationHistory.value = data.application_history;
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
  try {
    if (!document.file_path) {
      console.error('Отсутствует путь к файлу:', document);
      return '#';
    }
    
    const { data } = supabase.storage
      .from('application_documents')
      .getPublicUrl(document.file_path);
    
    return data?.publicUrl || '#';
  } catch (error) {
    console.error('Ошибка при получении URL документа:', error);
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

// Получение текста для пола
function getGenderText(gender) {
  const genderMap = {
    'male': 'Мужской',
    'female': 'Женский'
  };
  return genderMap[gender] || 'Не указан';
}

// Получение текста для уровня образования
function getEducationLevelText(level) {
  const levelMap = {
    'high-school': 'Среднее общее',
    'vocational': 'Среднее профессиональное',
    'bachelor': 'Высшее (бакалавриат)',
    'master': 'Высшее (магистратура)',
    'specialist': 'Высшее (специалитет)'
  };
  return levelMap[level] || 'Не указан';
}

// Функции для работы с разными типами файлов
function getApplicationFileUrl(file) {
  try {
    if (!file.file_path) {
      console.error('Отсутствует путь к файлу приложения:', file);
      return '#';
    }
    
    const { data } = supabase.storage
      .from('application_files')
      .getPublicUrl(file.file_path);
    
    return data?.publicUrl || '#';
  } catch (error) {
    console.error('Ошибка при получении URL файла приложения:', error);
    return '#';
  }
}

function getOlympiadCertificateUrl(cert) {
  try {
    if (!cert.file_path) {
      console.error('Отсутствует путь к файлу сертификата:', cert);
      return '#';
    }
    
    // Согласно коду из supabase.js, сертификаты хранятся в application_files bucket
    const { data } = supabase.storage
      .from('application_files')
      .getPublicUrl(cert.file_path);
    
    return data?.publicUrl || '#';
  } catch (error) {
    console.error('Ошибка при получении URL сертификата олимпиады:', error);
    return '#';
  }
}

function getFileDisplayName(file) {
  // Определяем тип файла по названию или категории
  if (file.file_category === 'photo' || (file.file_path && file.file_path.includes('photo'))) {
    return 'Фотография 3×4';
  } else if (file.file_category === 'education_scan' || (file.file_path && file.file_path.includes('education'))) {
    return 'Документ об образовании';
  } else if (file.file_category === 'passport_scan' || (file.file_path && file.file_path.includes('passport') && !file.file_path.includes('translation'))) {
    return 'Паспорт';
  } else if (file.file_category === 'passport_translation' || (file.file_path && file.file_path.includes('passport') && file.file_path.includes('translation'))) {
    return 'Нотариально заверенный перевод паспорта';
  } else if (file.file_path && file.file_path.includes('additional')) {
    return 'Дополнительный документ';
  }
  return file.file_name || 'Файл';
}
</script> 