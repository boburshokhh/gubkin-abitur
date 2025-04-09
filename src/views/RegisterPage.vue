<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Заголовок страницы -->
    <section class="py-10 md:py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl md:text-4xl font-bold mb-4">
            Подача документов
          </h1>
          <p class="text-lg opacity-90">
            Заполните форму ниже для подачи заявления в Ташкентский филиал Университета Губкина
          </p>
        </div>
      </div>
    </section>

    <!-- Содержимое страницы -->
    <section class="py-12 md:py-16">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto">
          <!-- Прогресс -->
          <div class="mb-10">
            <div class="flex justify-between mb-2">
              <span class="text-sm font-medium">Этап {{ currentStep }} из {{ totalSteps }}</span>
              <span class="text-sm font-medium">{{ Math.round((currentStep / totalSteps) * 100) }}% завершено</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-primary-600 h-2 rounded-full transition-all duration-500" 
                :style="`width: ${(currentStep / totalSteps) * 100}%`"
              ></div>
            </div>
          </div>
          
          <!-- Полноэкранный индикатор загрузки -->
          <div v-if="isSubmitting" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full">
              <BaseLoader size="lg" class="mx-auto mb-4" />
              <h3 class="text-xl font-semibold mb-2 text-gray-900">Отправка заявления</h3>
              <p class="text-gray-600">
                Пожалуйста, подождите. Ваше заявление обрабатывается и документы загружаются. 
                Это может занять несколько минут.
              </p>
              <div class="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div class="bg-primary-600 h-2 rounded-full" :style="`width: ${submissionProgress}%`"></div>
              </div>
              <p class="mt-2 text-sm text-gray-500">{{ submissionStatus }}</p>
            </div>
          </div>
          
          <!-- Форма подачи заявления -->
          <BaseCard>
            <template #header>
              <h2 class="text-xl font-bold text-gray-900">{{ stepTitle }}</h2>
            </template>
            
            <!-- Шаг 1: Личные данные -->
            <div v-if="currentStep === 1">
              <div v-if="isFormLoading" class="flex justify-center py-10">
                <BaseLoader size="lg" />
              </div>
              <div v-else class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <BaseInput
                      v-model="form.lastName"
                      label="Фамилия"
                      placeholder="Введите фамилию"
                      required
                      :error="errors.lastName"
                      :disabled="!!authStore.profile?.last_name"
                    />
                  </div>
                  <div>
                    <BaseInput
                      v-model="form.firstName"
                      label="Имя"
                      placeholder="Введите имя"
                      required
                      :error="errors.firstName"
                      :disabled="!!authStore.profile?.first_name"
                    />
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <BaseInput
                      v-model="form.middleName"
                      label="Отчество"
                      placeholder="Введите отчество (если есть)"
                      :disabled="!!authStore.profile?.middle_name"
                    />
                  </div>
                  <div>
                    <BaseInput
                      v-model="form.birthDate"
                      type="date"
                      label="Дата рождения"
                      required
                      :error="errors.birthDate"
                      :disabled="!!authStore.profile?.birth_date"
                    />
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <BaseInput
                      v-model="form.phone"
                      label="Телефон"
                      placeholder="+998 __ ___ __ __"
                      required
                      :error="errors.phone"
                      :disabled="!!authStore.profile?.phone"
                    />
                  </div>
                  <div>
                    <BaseInput
                      v-model="form.email"
                      type="email"
                      label="Email"
                      placeholder="example@mail.com"
                      required
                      :error="errors.email"
                      disabled
                    />
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Пол</label>
                  <div class="flex space-x-4">
                    <label class="inline-flex items-center">
                      <input 
                        type="radio" 
                        v-model="form.gender" 
                        value="male" 
                        class="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        :disabled="!!authStore.profile?.gender"
                      >
                      <span class="ml-2">Мужской</span>
                    </label>
                    <label class="inline-flex items-center">
                      <input 
                        type="radio" 
                        v-model="form.gender" 
                        value="female" 
                        class="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        :disabled="!!authStore.profile?.gender"
                      >
                      <span class="ml-2">Женский</span>
                    </label>
                  </div>
                  <p v-if="errors.gender" class="mt-1 text-sm text-red-600">{{ errors.gender }}</p>
                </div>
              </div>
            </div>
            
            <!-- Шаг 2: Паспортные данные -->
            <div v-if="currentStep === 2">
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <BaseInput
                      v-model="form.passportSeries"
                      label="Серия и номер паспорта"
                      placeholder="AA 1234567"
                      required
                      :error="errors.passportSeries"
                    />
                  </div>
                  <div>
                    <BaseInput
                      v-model="form.passportIssueDate"
                      type="date"
                      label="Дата выдачи"
                      required
                      :error="errors.passportIssueDate"
                    />
                  </div>
                </div>
                
                <div>
                  <BaseInput
                    v-model="form.passportIssuedBy"
                    label="Кем выдан"
                    placeholder="Укажите орган, выдавший паспорт"
                    required
                    :error="errors.passportIssuedBy"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Скан или фото паспорта (первая страница)</label>
                  <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div v-if="fileUploading.passportScan" class="py-10">
                      <BaseLoader size="md" />
                      <p class="mt-2 text-sm text-gray-500 text-center">Загрузка файла...</p>
                    </div>
                    <div v-else-if="filePreview.passportScan" class="space-y-2 flex flex-col items-center">
                      <img v-if="filePreview.passportScan.type.includes('image')" 
                           :src="filePreview.passportScan.url" 
                           alt="Предпросмотр паспорта" 
                           class="max-h-48 object-contain" />
                      <div v-else class="flex items-center space-x-2 py-4">
                        <svg class="h-8 w-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                        </svg>
                        <span class="text-sm text-gray-600">{{ form.passportScan.name }}</span>
                      </div>
                      <div class="flex space-x-2">
                        <button type="button" @click="viewFile('passportScan')"
                                class="text-sm text-primary-600 hover:text-primary-700">
                          Открыть файл
                        </button>
                        <button type="button" @click="resetFile('passportScan')"
                                class="text-sm text-red-600 hover:text-red-700">
                          Удалить
                        </button>
                      </div>
                    </div>
                    <div v-else class="space-y-1 text-center">
                      <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <div class="flex text-sm text-gray-600">
                        <label for="file-upload-passport" class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                          <span>Загрузить файл</span>
                          <input id="file-upload-passport" name="file-upload-passport" type="file" class="sr-only" @change="onFileChange($event, 'passportScan')">
                        </label>
                        <p class="pl-1">или перетащите сюда</p>
                      </div>
                      <p class="text-xs text-gray-500">
                        PNG, JPG, PDF размером до 10MB
                      </p>
                    </div>
                  </div>
                  <p v-if="errors.passportScan" class="mt-1 text-sm text-red-600">{{ errors.passportScan }}</p>
                </div>
              </div>
            </div>
            
            <!-- Шаг 3: Образование -->
            <div v-if="currentStep === 3">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Уровень образования</label>
                  <select 
                    v-model="form.educationLevel" 
                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="">Выберите уровень образования</option>
                    <option value="high-school">Среднее общее (11 классов)</option>
                    <option value="college">Среднее профессиональное (колледж, техникум)</option>
                    <option value="bachelor">Высшее - бакалавриат</option>
                    <option value="master">Высшее - магистратура</option>
                  </select>
                  <p v-if="errors.educationLevel" class="mt-1 text-sm text-red-600">{{ errors.educationLevel }}</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <BaseInput
                      v-model="form.educationInstitution"
                      label="Учебное заведение"
                      placeholder="Название школы/колледжа/университета"
                      required
                      :error="errors.educationInstitution"
                    />
                  </div>
                  <div>
                    <BaseInput
                      v-model="form.educationGraduationYear"
                      type="number"
                      label="Год окончания"
                      placeholder="2023"
                      required
                      :error="errors.educationGraduationYear"
                    />
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <BaseInput
                      v-model="form.documentNumber"
                      label="Номер документа об образовании"
                      placeholder="Номер аттестата/диплома"
                      required
                      :error="errors.documentNumber"
                    />
                  </div>
                  <div>
                    <BaseInput
                      v-model="form.documentDate"
                      type="date"
                      label="Дата выдачи документа"
                      required
                      :error="errors.documentDate"
                    />
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Скан или фото документа об образовании</label>
                  <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div v-if="fileUploading.educationScan" class="py-10">
                      <BaseLoader size="md" />
                      <p class="mt-2 text-sm text-gray-500 text-center">Загрузка файла...</p>
                    </div>
                    <div v-else-if="filePreview.educationScan" class="space-y-2 flex flex-col items-center">
                      <img v-if="filePreview.educationScan.type.includes('image')" 
                           :src="filePreview.educationScan.url" 
                           alt="Предпросмотр документа об образовании" 
                           class="max-h-48 object-contain" />
                      <div v-else class="flex items-center space-x-2 py-4">
                        <svg class="h-8 w-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                        </svg>
                        <span class="text-sm text-gray-600">{{ form.educationScan.name }}</span>
                      </div>
                      <div class="flex space-x-2">
                        <button type="button" @click="viewFile('educationScan')"
                                class="text-sm text-primary-600 hover:text-primary-700">
                          Открыть файл
                        </button>
                        <button type="button" @click="resetFile('educationScan')"
                                class="text-sm text-red-600 hover:text-red-700">
                          Удалить
                        </button>
                      </div>
                    </div>
                    <div v-else class="space-y-1 text-center">
                      <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <div class="flex text-sm text-gray-600">
                        <label for="file-upload-education" class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                          <span>Загрузить файл</span>
                          <input id="file-upload-education" name="file-upload-education" type="file" class="sr-only" @change="onFileChange($event, 'educationScan')">
                        </label>
                        <p class="pl-1">или перетащите сюда</p>
                      </div>
                      <p class="text-xs text-gray-500">
                        PNG, JPG, PDF размером до 10MB
                      </p>
                    </div>
                  </div>
                  <p v-if="errors.educationScan" class="mt-1 text-sm text-red-600">{{ errors.educationScan }}</p>
                </div>
              </div>
            </div>
            
            <!-- Шаг 4: Выбор направления -->
            <div v-if="currentStep === 4">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Выберите направление обучения</label>
                  <select 
                    v-model="form.direction" 
                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="">Выберите направление</option>
                    <option v-for="direction in directions" :key="direction.id" :value="direction.id">
                      {{ direction.name }}
                    </option>
                  </select>
                  <p v-if="errors.direction" class="mt-1 text-sm text-red-600">{{ errors.direction }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Форма обучения</label>
                  <div class="flex space-x-4">
                    <label class="inline-flex items-center">
                      <input 
                        type="radio" 
                        v-model="form.studyForm" 
                        value="full-time" 
                        class="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      >
                      <span class="ml-2">Очная</span>
                    </label>
                  </div>
                  <p v-if="errors.studyForm" class="mt-1 text-sm text-red-600">{{ errors.studyForm }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Форма финансирования</label>
                  <div class="flex space-x-4">
                    <label class="inline-flex items-center">
                      <input 
                        type="radio" 
                        v-model="form.fundingForm" 
                        value="budget" 
                        class="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      >
                      <span class="ml-2">Бюджет</span>
                    </label>
                    <label class="inline-flex items-center">
                      <input 
                        type="radio" 
                        v-model="form.fundingForm" 
                        value="contract" 
                        class="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      >
                      <span class="ml-2">Контракт</span>
                    </label>
                  </div>
                  <p v-if="errors.fundingForm" class="mt-1 text-sm text-red-600">{{ errors.fundingForm }}</p>
                </div>
                
                <div v-if="selectedDirection">
                  <h3 class="font-medium text-gray-900 mb-2">Необходимые вступительные испытания:</h3>
                  <ul class="list-disc list-inside text-gray-600 mb-4 ml-2">
                    <li v-for="(exam, index) in selectedDirection.exams" :key="index">{{ exam }}</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <!-- Шаг 5: Подтверждение -->
            <div v-if="currentStep === 5">
              <div class="space-y-6">
                <div class="px-4 py-5 bg-gray-50 rounded-lg">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Личные данные</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    <div>
                      <span class="text-sm text-gray-500">Ф.И.О.:</span>
                      <p>{{ form.lastName }} {{ form.firstName }} {{ form.middleName }}</p>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">Дата рождения:</span>
                      <p>{{ formatDate(form.birthDate) }}</p>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">Контактный телефон:</span>
                      <p>{{ form.phone }}</p>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">Email:</span>
                      <p>{{ form.email }}</p>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">Пол:</span>
                      <p>{{ form.gender === 'male' ? 'Мужской' : 'Женский' }}</p>
                    </div>
                  </div>
                </div>
                
                <div class="px-4 py-5 bg-gray-50 rounded-lg">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Паспортные данные</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    <div>
                      <span class="text-sm text-gray-500">Серия и номер:</span>
                      <p>{{ form.passportSeries }}</p>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">Дата выдачи:</span>
                      <p>{{ formatDate(form.passportIssueDate) }}</p>
                    </div>
                    <div class="md:col-span-2">
                      <span class="text-sm text-gray-500">Кем выдан:</span>
                      <p>{{ form.passportIssuedBy }}</p>
                    </div>
                  </div>
                </div>
                
                <div class="px-4 py-5 bg-gray-50 rounded-lg">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Образование</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    <div>
                      <span class="text-sm text-gray-500">Уровень образования:</span>
                      <p>{{ getEducationLevelName(form.educationLevel) }}</p>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">Учебное заведение:</span>
                      <p>{{ form.educationInstitution }}</p>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">Год окончания:</span>
                      <p>{{ form.educationGraduationYear }}</p>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">Документ об образовании:</span>
                      <p>{{ form.documentNumber }} от {{ formatDate(form.documentDate) }}</p>
                    </div>
                  </div>
                </div>
                
                <div class="px-4 py-5 bg-gray-50 rounded-lg">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Направление обучения</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    <div>
                      <span class="text-sm text-gray-500">Направление:</span>
                      <p>{{ getDirectionName(form.direction) }}</p>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">Форма обучения:</span>
                      <p>{{ form.studyForm === 'full-time' ? 'Очная' : '' }}</p>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">Форма финансирования:</span>
                      <p>{{ form.fundingForm === 'budget' ? 'Бюджет' : 'Контракт' }}</p>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-start">
                  <div class="flex items-center h-5">
                    <input
                      id="agreement" 
                      v-model="form.agreement"
                      type="checkbox" 
                      class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    >
                  </div>
                  <div class="ml-3 text-sm">
                    <label for="agreement" class="font-medium text-gray-700">Согласие на обработку персональных данных</label>
                    <p class="text-gray-500">Я даю согласие на обработку моих персональных данных в соответствии с законодательством.</p>
                    <p v-if="errors.agreement" class="mt-1 text-sm text-red-600">{{ errors.agreement }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Кнопки навигации -->
            <div class="mt-8 flex justify-between">
              <BaseButton 
                v-if="currentStep > 1"
                variant="outline" 
                @click="prevStep"
              >
                Назад
              </BaseButton>
              <div v-else></div>
              
              <div>
                <BaseButton 
                  v-if="currentStep < totalSteps" 
                  variant="primary" 
                  @click="nextStep"
                >
                  Далее
                </BaseButton>
                <BaseButton 
                  v-else 
                  variant="primary" 
                  @click="submitForm"
                  :loading="isSubmitting"
                >
                  Отправить заявление
                </BaseButton>
              </div>
            </div>
          </BaseCard>
          
          <!-- Успешная отправка -->
          <div v-if="isSubmitted" class="mt-8">
            <BaseCard>
              <div class="text-center">
                <div class="flex justify-center">
                  <svg class="h-16 w-16 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 class="mt-4 text-2xl font-bold text-gray-900">Заявление успешно отправлено!</h2>
                <p class="mt-2 text-gray-600">
                  Ваше заявление принято на рассмотрение. Номер заявления: <strong>{{ applicationNumber }}</strong>
                </p>
                <p class="mt-2 text-gray-600">
                  В ближайшее время с вами свяжутся представители приемной комиссии для дальнейших инструкций.
                </p>
                
                <div class="mt-6">
                  <BaseButton tag="router-link" to="/" variant="primary">
                    Вернуться на главную
                  </BaseButton>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { BaseCard, BaseInput, BaseButton, BaseLoader } from '@/components/ui';
import { useApplicationStore } from '@/stores/application';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const appStore = useApplicationStore();
const authStore = useAuthStore();

// Загрузка направлений, типов документов и профиля пользователя при монтировании компонента
onMounted(async () => {
  isFormLoading.value = true;
  await appStore.loadDirections();
  await appStore.loadDocumentTypes();
  
  // Профиль пользователя должен быть уже загружен при аутентификации
  // но если нет, нужно проверить существование пользователя
  if (authStore.user && !authStore.profile) {
    await authStore.initAuth();
  }
  
  if (authStore.profile) {
    form.value.lastName = authStore.profile.last_name || '';
    form.value.firstName = authStore.profile.first_name || '';
    form.value.middleName = authStore.profile.middle_name || '';
    form.value.phone = authStore.profile.phone || '';
    form.value.email = authStore.profile.email || authStore.user?.email || '';
    form.value.gender = authStore.profile.gender || 'male';
    
    // Если у пользователя заполнены другие данные, их тоже можно использовать
    if (authStore.profile.birth_date) {
      form.value.birthDate = authStore.profile.birth_date;
    }
  }
  
  isFormLoading.value = false;
});

// Направления подготовки из хранилища
const directions = computed(() => appStore.allDirections);
// Типы документов из хранилища
const documentTypes = computed(() => appStore.documentTypes);

// Загрузка состояния формы
const isFormLoading = ref(false);
// Состояние загрузки файлов
const fileUploading = ref({
  passportScan: false,
  educationScan: false
});

// Состояние просмотра файлов
const filePreview = ref({
  passportScan: null,
  educationScan: null
});

// Состояние формы
const form = ref({
  // Личные данные
  lastName: '',
  firstName: '',
  middleName: '',
  birthDate: '',
  phone: '',
  email: '',
  gender: 'male',
  
  // Паспортные данные
  passportSeries: '',
  passportIssueDate: '',
  passportIssuedBy: '',
  passportScan: null,
  
  // Образование
  educationLevel: '',
  educationInstitution: '',
  educationGraduationYear: new Date().getFullYear(),
  documentNumber: '',
  documentDate: '',
  educationScan: null,
  
  // Направление обучения
  direction: '',
  studyForm: 'full-time',
  fundingForm: 'budget',
  
  // Согласие на обработку данных
  agreement: false
});

// Ошибки валидации
const errors = ref({});

// Текущий шаг формы
const currentStep = ref(1);
const totalSteps = 5;

// Статус отправки
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const applicationNumber = ref('');
const submissionProgress = ref(0);
const submissionStatus = ref('Подготовка данных...');

// Заголовки для шагов
const stepTitle = computed(() => {
  const titles = {
    1: 'Личные данные',
    2: 'Паспортные данные',
    3: 'Образование',
    4: 'Выбор направления',
    5: 'Подтверждение данных'
  };
  return titles[currentStep.value] || '';
});

// Выбранное направление
const selectedDirection = computed(() => {
  if (!form.value.direction) return null;
  return directions.value.find(d => d.id === form.value.direction);
});

// Обработка загрузки файлов
const onFileChange = async (event, fieldName) => {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    fileUploading[fieldName] = true;
    
    // Проверяем тип и размер файла
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      throw new Error('Неподдерживаемый тип файла. Допустимые форматы: JPG, PNG, PDF');
    }
    
    if (file.size > maxSize) {
      throw new Error('Размер файла превышает допустимый максимум (10MB)');
    }
    
    // Сохраняем файл в форме
    form.value[fieldName] = file;
    
    // Создаем превью файла
    if (file.type.includes('image')) {
      const fileUrl = URL.createObjectURL(file);
      filePreview.value[fieldName] = {
        url: fileUrl,
        type: file.type,
        name: file.name
      };
    } else {
      filePreview.value[fieldName] = {
        url: null,
        type: file.type,
        name: file.name
      };
    }
    
    // Удаляем ошибку для этого поля
    if (errors.value[fieldName]) {
      delete errors.value[fieldName];
    }
  } catch (err) {
    errors.value[fieldName] = err.message || 'Ошибка загрузки файла';
    form.value[fieldName] = null;
    filePreview.value[fieldName] = null;
  } finally {
    fileUploading[fieldName] = false;
  }
};

// Просмотр файла
const viewFile = (fieldName) => {
  const file = form.value[fieldName];
  if (!file) return;
  
  // Для изображений открываем в новом окне
  if (filePreview.value[fieldName]?.url) {
    window.open(filePreview.value[fieldName].url, '_blank');
  } else {
    // Для PDF создаем временную ссылку и открываем
    const fileUrl = URL.createObjectURL(file);
    window.open(fileUrl, '_blank');
  }
};

// Сброс файла
const resetFile = (fieldName) => {
  form.value[fieldName] = null;
  
  // Если есть превью с URL, освобождаем его
  if (filePreview.value[fieldName]?.url) {
    URL.revokeObjectURL(filePreview.value[fieldName].url);
  }
  
  filePreview.value[fieldName] = null;
};

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU').format(date);
};

