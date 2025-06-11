<template>
  <div v-if="show" class="fixed inset-0 overflow-y-auto z-[100]">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>
      
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      
      <div 
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        <div class="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900" id="modal-headline">
            Заявка №{{ application?.id?.substring(0, 8) }}
          </h3>
          <button 
            @click="close" 
            type="button" 
            class="text-gray-400 hover:text-gray-500"
          >
            <span class="sr-only">Закрыть</span>
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
          <!-- Индикатор загрузки -->
          <div v-if="isUpdating && !application" class="flex justify-center items-center py-10">
            <svg class="animate-spin h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="ml-3 text-gray-600">Загрузка данных заявки...</span>
          </div>
          
          <div v-else class="space-y-6">
            
            <!-- Личные данные -->
            <div class="px-4 py-5 bg-gray-50 rounded-lg">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Личные данные</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <span class="text-sm text-gray-500">Ф.И.О.:</span>
                  <p>{{ getUserFullName(application?.users) }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Дата рождения:</span>
                  <p>{{ formatDate(application?.users?.birth_date) }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Регион:</span>
                  <p>{{ getRegionName() }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Контактный телефон:</span>
                  <p>{{ application?.users?.phone || 'Не указан' }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Телефон родителя:</span>
                  <p>{{ application?.parent_phone || 'Не указан' }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Email:</span>
                  <p>{{ application?.users?.email || 'Не указан' }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Пол:</span>
                  <p>{{ application?.users?.gender === 'male' ? 'Мужской' : application?.users?.gender === 'female' ? 'Женский' : 'Не указан' }}</p>
                </div>
                <div v-if="application?.accommodation_needed">
                  <span class="text-sm text-gray-500">Нуждается в общежитии:</span>
                  <p>Да</p>
                </div>
              </div>
            </div>
            
            <!-- Паспортные данные -->
            <div class="px-4 py-5 bg-gray-50 rounded-lg">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Паспортные данные</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <span class="text-sm text-gray-500">Серия и номер:</span>
                  <p>{{ application?.passport_series || 'Не указано' }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Дата выдачи:</span>
                  <p>{{ formatDate(application?.passport_issue_date) }}</p>
                </div>
                <div class="md:col-span-2">
                  <span class="text-sm text-gray-500">Кем выдан:</span>
                  <p>{{ application?.passport_issued_by || 'Не указано' }}</p>
                </div>
              </div>
            </div>
            
            <!-- Образование -->
            <div class="px-4 py-5 bg-gray-50 rounded-lg">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Образование</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <span class="text-sm text-gray-500">Уровень образования:</span>
                  <p>{{ getEducationLevelName(application?.education_level) }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Учебное заведение:</span>
                  <p>{{ application?.education_institution || 'Не указано' }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Год окончания:</span>
                  <p>{{ application?.education_graduation_year || 'Не указан' }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Документ об образовании:</span>
                  <p>{{ application?.education_document_number || application?.document_number || 'Не указан' }} {{ application?.education_document_date || application?.document_date ? `от ${formatDate(application.education_document_date || application.document_date)}` : '' }}</p>
                </div>
              </div>
            </div>
            
            <!-- Выбранные образовательные программы -->
            <div class="px-4 py-5 bg-gray-50 rounded-lg">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Выбранные образовательные программы</h3>
              
              <div v-if="application?.application_choices && application.application_choices.length > 0" class="space-y-4">
                <div v-for="(choice, index) in application.application_choices" :key="index" class="p-3 border rounded border-gray-200">
                  <div class="font-medium">Приоритет {{ choice.priority }}</div>
                  <div class="text-sm mt-1">
                    <div class="flex gap-2">
                      <span class="text-gray-500">Профиль:</span>
                      <span>{{ getProfileFullName(choice) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-sm text-gray-500">
                Образовательные программы не выбраны
              </div>
            </div>

            <!-- Статус заявки -->
            <div class="px-4 py-5 bg-gray-50 rounded-lg">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Информация о заявке</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <span class="text-sm text-gray-500">Статус:</span>
                  <div class="mt-1">
                    <span 
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getStatusClass(application?.status_id)"
                    >
                      {{ getStatusName(application?.status_id) }}
                    </span>
                  </div>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Дата подачи:</span>
                  <p>{{ formatDate(application?.created_at) }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Форма обучения:</span>
                  <p>{{ getStudyFormText(application?.study_form) }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Форма финансирования:</span>
                  <p>{{ getFundingFormText(application?.funding_form) }}</p>
                </div>
                <div v-if="application?.admin_comment" class="md:col-span-2">
                  <span class="text-sm text-gray-500">Комментарий администратора:</span>
                  <p class="mt-1 text-sm bg-yellow-50 p-2 rounded">{{ application.admin_comment }}</p>
                </div>
              </div>
            </div>

            <!-- Участие в олимпиаде -->
            <div v-if="application?.olympiad_participant" class="px-4 py-5 bg-gray-50 rounded-lg">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Участие в олимпиаде</h3>
              <div class="text-sm">
                <p class="text-green-700 font-medium">Участвовал(а) в олимпиаде Университета Губкина</p>
                <p class="text-xs text-gray-500 mt-1">
                  Победители, призёры и участники 1-Губкинской предметной Олимпиады прилагают цветную копию диплома/сертификата
                </p>
              </div>
            </div>
            
            <!-- Загруженные документы -->
            <div class="px-4 py-5 bg-gray-50 rounded-lg">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Загруженные документы и файлы</h3>
              
              <!-- Блок 1: Обязательные документы -->
              <div class="mb-6">
                <h4 class="text-md font-medium text-gray-700 mb-3 flex items-center">
                  <span class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold mr-2">ОБЯЗАТЕЛЬНЫЕ</span>
                  Основные документы
                </h4>
                
                <!-- Скан паспорта -->
                <div class="mb-3">
                  <h5 class="text-sm font-medium text-gray-600 mb-2">📄 Скан паспорта (первая страница)</h5>
                  <div v-if="getFilesByCategory('passport_scan').length > 0" class="border rounded-md divide-y">
                    <div v-for="(file, index) in getFilesByCategory('passport_scan')" :key="index" class="px-4 py-3 flex justify-between items-center bg-white">
                      <div class="flex items-center space-x-2">
                        <DocumentTextIcon class="h-5 w-5 text-blue-500" />
                        <div>
                          <span class="text-sm font-medium text-gray-700">{{ file.file_name || 'passport_scan.pdf' }}</span>
                          <div class="text-xs text-gray-500 mt-1">
                            {{ formatFileSize(file.file_size) }} • {{ formatDate(file.created_at) }}
                            <div class="mt-0.5 text-xs text-gray-400">Категория: {{ getFileCategoryName(file.file_category) }}</div>
                          </div>
                        </div>
                      </div>
                      <div class="flex space-x-2">
                        <button @click="viewApplicationFile(file)" class="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100" title="Просмотреть">
                          <EyeIcon class="h-4 w-4" />
                        </button>
                        <button @click="downloadApplicationFile(file)" class="text-xs px-2 py-1 rounded bg-gray-50 text-gray-600 hover:bg-gray-100" title="Скачать">
                          <ArrowDownTrayIcon class="h-4 w-4" />
                        </button>
                        <!-- Прямые ссылки для скачивания и просмотра -->
                        <!-- <a 
                          :href="getApplicationFileUrl(file)" 
                          target="_blank" 
                          download
                          class="text-xs px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100 inline-flex items-center" 
                          title="Прямое скачивание"
                        >
                          <ArrowDownTrayIcon class="h-4 w-4" />
                        </a>
                        <a 
                          :href="getApplicationFileUrl(file)" 
                          target="_blank" 
                          class="text-xs px-2 py-1 rounded bg-purple-50 text-purple-600 hover:bg-purple-100 inline-flex items-center" 
                          title="Прямое открытие"
                        >
                          <EyeIcon class="h-4 w-4" />
                        </a> -->
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-xs text-red-500 italic">❌ Скан паспорта не загружен</div>
                </div>

                <!-- Фотография 3x4 -->
                <div class="mb-3">
                  <h5 class="text-sm font-medium text-gray-600 mb-2">📷 Фотография 3x4 см</h5>
                  <div v-if="getFilesByCategory('photo').length > 0" class="border rounded-md divide-y">
                    <div v-for="(file, index) in getFilesByCategory('photo')" :key="index" class="px-4 py-3 flex justify-between items-center bg-white">
                      <div class="flex items-center space-x-2">
                        <PhotoIcon class="h-5 w-5 text-green-500" />
                        <div>
                          <span class="text-sm font-medium text-gray-700">{{ file.file_name || 'photo.jpg' }}</span>
                          <div class="text-xs text-gray-500 mt-1">
                            {{ formatFileSize(file.file_size) }} • {{ formatDate(file.created_at) }}
                            <div class="mt-0.5 text-xs text-gray-400">Категория: {{ getFileCategoryName(file.file_category) }}</div>
                          </div>
                        </div>
                      </div>
                      <div class="flex space-x-2">
                        <button @click="viewApplicationFile(file)" class="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100" title="Просмотреть">
                          <EyeIcon class="h-4 w-4" />
                        </button>
                        <button @click="downloadApplicationFile(file)" class="text-xs px-2 py-1 rounded bg-gray-50 text-gray-600 hover:bg-gray-100" title="Скачать">
                          <ArrowDownTrayIcon class="h-4 w-4" />
                        </button>
                        <!-- Прямые ссылки для скачивания и просмотра -->
                        <!-- <a 
                          :href="getApplicationFileUrl(file)" 
                          target="_blank" 
                          download
                          class="text-xs px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100 inline-flex items-center" 
                          title="Прямое скачивание"
                        >
                          <ArrowDownTrayIcon class="h-4 w-4" />
                        </a>
                        <a 
                          :href="getApplicationFileUrl(file)" 
                          target="_blank" 
                          class="text-xs px-2 py-1 rounded bg-purple-50 text-purple-600 hover:bg-purple-100 inline-flex items-center" 
                          title="Прямое открытие"
                        >
                          <EyeIcon class="h-4 w-4" />
                        </a> -->
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-xs text-red-500 italic">❌ Фотография не загружена</div>
                </div>

                <!-- Скан документа об образовании -->
                <div class="mb-3">
                  <h5 class="text-sm font-medium text-gray-600 mb-2">🎓 Скан документа об образовании</h5>
                  <div v-if="getFilesByCategory('education_scan').length > 0" class="border rounded-md divide-y">
                    <div v-for="(file, index) in getFilesByCategory('education_scan')" :key="index" class="px-4 py-3 flex justify-between items-center bg-white">
                      <div class="flex items-center space-x-2">
                        <DocumentTextIcon class="h-5 w-5 text-purple-500" />
                        <div>
                          <span class="text-sm font-medium text-gray-700">{{ file.file_name || 'education_document.pdf' }}</span>
                          <div class="text-xs text-gray-500 mt-1">
                            {{ formatFileSize(file.file_size) }} • {{ formatDate(file.created_at) }}
                            <div class="mt-0.5 text-xs text-gray-400">Категория: {{ getFileCategoryName(file.file_category) }}</div>
                          </div>
                        </div>
                      </div>
                      <div class="flex space-x-2">
                        <button @click="viewApplicationFile(file)" class="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100" title="Просмотреть">
                          <EyeIcon class="h-4 w-4" />
                        </button>
                        <button @click="downloadApplicationFile(file)" class="text-xs px-2 py-1 rounded bg-gray-50 text-gray-600 hover:bg-gray-100" title="Скачать">
                          <ArrowDownTrayIcon class="h-4 w-4" />
                        </button>
                        <!-- Прямые ссылки для скачивания и просмотра -->
                        <!-- <a 
                          :href="getApplicationFileUrl(file)" 
                          target="_blank" 
                          download
                          class="text-xs px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100 inline-flex items-center" 
                          title="Прямое скачивание"
                        >
                          <ArrowDownTrayIcon class="h-4 w-4" />
                        </a>
                        <a 
                          :href="getApplicationFileUrl(file)" 
                          target="_blank" 
                          class="text-xs px-2 py-1 rounded bg-purple-50 text-purple-600 hover:bg-purple-100 inline-flex items-center" 
                          title="Прямое открытие"
                        >
                          <EyeIcon class="h-4 w-4" />
                        </a> -->
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-xs text-red-500 italic">❌ Скан документа об образовании не загружен</div>
                </div>
              </div>

              <!-- Блок 2: Дополнительные документы (из таблицы documents) -->
              <div v-if="application?.documents && application.documents.length > 0" class="mb-4">
                <h4 class="text-md font-medium text-gray-700 mb-3 flex items-center">
                  <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold mr-2">ДОПОЛНИТЕЛЬНЫЕ</span>
                  Официальные документы
                </h4>
                <div class="border rounded-md divide-y">
                  <div v-for="(doc, index) in application.documents" :key="index" class="px-4 py-3 flex justify-between items-center bg-blue-50">
                    <div class="flex items-center space-x-2">
                      <DocumentTextIcon class="h-5 w-5 text-blue-600" />
                      <div>
                        <span class="text-sm font-medium text-gray-700">{{ doc.document_types?.description || doc.document_types?.name || `Документ ${index + 1}` }}</span>
                        <div class="text-xs text-gray-500 mt-1">
                          {{ doc.file_name || 'Без названия' }} • {{ formatFileSize(doc.file_size) }}
                          <div class="mt-0.5 text-xs text-gray-400">ID: {{ doc.id.substring(0, 8) }} • Загружен: {{ formatDate(doc.created_at) }}</div>
                          <div class="mt-0.5 text-xs" :class="{'text-green-600': doc.status === 'approved', 'text-yellow-600': doc.status === 'pending', 'text-red-600': doc.status === 'rejected'}">
                            Статус: {{ getDocumentStatus(doc.status) }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="flex space-x-2">
                      <button @click="viewDocument(doc)" class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200" title="Просмотреть">
                        <EyeIcon class="h-4 w-4" />
                      </button>
                      <button @click="downloadDocument(doc)" class="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" title="Скачать">
                        <ArrowDownTrayIcon class="h-4 w-4" />
                      </button>
                      <!-- Прямые ссылки для скачивания и просмотра -->
                      <!-- <a 
                        :href="getDocumentUrl(doc)" 
                        target="_blank" 
                        download
                        class="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 inline-flex items-center" 
                        title="Прямое скачивание"
                      >
                        <ArrowDownTrayIcon class="h-4 w-4" />
                      </a>
                      <a 
                        :href="getDocumentUrl(doc)" 
                        target="_blank" 
                        class="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 inline-flex items-center" 
                        title="Прямое открытие"
                      >
                        <EyeIcon class="h-4 w-4" />
                      </a> -->
                    </div>
                  </div>
                </div>
              </div>

              <!-- Блок 3: Другие файлы -->
              <div v-if="getFilesByCategory('general').length > 0" class="mb-4">
                <h4 class="text-md font-medium text-gray-700 mb-3 flex items-center">
                  <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold mr-2">ПРОЧИЕ</span>
                  Дополнительные файлы
                </h4>
                <div class="border rounded-md divide-y">
                  <div v-for="(file, index) in getFilesByCategory('general')" :key="index" class="px-4 py-3 flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                      <PhotoIcon v-if="file.is_image" class="h-5 w-5 text-gray-500" />
                      <DocumentTextIcon v-else class="h-5 w-5 text-gray-500" />
                      <div>
                        <span class="text-sm font-medium text-gray-700">{{ file.file_name || 'Файл' }}</span>
                        <div class="text-xs text-gray-500 mt-1">
                          {{ formatFileSize(file.file_size) }} • {{ formatDate(file.created_at) }}
                          <div class="mt-0.5 text-xs text-gray-400">Тип: {{ file.is_image ? 'Изображение' : 'Документ' }}</div>
                        </div>
                      </div>
                    </div>
                    <div class="flex space-x-2">
                      <button @click="viewApplicationFile(file)" class="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100" title="Просмотреть">
                        <EyeIcon class="h-4 w-4" />
                      </button>
                      <button @click="downloadApplicationFile(file)" class="text-xs px-2 py-1 rounded bg-gray-50 text-gray-600 hover:bg-gray-100" title="Скачать">
                        <ArrowDownTrayIcon class="h-4 w-4" />
                      </button>
                      <!-- Прямые ссылки для скачивания и просмотра -->
                      <!-- <a 
                        :href="getApplicationFileUrl(file)" 
                        target="_blank" 
                        download
                        class="text-xs px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100 inline-flex items-center" 
                        title="Прямое скачивание"
                      >
                        <ArrowDownTrayIcon class="h-4 w-4" />
                      </a>
                      <a 
                        :href="getApplicationFileUrl(file)" 
                        target="_blank" 
                        class="text-xs px-2 py-1 rounded bg-purple-50 text-purple-600 hover:bg-purple-100 inline-flex items-center" 
                        title="Прямое открытие"
                      >
                        <EyeIcon class="h-4 w-4" />
                      </a> -->
                    </div>
                  </div>
                </div>
              </div>

              <!-- Блок 4: Сертификаты олимпиад -->
              <div v-if="application?.olympiad_certificates && application.olympiad_certificates.length > 0" class="mb-4">
                <h4 class="text-md font-medium text-gray-700 mb-3 flex items-center">
                  <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold mr-2">ОЛИМПИАДЫ</span>
                  Сертификаты олимпиад
                </h4>
                <div class="border rounded-md divide-y">
                  <div v-for="(cert, index) in application.olympiad_certificates" :key="index" class="px-4 py-3 flex justify-between items-center bg-yellow-50">
                    <div class="flex items-center space-x-2">
                      <AcademicCapIcon class="h-5 w-5 text-yellow-600" />
                      <div>
                        <span class="text-sm font-medium text-gray-700">{{ cert.file_name || cert.name || 'Сертификат олимпиады' }}</span>
                        <div class="text-xs text-gray-500 mt-1">
                          {{ cert.year ? `Год: ${cert.year}` : '' }} • {{ formatDate(cert.created_at) }}
                        </div>
                      </div>
                    </div>
                    <div class="flex space-x-2">
                      <button @click="viewOlympiadCertificate(cert)" class="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200" title="Просмотреть">
                        <EyeIcon class="h-4 w-4" />
                      </button>
                      <!-- Прямые ссылки для скачивания и просмотра -->
                       <a 
                        :href="getOlympiadCertificateUrl(cert)" 
                        target="_blank" 
                        download
                        class="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 inline-flex items-center" 
                        title="Прямое скачивание"
                      >
                        <ArrowDownTrayIcon class="h-4 w-4" />
                      </a>
                     <!-- <a 
                        :href="getOlympiadCertificateUrl(cert)" 
                        target="_blank" 
                        class="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 inline-flex items-center" 
                        title="Прямое открытие"
                      >
                        <EyeIcon class="h-4 w-4" />
                      </a> -->
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Сводка по обязательным документам -->
              <div class="mt-4 p-3 bg-white border-l-4 border-gray-300 rounded">
                <h5 class="text-sm font-medium text-gray-700 mb-2">📊 Статус обязательных документов:</h5>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div class="flex items-center space-x-1">
                    <span class="w-2 h-2 rounded-full" :class="getFilesByCategory('passport_scan').length > 0 ? 'bg-green-500' : 'bg-red-500'"></span>
                    <span>Скан паспорта: {{ getFilesByCategory('passport_scan').length > 0 ? '✅ Загружен' : '❌ Отсутствует' }}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <span class="w-2 h-2 rounded-full" :class="getFilesByCategory('photo').length > 0 ? 'bg-green-500' : 'bg-red-500'"></span>
                    <span>Фотография: {{ getFilesByCategory('photo').length > 0 ? '✅ Загружена' : '❌ Отсутствует' }}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <span class="w-2 h-2 rounded-full" :class="getFilesByCategory('education_scan').length > 0 ? 'bg-green-500' : 'bg-red-500'"></span>
                    <span>Документ об образовании: {{ getFilesByCategory('education_scan').length > 0 ? '✅ Загружен' : '❌ Отсутствует' }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Сообщение если нет документов -->
              <div v-if="(!application?.documents || application.documents.length === 0) && 
                         (!application?.application_files || application.application_files.length === 0) && 
                         (!application?.olympiad_certificates || application.olympiad_certificates.length === 0)" 
                   class="text-sm text-gray-500 italic text-center py-4">
                ❌ Нет загруженных документов и файлов
              </div>
            </div>
            
            <!-- Управление статусом (только для администраторов) -->
            <div class="px-4 py-5 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Обновление статуса</h3>
                <div class="space-y-4">
                  <div>
                    <label for="status" class="block text-sm font-medium text-gray-700">Изменить статус</label>
                    <select 
                      id="status" 
                      v-model="newStatus" 
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option v-for="status in statuses" :key="status.id" :value="status.id">{{ status.name }}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label for="comment" class="block text-sm font-medium text-gray-700">Комментарий</label>
                    <textarea 
                      id="comment" 
                      v-model="comment" 
                      rows="3" 
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Добавьте комментарий к изменению статуса..."
                    ></textarea>
                </div>
              </div>
            </div>
            
          </div>
        </div>
        
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button 
            @click="updateStatus"
            type="button"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
            :disabled="isUpdating || newStatus === application?.status_id"
          >
            <svg v-if="isUpdating" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isUpdating ? 'Обновление...' : 'Обновить статус' }}
          </button>
          <button 
            @click="close"
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </div>
  
  
  <!-- Модальное окно для просмотра документа -->
  <div v-if="showDocumentModal" class="fixed inset-0 overflow-y-auto z-[200]">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>
      
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      
      <div 
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
        role="dialog"
        aria-modal="true"
      >
        <div class="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            {{ selectedDocument?.document_types?.name || selectedDocument?.name || 'Просмотр документа' }}
          </h3>
          <button 
            @click="closeDocumentModal" 
            type="button" 
            class="text-gray-400 hover:text-gray-500"
          >
            <span class="sr-only">Закрыть</span>
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="bg-white p-6 max-h-[80vh] overflow-auto">
          <div v-if="documentLoading" class="flex justify-center items-center h-64">
            <svg class="animate-spin h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          
          <div v-else-if="documentError" class="text-center py-10">
            <XCircleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки документа</h3>
            <p class="text-sm text-gray-500">{{ documentError }}</p>
          </div>
          
          <div v-else>
            <!-- Отображение документа в зависимости от типа -->
            <div v-if="isPdf" class="h-[70vh]">
              <iframe :src="documentUrl" class="w-full h-full" frameborder="0"></iframe>
            </div>
            
            <div v-else-if="isImage" class="flex justify-center">
              <img :src="documentUrl" class="max-w-full max-h-[70vh] object-contain" alt="Документ" />
            </div>
            
            <div v-else class="text-center py-10">
              <DocumentTextIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">Предпросмотр недоступен</h3>
              <p class="text-sm text-gray-500 mb-4">Документ данного формата нельзя просмотреть в браузере</p>
              <button 
                @click="downloadCurrentDocument()" 
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
                Скачать документ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { supabase, documents, applicationFiles, olympiadCertificates } from '@/api/supabase';
import { useToast } from 'vue-toastification';
import { 
  DocumentTextIcon, 
  EyeIcon, 
  ArrowDownTrayIcon, 
  XCircleIcon, 
  PhotoIcon, 
  AcademicCapIcon 
} from '@heroicons/vue/24/outline';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  application: {
    type: Object,
    default: null
  },
  statuses: {
    type: Array,
    required: true
  },
  isUpdating: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'update-status']);
const toast = useToast();

// Локальное состояние
const newStatus = ref(props.application?.status_id || null);
const comment = ref(props.application?.admin_comment || '');

// Состояние для просмотра документов
const showDocumentModal = ref(false);
const selectedDocument = ref(null);
const documentUrl = ref('');
const documentLoading = ref(false);
const documentError = ref(null);

// Проверка типа документа
const isPdf = computed(() => {
  return selectedDocument.value?.file_type === 'application/pdf' || 
         selectedDocument.value?.name?.toLowerCase().endsWith('.pdf');
});

const isImage = computed(() => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  return imageTypes.includes(selectedDocument.value?.file_type) || 
         /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(selectedDocument.value?.name || '');
});

// Обновляем локальное состояние при изменении заявки
watch(() => props.application, (newApplication) => {
  if (newApplication) {
    console.log('ApplicationModal получил новые данные заявки:', newApplication);
    console.log('Документы в модальном окне:', newApplication.documents?.length || 0);
    console.log('Файлы заявления в модальном окне:', newApplication.application_files?.length || 0);
    console.log('Сертификаты олимпиад в модальном окне:', newApplication.olympiad_certificates?.length || 0);
    
    newStatus.value = newApplication.status_id;
    comment.value = newApplication.admin_comment || '';
  }
}, { deep: true });

// Функции для работы с интерфейсом
function close() {
  emit('close');
}

function updateStatus() {
  if (!newStatus.value) return;
  
  emit('update-status', { 
    applicationId: props.application.id, 
    statusId: newStatus.value,
    comment: comment.value 
  });
}

// Получение полного имени пользователя
function getUserFullName(user) {
  if (!user) return 'Неизвестный пользователь';
  return `${user.last_name || ''} ${user.first_name || ''} ${user.middle_name || ''}`.trim();
}

// Получение названия региона
function getRegionName() {
  const userRegion = props.application?.users?.regions;
  const appRegion = props.application?.regions;
  
  // Проверяем регион из связи пользователя
  if (userRegion?.name) return userRegion.name;
  
  // Проверяем регион из связи заявки
  if (appRegion?.name) return appRegion.name;
  
  return 'Не указан';
}

// Получение названия уровня образования
function getEducationLevelName(level) {
  const levels = {
    'high-school': 'Среднее общее (11 классов)',
    'college': 'Среднее профессиональное (колледж, техникум)',
    'bachelor': 'Высшее - бакалавриат',
    'master': 'Высшее - магистратура'
  };
  return levels[level] || 'Не указан';
}

// Получение полного названия профиля с направлением
function getProfileFullName(choice) {
  if (!choice || !choice.profiles) return 'Профиль не найден';
  
  const profile = choice.profiles;
  if (profile.directions) {
    return `${profile.name} (${profile.directions.name || profile.directions.code})`;
  } else {
    return profile.name;
  }
}

// Форматирование даты
function formatDate(dateString) {
  if (!dateString) return 'Не указана';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}

// Получение имени статуса по ID
function getStatusName(statusId) {
  const status = props.statuses.find(s => s.id === statusId);
  return status ? status.name : 'Неизвестный статус';
}

// Получение класса для отображения статуса
function getStatusClass(statusId) {
  const status = props.statuses.find(s => s.id === statusId);
  
  if (!status) return 'bg-gray-100 text-gray-800';
  
  switch (status.name) {
    case 'Подана':
      return 'bg-blue-100 text-blue-800';
    case 'Принята':
      return 'bg-green-100 text-green-800';
    case 'Отклонена':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
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

// Получение статуса документа
function getDocumentStatus(status) {
  const statusMap = {
    'pending': 'На рассмотрении',
    'approved': 'Одобрен',
    'rejected': 'Отклонен'
  };
  return statusMap[status] || 'Неизвестен';
}

// Форматирование размера файла
function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '0 Б';
  
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Просмотр документа
async function viewDocument(documentItem) {
  selectedDocument.value = documentItem;
  showDocumentModal.value = true;
  documentLoading.value = true;
  documentError.value = null;
  documentUrl.value = '';
  
  try {
    const { data, error } = await documents.getSignedUrl(documentItem.id);
    
    if (error) {
      console.error('Ошибка при получении URL для просмотра:', error);
      documentError.value = `Ошибка: ${error.message || 'Не удалось получить доступ к документу'}`;
      return;
    }
    
    if (!data || !data.signedUrl) {
      console.error('URL для просмотра отсутствует в ответе');
      documentError.value = 'Не удалось получить URL для просмотра документа';
      return;
    }
    
    documentUrl.value = data.signedUrl;
  } catch (err) {
    console.error('Ошибка при загрузке документа:', err);
    documentError.value = `Ошибка при загрузке: ${err.message || 'Неизвестная ошибка'}`;
  } finally {
    documentLoading.value = false;
  }
}

// Просмотр файла заявления
async function viewApplicationFile(fileItem) {
  selectedDocument.value = fileItem;
  showDocumentModal.value = true;
  documentLoading.value = true;
  documentError.value = null;
  documentUrl.value = '';
  
  try {
    const { data, error } = await applicationFiles.getSignedUrl(fileItem.id);
    
    if (error) {
      console.error('Ошибка при получении URL для просмотра файла:', error);
      documentError.value = `Ошибка: ${error.message || 'Не удалось получить доступ к файлу'}`;
      return;
    }
    
    if (!data || !data.signedUrl) {
      console.error('URL для просмотра файла отсутствует в ответе');
      documentError.value = 'Не удалось получить URL для просмотра файла';
      return;
    }
    
    documentUrl.value = data.signedUrl;
  } catch (err) {
    console.error('Ошибка при загрузке файла:', err);
    documentError.value = `Ошибка при загрузке: ${err.message || 'Неизвестная ошибка'}`;
  } finally {
    documentLoading.value = false;
  }
}

// Просмотр сертификата олимпиады
async function viewOlympiadCertificate(cert) {
  selectedDocument.value = cert;
  showDocumentModal.value = true;
  documentLoading.value = true;
  documentError.value = null;
  documentUrl.value = '';
  
  try {
    const { data, error } = await olympiadCertificates.getSignedUrl(cert.id);
    
    if (error) {
      console.error('Ошибка при получении URL сертификата олимпиады:', error);
      documentError.value = `Ошибка: ${error.message || 'Не удалось получить доступ к сертификату'}`;
      return;
    }
    
    if (!data || !data.signedUrl) {
      console.error('URL для просмотра сертификата отсутствует в ответе');
      documentError.value = 'Не удалось получить URL для просмотра сертификата';
      return;
    }
    
    documentUrl.value = data.signedUrl;
  } catch (err) {
    console.error('Ошибка при загрузке сертификата олимпиады:', err);
    documentError.value = `Ошибка при загрузке: ${err.message || 'Неизвестная ошибка'}`;
  } finally {
    documentLoading.value = false;
  }
}

// Закрытие модального окна просмотра документа
function closeDocumentModal() {
  showDocumentModal.value = false;
  selectedDocument.value = null;
  documentUrl.value = '';
}

// Скачивание документа
async function downloadDocument(documentItem) {
  try {
    const { data, error } = await documents.getSignedUrl(documentItem.id, { download: true });
    
    if (error) {
      console.error('Ошибка при получении URL для скачивания:', error);
      toast.error(`Ошибка: ${error.message || 'Не удалось получить доступ к документу'}`);
      return;
    }
    
    if (!data || !data.signedUrl) {
      console.error('URL для скачивания отсутствует в ответе');
      toast.error('Не удалось получить URL для скачивания документа');
      return;
    }
    
    const downloadLink = document.createElement('a');
    downloadLink.href = data.signedUrl;
    downloadLink.download = documentItem.file_name || `document-${Date.now()}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (err) {
    console.error('Ошибка при скачивании документа:', err);
    toast.error(`Ошибка при скачивании: ${err.message || 'Неизвестная ошибка'}`);
  }
}

// Скачивание файла заявления
async function downloadApplicationFile(fileItem) {
  try {
    const { data, error } = await applicationFiles.getSignedUrl(fileItem.id, { download: true });
    
    if (error) {
      console.error('Ошибка при получении URL для скачивания файла:', error);
      toast.error(`Ошибка: ${error.message || 'Не удалось получить доступ к файлу'}`);
      return;
    }
    
    if (!data || !data.signedUrl) {
      console.error('URL для скачивания файла отсутствует в ответе');
      toast.error('Не удалось получить URL для скачивания файла');
      return;
    }
    
    const downloadLink = document.createElement('a');
    downloadLink.href = data.signedUrl;
    downloadLink.download = fileItem.file_name || `file-${Date.now()}`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (err) {
    console.error('Ошибка при скачивании файла:', err);
    toast.error(`Ошибка при скачивании: ${err.message || 'Неизвестная ошибка'}`);
  }
}

// Скачивание текущего просматриваемого документа
function downloadCurrentDocument() {
  if (selectedDocument.value) {
    if (selectedDocument.value.document_types) {
      // Это обычный документ
      downloadDocument(selectedDocument.value);
    } else if (selectedDocument.value.file_category || selectedDocument.value.application_id) {
      // Это файл заявления
      downloadApplicationFile(selectedDocument.value);
    } else if (selectedDocument.value.name && selectedDocument.value.year) {
      // Это сертификат олимпиады
      downloadOlympiadCertificate(selectedDocument.value);
    }
  }
}

// Скачивание сертификата олимпиады
async function downloadOlympiadCertificate(cert) {
  try {
    const { data, error } = await olympiadCertificates.getSignedUrl(cert.id, { download: true });
    
    if (error) {
      console.error('Ошибка при получении URL для скачивания сертификата:', error);
      toast.error(`Ошибка: ${error.message || 'Не удалось получить доступ к сертификату'}`);
      return;
    }
    
    if (!data || !data.signedUrl) {
      console.error('URL для скачивания сертификата отсутствует в ответе');
      toast.error('Не удалось получить URL для скачивания сертификата');
      return;
    }
    
    const downloadLink = document.createElement('a');
    downloadLink.href = data.signedUrl;
    downloadLink.download = data.fileName || cert.file_name || `olympiad-certificate-${Date.now()}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (err) {
    console.error('Ошибка при скачивании сертификата:', err);
    toast.error(`Ошибка при скачивании: ${err.message || 'Неизвестная ошибка'}`);
  }
}

// Получение файлов по категории
function getFilesByCategory(category) {
  if (!props.application?.application_files) return [];
  
  return props.application.application_files.filter(file => {
    // Маппинг старых имён на новые категории
    if (category === 'passport_scan') {
      return file.file_category === 'passport_scan' || file.file_category === 'passportScan';
    }
    if (category === 'photo') {
      return file.file_category === 'photo' || file.file_category === 'photoFile';
    }
    if (category === 'education_scan') {
      return file.file_category === 'education_scan' || file.file_category === 'educationScan';
    }
    return file.file_category === category || (!file.file_category && category === 'general');
  });
}

// Получение названия категории файла
function getFileCategoryName(category) {
  const categoryMap = {
    'passport_scan': 'Скан паспорта',
    'passportScan': 'Скан паспорта',
    'photo': 'Фотография 3x4',
    'photoFile': 'Фотография 3x4',
    'education_scan': 'Скан документа об образовании',
    'educationScan': 'Скан документа об образовании',
    'general': 'Общий файл'
  };
  return categoryMap[category] || 'Неизвестная категория';
}

// Получение URL документа (аналогично ApplicationDetailsPage.vue)
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

// Получение URL файла заявления (аналогично ApplicationDetailsPage.vue)
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

// Получение URL сертификата олимпиады (аналогично ApplicationDetailsPage.vue)
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

// Функции для определения типа файла (аналогично ApplicationDetailsPage.vue)
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

// Получение расширения файла
function getFileExtension(filename) {
  if (!filename) return '';
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.substring(lastDotIndex + 1).toUpperCase() : '';
}

// Получение имени файла без расширения
function getFileName(filename) {
  if (!filename) return '';
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;
}

// Получение отображаемого имени файла
function getFileDisplayName(file) {
  // Определяем тип файла по категории
  if (file.file_category === 'photo') {
    return 'Фотография 3×4';
  } else if (file.file_category === 'education_scan') {
    return 'Документ об образовании';
  } else if (file.file_category === 'passport_scan') {
    return 'Скан паспорта';
  } else if (file.file_category === 'additional') {
    return 'Дополнительный документ';
  }
  return file.file_name || 'Файл';
}

// Цвета иконок для файлов (аналогично ApplicationDetailsPage.vue)
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

<style scoped>
/* Стили остаются прежними */
.fixed {
  position: fixed;
}

.z-\[100\] {
  z-index: 100 !important;
}

.z-\[200\] {
  z-index: 200 !important;
}
</style> 