// Получение названия уровня образования
const getEducationLevelName = (level) => {
  const levels = {
    'high-school': 'Среднее общее (11 классов)',
    'college': 'Среднее профессиональное (колледж, техникум)',
    'bachelor': 'Высшее - бакалавриат',
    'master': 'Высшее - магистратура'
  };
  return levels[level] || '';
};

// Получение названия направления
const getDirectionName = (id) => {
  const direction = directions.value.find(d => d.id === id);
  return direction ? direction.name : '';
};

// Валидация формы по шагам
const validateStep = (step) => {
  const newErrors = {};
  
  if (step === 1) {
    if (!form.value.lastName) newErrors.lastName = 'Введите фамилию';
    if (!form.value.firstName) newErrors.firstName = 'Введите имя';
    if (!form.value.birthDate) newErrors.birthDate = 'Выберите дату рождения';
    if (!form.value.phone) newErrors.phone = 'Введите номер телефона';
    if (!form.value.email) newErrors.email = 'Введите email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
      newErrors.email = 'Введите корректный email';
    }
    if (!form.value.gender) newErrors.gender = 'Выберите пол';
  }
  
  else if (step === 2) {
    if (!form.value.passportSeries) newErrors.passportSeries = 'Введите серию и номер паспорта';
    if (!form.value.passportIssueDate) newErrors.passportIssueDate = 'Выберите дату выдачи';
    if (!form.value.passportIssuedBy) newErrors.passportIssuedBy = 'Укажите, кем выдан паспорт';
    if (!form.value.passportScan) newErrors.passportScan = 'Загрузите скан паспорта';
  }
  
  else if (step === 3) {
    if (!form.value.educationLevel) newErrors.educationLevel = 'Выберите уровень образования';
    if (!form.value.educationInstitution) newErrors.educationInstitution = 'Введите название учебного заведения';
    if (!form.value.educationGraduationYear) newErrors.educationGraduationYear = 'Укажите год окончания';
    if (!form.value.documentNumber) newErrors.documentNumber = 'Введите номер документа';
    if (!form.value.documentDate) newErrors.documentDate = 'Выберите дату выдачи документа';
    if (!form.value.educationScan) newErrors.educationScan = 'Загрузите скан документа об образовании';
  }
  
  else if (step === 4) {
    if (!form.value.direction) newErrors.direction = 'Выберите направление обучения';
    if (!form.value.studyForm) newErrors.studyForm = 'Выберите форму обучения';
    if (!form.value.fundingForm) newErrors.fundingForm = 'Выберите форму финансирования';
  }
  
  else if (step === 5) {
    if (!form.value.agreement) newErrors.agreement = 'Для продолжения необходимо согласие на обработку персональных данных';
  }
  
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

// Переход к следующему шагу
const nextStep = () => {
  if (validateStep(currentStep.value)) {
    currentStep.value++;
  }
};

// Возврат к предыдущему шагу
const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// Отправка формы
const submitForm = async () => {
  if (isSubmitting.value) return; // Предотвращаем двойную отправку
  if (!validateStep(currentStep.value)) return;
  
  isSubmitting.value = true;
  submissionProgress.value = 10;
  submissionStatus.value = 'Подготовка данных...';
  
  try {
    // Таймаут для имитации начальной загрузки и предотвращения слишком быстрых изменений UI
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 1. Создаем заявку в БД
    submissionStatus.value = 'Создание заявления...';
    submissionProgress.value = 20;
    
    const applicationData = {
      direction_id: form.value.direction,
      passport_series: form.value.passportSeries,
      passport_issue_date: form.value.passportIssueDate,
      passport_issued_by: form.value.passportIssuedBy,
      education_level: form.value.educationLevel,
      education_institution: form.value.educationInstitution,
      education_graduation_year: parseInt(form.value.educationGraduationYear, 10),
      document_number: form.value.documentNumber,
      document_date: form.value.documentDate,
      study_form: form.value.studyForm,
      funding_form: form.value.fundingForm,
    };

    // Генерируем уникальный идентификатор для отслеживания этой отправки
    const submissionId = Date.now().toString();
    // Сохраняем в sessionStorage, чтобы избежать дублирования при перезагрузке страницы
    sessionStorage.setItem('lastSubmissionId', submissionId);

    // Обновляем профиль пользователя, если есть изменения
    const profileUpdateData = {};
    
    // Проверяем только те поля, которые могли быть изменены в форме 
    // и не были заблокированы для редактирования
    if (!authStore.profile?.birth_date && form.value.birthDate) {
      profileUpdateData.birth_date = form.value.birthDate;
    }
    
    if (Object.keys(profileUpdateData).length > 0) {
      submissionStatus.value = 'Обновление профиля...';
      submissionProgress.value = 30;
      
      const profileUpdateResult = await authStore.updateProfile(profileUpdateData);
      if (!profileUpdateResult.success) {
        throw new Error(profileUpdateResult.error || 'Ошибка обновления профиля');
      }
    }

    submissionStatus.value = 'Сохранение заявления...';
    submissionProgress.value = 40;

    const { success: createSuccess, data: newApplication, error: createError } = await appStore.createApplication(applicationData);

    if (!createSuccess || !newApplication) {
      throw new Error(createError || 'Ошибка создания заявки');
    }

    // 2. Загружаем документы
    submissionStatus.value = 'Загрузка документов...';
    submissionProgress.value = 60;
    
    const documentUploadPromises = [];
    const getDocTypeId = (name) => documentTypes.value.find(dt => dt.name === name)?.id;

    if (form.value.passportScan) {
      const docTypeId = getDocTypeId('passport');
      if (docTypeId) {
        documentUploadPromises.push(appStore.uploadDocument(newApplication.id, docTypeId, form.value.passportScan));
      }
    }
    if (form.value.educationScan) {
      const docTypeId = getDocTypeId('education_document');
      if (docTypeId) {
        documentUploadPromises.push(appStore.uploadDocument(newApplication.id, docTypeId, form.value.educationScan));
      }
    }

    const uploadResults = await Promise.all(documentUploadPromises);
    const failedUploads = uploadResults.filter(res => !res.success);

    if (failedUploads.length > 0) {
      console.error('Ошибки загрузки документов:', failedUploads);
      throw new Error('Не удалось загрузить все необходимые документы.');
    }

    // 3. Отправляем заявку на рассмотрение (меняем статус на 'submitted')
    submissionStatus.value = 'Отправка заявления на рассмотрение...';
    submissionProgress.value = 80;
    
    const { success: submitSuccess, error: submitError } = await appStore.submitApplication(newApplication.id);
    if (!submitSuccess) {
      throw new Error(submitError || 'Ошибка отправки заявки на рассмотрение');
    }

    submissionStatus.value = 'Завершение...';
    submissionProgress.value = 95;
    
    // Небольшая задержка для плавного окончания прогресса
    await new Promise(resolve => setTimeout(resolve, 500));
    
    submissionProgress.value = 100;
    applicationNumber.value = newApplication.id; // Используем реальный ID заявки
    isSubmitted.value = true;

    // Очищаем временные URL для превью
    Object.keys(filePreview.value).forEach(key => {
      if (filePreview.value[key]?.url) {
        URL.revokeObjectURL(filePreview.value[key].url);
      }
    });

  } catch (err) {
    console.error('Ошибка отправки формы:', err);
    errors.value.submit = err.message || 'Произошла ошибка при отправке заявления.';
    // Если произошла ошибка, откатываем прогресс и показываем сообщение
    submissionStatus.value = `Ошибка: ${err.message || 'Не удалось отправить заявление'}`;
    submissionProgress.value = 0;
    
    // Задержка, чтобы пользователь успел увидеть сообщение об ошибке 
    await new Promise(resolve => setTimeout(resolve, 2000));
  } finally {
    isSubmitting.value = false;
  }
};
</script> 