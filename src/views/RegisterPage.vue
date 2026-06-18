<template>
  <!-- Если прием закрыт, показываем сообщение -->
  <AdmissionClosedMessage v-if="!isAdmissionOpen" />
  
  <!-- Если прием открыт, показываем форму -->
  <div v-else class="min-h-screen bg-slate-50">
    <!-- Заголовок страницы -->
    <section class="py-10 md:py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl md:text-4xl font-bold mb-4">
            Подача документов
          </h1>
        </div>
      </div>
    </section>

    <!-- Содержимое страницы -->
    <section class="py-12 md:py-16">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto">
          <!-- Прогресс -->
          <ProgressBar 
            :currentStep="currentStep" 
            :totalSteps="totalSteps" 
          />
          
          <!-- Информация о валидации текущего шага -->
          <!-- <div v-if="!isCurrentStepValid && Object.keys(errors).length === 0" 
               class="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-md">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">Заполните все обязательные поля</h3>
                <p class="mt-1 text-sm text-yellow-700">
                  Для перехода к следующему шагу необходимо заполнить все поля, отмеченные звездочкой (*).
                </p>
              </div>
            </div>
          </div> -->
          
          <!-- Полноэкранный индикатор загрузки -->
          <SubmissionLoader 
            v-if="isSubmitting" 
            :progress="submissionProgress" 
            :status="submissionStatus" 
          />
          
          <!-- Форма подачи заявления -->
          <el-card v-if="!isSubmitted" class="register-card" shadow="always">
            <template #header>
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-gray-500">Шаг {{ currentStep }} из {{ totalSteps }}</p>
                  <h2 class="text-xl font-bold text-gray-900">{{ stepTitle }}</h2>
                </div>
                <el-tag type="primary" effect="light">{{ Math.round((currentStep / totalSteps) * 100) }}% завершено</el-tag>
              </div>
            </template>
            
            <!-- Шаг 1: Личные данные -->
            <PersonalInfoStep
              v-if="currentStep === 1"
              v-model="form"
              :errors="errors"
              :isLoading="isFormLoading"
              :regions="regionsData"
              @phone-format="formatPhoneNumber"
            />
            
            <!-- Шаг 2: Паспортные данные -->
            <PassportInfoStep
              v-if="currentStep === 2"
              v-model="form"
              :errors="errors"
              :isForeignResidence="form.isForeignResidence"
              :fileUploading="fileUploading"
              :filePreview="filePreview"
              @passport-format="formatPassportSeries"
              @file-change="onFileChange"
              @file-view="viewFile"
              @file-reset="resetFile"
            />
            
            <!-- Шаг 3: Образование -->
            <EducationInfoStep
              v-if="currentStep === 3"
              v-model="form"
              :errors="errors"
              :fileUploading="fileUploading"
              :filePreview="filePreview"
              @file-change="onFileChange"
              @file-view="viewFile"
              @file-reset="resetFile"
            />
            
            <!-- Шаг 4: Выбор направления -->
            <ProgramSelectionStep
              v-if="currentStep === 4"
              v-model="form"
              :errors="errors"
            />
            
            <!-- Шаг 5: Подтверждение -->
            <ConfirmationStep
              v-if="currentStep === 5"
              v-model="form"
              :errors="errors"
              :regions="regionsData"
              :availableProfiles="appStore.allProfiles"
              :fileUploading="fileUploading"
              :filePreview="filePreview"
              @file-change="onFileChange"
              @file-view="viewFile"
              @file-reset="resetFile"
            />
            
            <!-- Кнопки навигации -->
            <div class="mt-8 flex justify-between">
              <el-button
                v-if="currentStep > 1"
                size="large"
                @click="prevStep"
              >
                Назад
              </el-button>
              <div v-else></div>
              
              <div>
                <el-button
                  v-if="currentStep < totalSteps" 
                  type="primary"
                  size="large"
                  @click="nextStep"
                >
                  Далее
                </el-button>
                <el-button
                  v-else 
                  type="primary"
                  size="large"
                  @click="submitForm"
                  :loading="isSubmitting"
                >
                  Отправить заявление
                </el-button>
              </div>
            </div>
          </el-card>
          
          <!-- Успешная отправка -->
          <SuccessMessage
            v-if="isSubmitted"
            :applicationNumber="applicationNumber"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useApplicationStore } from '@/stores/application';
import { useToast } from 'vue-toastification';
import { appApi, applicationFiles, olympiadCertificates } from '@/api/app-api';

// Импорт компонентов
import ProgressBar from '@/components/register/ProgressBar.vue';
import SubmissionLoader from '@/components/register/SubmissionLoader.vue';
import PersonalInfoStep from '@/components/register/PersonalInfoStep.vue';
import PassportInfoStep from '@/components/register/PassportInfoStep.vue';
import EducationInfoStep from '@/components/register/EducationInfoStep.vue';
import ProgramSelectionStep from '@/components/register/ProgramSelectionStep.vue';
import ConfirmationStep from '@/components/register/ConfirmationStep.vue';
import SuccessMessage from '@/components/register/SuccessMessage.vue';
import AdmissionClosedMessage from '@/components/register/AdmissionClosedMessage.vue';
import { useAdmissionStatus } from '@/composables/useAdmissionStatus';

const appStore = useApplicationStore();
const authStore = useAuthStore();
const toast = useToast();

const { isAdmissionOpen, loadAdmissionStatus } = useAdmissionStatus({ loadOnMount: false });

const totalSteps = 5;
const currentStep = ref(1);

const isFormLoading = ref(true);
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const errors = ref({});
const applicationNumber = ref('');

const activeApplicationMessage = 'У вас уже есть активная заявка. Повторная подача невозможна, пока текущая заявка находится на рассмотрении.';

// Переменные для отслеживания прогресса отправки
const submissionProgress = ref(0);
const submissionStatus = ref('');

const phoneFields = ['phone', 'parentPhone'];
const fileRules = {
  passportScan: { types: ['application/pdf'], extensions: ['.pdf'], description: 'PDF' },
  passportTranslation: { types: ['application/pdf'], extensions: ['.pdf'], description: 'PDF' },
  photoFile: { types: ['image/jpeg', 'image/png'], extensions: ['.jpg', '.jpeg', '.png'], description: 'JPG или PNG' },
  educationScan: { types: ['application/pdf'], extensions: ['.pdf'], description: 'PDF' },
  olympiadCertificate: { types: ['application/pdf'], extensions: ['.pdf'], description: 'PDF' }
};
const uzbekPassportPattern = /^[A-Z]{2}\s?\d{7}$/;
const foreignPassportPattern = /^[A-Z0-9][A-Z0-9\s-]{4,19}$/i;
const internationalPhonePattern = /^\+\d{8,15}$/;

function getDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function formatUzbekPhone(value) {
  let digits = getDigits(value);
  if (digits.startsWith('998')) digits = digits.slice(3);
  digits = digits.slice(0, 9);

  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 7),
    digits.slice(7, 9)
  ].filter(Boolean);

  return parts.length ? `+998 ${parts.join(' ')}` : '+998 ';
}

function formatInternationalPhone(value) {
  const digits = getDigits(value).slice(0, 15);
  return digits ? `+${digits}` : '+';
}

function normalizePassportSeries(value, isForeignResidence) {
  const normalized = String(value || '').toUpperCase().replace(/[^A-Z0-9 -]/g, '').replace(/\s+/g, ' ').trimStart();
  if (isForeignResidence) return normalized.slice(0, 20);

  const compact = normalized.replace(/[^A-Z0-9]/g, '').slice(0, 9);
  const letters = compact.slice(0, 2).replace(/[^A-Z]/g, '');
  const numbers = compact.slice(2).replace(/\D/g, '').slice(0, 7);
  return numbers ? `${letters} ${numbers}`.trim() : letters;
}

function isForeignResidenceSelected() {
  return Boolean(form.value.isForeignResidence);
}

function validatePhoneValue(value, label) {
  if (!value?.trim()) return `${label} обязателен для заполнения.`;

  if (isForeignResidenceSelected()) {
    const normalized = formatInternationalPhone(value);
    if (!internationalPhonePattern.test(normalized)) return `${label}: введите международный номер в формате + и 8-15 цифр.`;
    return '';
  }

  if (getDigits(value).replace(/^998/, '').length !== 9) return `${label}: введите корректный номер Узбекистана.`;
  return '';
}

function validatePassportValue(value) {
  if (!value?.trim()) return 'Серия и номер паспорта обязательны для заполнения.';

  if (isForeignResidenceSelected()) {
    if (!foreignPassportPattern.test(value.trim())) return 'Введите корректный номер паспорта: 5-20 символов, латиница, цифры, пробел или дефис.';
    return '';
  }

  if (!uzbekPassportPattern.test(value.trim())) return 'Введите серию паспорта в формате AA 1234567.';
  return '';
}

function validateSelectedFile(file, fieldName) {
  const rule = fileRules[fieldName] || {
    types: ['image/jpeg', 'image/png', 'application/pdf'],
    extensions: ['.jpg', '.jpeg', '.png', '.pdf'],
    description: 'JPG, PNG или PDF'
  };
  const fileName = file.name?.toLowerCase() || '';
  const hasValidExtension = rule.extensions.some(extension => fileName.endsWith(extension));
  const hasValidType = rule.types.includes(file.type);

  if (!hasValidType && !hasValidExtension) return `Неподдерживаемый тип файла. Допустимые форматы: ${rule.description}.`;
  if (file.size > 10 * 1024 * 1024) return 'Размер файла превышает допустимый максимум (10MB).';

  return '';
}

const regionsData = ref([])

// Инициализация формы с правильной структурой
const form = ref({
  user_id: null,
  status_id: 1, // Черновик
  academic_year: new Date().getFullYear(),
  // Личные данные
  lastName: '',
  firstName: '',
  middleName: '',
  birthDate: null, // null вместо пустой строки для поля типа date
  region_id: null,
  isForeignResidence: false,
  address: '', // Добавляем поле адреса
  phone: '',
  parentPhone: '',
  email: '',
  gender: 'male',
  // Паспортные данные
  passport_series: '',
  passport_issue_date: null, // null вместо пустой строки для поля типа date
  passport_issued_by: '',
  // Образование
  education_level: '',
  education_institution: '',
  education_graduation_year: new Date().getFullYear(),
  education_document_number: '',
  education_document_date: null, // null вместо пустой строки для поля типа date
  // Выбор программ
  choices: [],
  funding_form: 'budget',
  // Дополнительные параметры
  accommodation_needed: false,
  olympiad_participant: false,
});

// Загрузка всех необходимых данных при монтировании
onMounted(async () => {
  await loadAdmissionStatus();

  if (!isAdmissionOpen.value) {
    isFormLoading.value = false;
    return;
  }

  isFormLoading.value = true;
  await Promise.all([
    appStore.loadEducationData(),
    appStore.loadDocumentTypes(),
    appStore.loadRegions()
  ]);
  
  regionsData.value = [...appStore.regions];
  
  if (authStore.user && !authStore.profile) {
    await authStore.initAuth();
  }
  
  if (authStore.user) {
    form.value.user_id = authStore.user.id;
    form.value.email = authStore.user.email;
  }
  
  if (authStore.profile) {
    const p = authStore.profile;
    form.value.lastName = p.last_name || '';
    form.value.firstName = p.first_name || '';
    form.value.middleName = p.middle_name || '';
    form.value.phone = p.phone || '';
    form.value.gender = p.gender || 'male';
    form.value.region_id = p.region_id || null;
    form.value.birthDate = p.birth_date || null;
  }
  
  isFormLoading.value = false;
});

const stepTitle = computed(() => {
  switch (currentStep.value) {
    case 1: return 'Личные данные';
    case 2: return 'Паспортные данные';
    case 3: return 'Образование';
    case 4: return 'Выбор образовательных программ';
    case 5: return 'Подтверждение и отправка';
    default: return 'Подача заявления';
  }
});

// Валидация текущего шага
function validateStep() {
  errors.value = {};
  const f = form.value;
  
  if (currentStep.value === 1) {
    // Личные данные - все поля обязательны
    if (!f.lastName?.trim()) errors.value.lastName = 'Фамилия обязательна для заполнения.';
    if (!f.firstName?.trim()) errors.value.firstName = 'Имя обязательно для заполнения.';
    if (!f.birthDate) errors.value.birthDate = 'Дата рождения обязательна для заполнения.';
    if (!f.region_id && !f.isForeignResidence) errors.value.region_id = 'Регион проживания обязателен для заполнения.';
    if (!f.address?.trim()) errors.value.address = 'Полный адрес места проживания обязателен для заполнения.';
    if (f.isForeignResidence && f.address.trim().length < 10) errors.value.address = 'Укажите страну, город/регион и полный адрес проживания.';
    const phoneError = validatePhoneValue(f.phone, 'Телефон');
    const parentPhoneError = validatePhoneValue(f.parentPhone, 'Телефон родителя');
    if (phoneError) errors.value.phone = phoneError;
    if (parentPhoneError) errors.value.parentPhone = parentPhoneError;
    if (!f.email?.trim()) errors.value.email = 'Email обязателен для заполнения.';
    if (!f.gender?.trim()) errors.value.gender = 'Пол обязателен для заполнения.';
    
    // Дополнительная валидация email
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
      errors.value.email = 'Введите корректный email адрес.';
    }
    
  } else if (currentStep.value === 2) {
    // Паспортные данные - все поля обязательны
    const passportError = validatePassportValue(f.passport_series);
    if (passportError) errors.value.passport_series = passportError;
    if (!f.passport_issue_date) errors.value.passport_issue_date = 'Дата выдачи паспорта обязательна для заполнения.';
    if (!f.passport_issued_by?.trim()) errors.value.passport_issued_by = 'Орган, выдавший паспорт, обязателен для заполнения.';
    
    // Проверка загрузки файла паспорта
    if (!f.passportScan && !filePreview.value.passportScan) {
      errors.value.passportScan = 'Загрузка скана паспорта обязательна.';
    }
    // Проверка загрузки перевода паспорта
    if (!f.passportTranslation && !filePreview.value.passportTranslation) {
      errors.value.passportTranslation = 'Загрузка нотариально заверенного перевода паспорта обязательна.';
    }
    
  } else if (currentStep.value === 3) {
    // Образование - все поля обязательны
    if (!f.education_level?.trim()) errors.value.education_level = 'Уровень образования обязателен для заполнения.';
    if (!f.education_institution?.trim()) errors.value.education_institution = 'Название учебного заведения обязательно для заполнения.';
    if (!f.education_graduation_year) errors.value.education_graduation_year = 'Год окончания обязателен для заполнения.';
    if (!f.education_document_number?.trim()) errors.value.education_document_number = 'Номер документа об образовании обязателен для заполнения.';
    if (!f.education_document_date) errors.value.education_document_date = 'Дата выдачи документа об образовании обязательна для заполнения.';
    
    // Проверка обязательных файлов
    if (!f.photoFile && !filePreview.value.photoFile) {
      errors.value.photoFile = 'Загрузка фотографии 3х4 см обязательна.';
    }
    if (!f.educationScan && !filePreview.value.educationScan) {
      errors.value.educationScan = 'Загрузка документа об образовании обязательна.';
    }
    
    // Валидация года окончания
    const currentYear = new Date().getFullYear();
    if (f.education_graduation_year && (f.education_graduation_year < 1950 || f.education_graduation_year > currentYear + 1)) {
      errors.value.education_graduation_year = `Год окончания должен быть от 1950 до ${currentYear + 1}.`;
    }
    
  } else if (currentStep.value === 4) {
    // Выбор программ - обязательно выбрать хотя бы одну программу
    if (!f.choices || f.choices.length === 0) {
      errors.value.choices = 'Необходимо выбрать хотя бы одну образовательную программу.';
    } else {
      // Проверяем, что все выбранные программы корректно заполнены
      const invalidChoices = f.choices.filter(choice => !choice.profile_id);
      if (invalidChoices.length > 0) {
      errors.value.choices = 'Пожалуйста, завершите выбор для всех указанных приоритетов.';
      }
    }
    
    // Проверка формы финансирования
    if (!f.funding_form?.trim()) {
      errors.value.funding_form = 'Форма финансирования обязательна для заполнения.';
    }
  } else if (currentStep.value === 5) {
    // На шаге подтверждения: если выбран олимпиады, сертификат обязателен
    if (f.olympiad_participant && !f.olympiadCertificate && !filePreview.value.olympiadCertificate) {
      errors.value.olympiadCertificate = 'Загрузка сертификата олимпиады обязательна.';
    }
  }
  
  return Object.keys(errors.value).length === 0;
}

// Вычисляемое свойство для проверки готовности текущего шага
const isCurrentStepValid = computed(() => {
  const f = form.value;
  
  if (currentStep.value === 1) {
    const isRegionValid = f.isForeignResidence || Boolean(f.region_id);
    const isAddressValid = f.isForeignResidence ? f.address?.trim().length >= 10 : Boolean(f.address?.trim());
    const arePhonesValid = phoneFields.every(field => !validatePhoneValue(f[field], field === 'phone' ? 'Телефон' : 'Телефон родителя'));

    return !!(
      f.lastName?.trim() &&
      f.firstName?.trim() &&
      f.birthDate &&
      isRegionValid &&
      isAddressValid &&
      arePhonesValid &&
      f.email?.trim() &&
      f.gender?.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email || '')
    );
  } else if (currentStep.value === 2) {
    return !!(
      f.passport_series?.trim() &&
      !validatePassportValue(f.passport_series) &&
      f.passport_issue_date &&
      f.passport_issued_by?.trim() &&
      (f.passportScan || filePreview.value.passportScan) &&
      (f.passportTranslation || filePreview.value.passportTranslation)
    );
  } else if (currentStep.value === 3) {
    const currentYear = new Date().getFullYear();
    const isYearValid = f.education_graduation_year && 
                       f.education_graduation_year >= 1950 && 
                       f.education_graduation_year <= currentYear + 1;
    
    return !!(
      f.education_level?.trim() &&
      f.education_institution?.trim() &&
      isYearValid &&
      f.education_document_number?.trim() &&
      f.education_document_date &&
      (f.photoFile || filePreview.value.photoFile) &&
      (f.educationScan || filePreview.value.educationScan)
    );
  } else if (currentStep.value === 4) {
    return !!(
      f.choices &&
      f.choices.length > 0 &&
      f.choices.every(choice => choice.profile_id) &&
      f.funding_form?.trim()
    );
  } else if (currentStep.value === 5) {
    // На шаге подтверждения: если выбран олимпиады, сертификат обязателен
    if (f.olympiad_participant) {
      return !!(f.olympiadCertificate || filePreview.value.olympiadCertificate);
    }
    return true;
  }
  
  return false;
});

// Навигация
function nextStep() {
  // Принудительно запускаем валидацию
  const isValid = validateStep();
  
  if (!isValid) {
    // Показываем детализированное сообщение об ошибках
    const errorFields = Object.keys(errors.value);
    const errorMessages = errorFields.map(field => {
      const fieldLabels = {
        lastName: 'Фамилия',
        firstName: 'Имя',
        birthDate: 'Дата рождения',
        region_id: 'Регион проживания',
        address: 'Полный адрес места проживания',
        phone: 'Телефон',
        parentPhone: 'Телефон родителя',
        email: 'Email',
        gender: 'Пол',
        passport_series: 'Серия и номер паспорта',
        passport_issue_date: 'Дата выдачи паспорта',
        passport_issued_by: 'Орган, выдавший паспорт',
        passportScan: 'Скан паспорта',
        passportTranslation: 'Нотариально заверенный перевод паспорта',
        education_level: 'Уровень образования',
        education_institution: 'Учебное заведение',
        education_graduation_year: 'Год окончания',
        education_document_number: 'Номер документа об образовании',
        education_document_date: 'Дата выдачи документа',
        photoFile: 'Фотография 3х4',
        educationScan: 'Документ об образовании',
        choices: 'Выбор образовательных программ',
        funding_form: 'Форма финансирования'
      };
      
      return fieldLabels[field] || field;
    });
    
    toast.error(`Пожалуйста, заполните следующие обязательные поля: ${errorMessages.join(', ')}`);
    return;
  }
  
  if (currentStep.value < totalSteps) {
    currentStep.value++;
    // Очищаем ошибки при успешном переходе
    errors.value = {};
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
    // Очищаем ошибки при переходе назад
    errors.value = {};
  }
}

// Отправка формы
async function submitForm() {
  if (!validateStep()) {
    toast.error('Пожалуйста, проверьте правильность заполнения всех полей.');
    return;
  }
  
  isSubmitting.value = true;
  submissionProgress.value = 0;
  submissionStatus.value = 'Подготовка данных заявления...';
  
  try {
    // Этап 1: Подготовка данных (10%)
    await new Promise(resolve => setTimeout(resolve, 500));
    submissionProgress.value = 10;
    submissionStatus.value = 'Обработка персональных данных...';
    
    const applicationPayload = { ...form.value };
    
    const dateFields = ['birthDate', 'passport_issue_date', 'education_document_date'];
    dateFields.forEach(field => {
      if (applicationPayload[field] === '') {
        applicationPayload[field] = null;
      }
    });
    
    applicationPayload.document_date = applicationPayload.education_document_date;
    applicationPayload.document_number = applicationPayload.education_document_number || '';
    
    applicationPayload.first_name = applicationPayload.firstName;
    applicationPayload.last_name = applicationPayload.lastName;
    applicationPayload.middle_name = applicationPayload.middleName;
    applicationPayload.birth_date = applicationPayload.birthDate;
    
    applicationPayload.parent_phone = applicationPayload.parentPhone;
    
    delete applicationPayload.passportScan;
    delete applicationPayload.passportTranslation;
    delete applicationPayload.photoFile;
    delete applicationPayload.educationScan;
    delete applicationPayload.olympiadCertificate;
    delete applicationPayload.firstName;
    delete applicationPayload.lastName;
    delete applicationPayload.middleName;
    delete applicationPayload.birthDate;
    delete applicationPayload.parentPhone;
    delete applicationPayload.isForeignResidence;

    // Этап 2: Создание заявления (20%)
    submissionProgress.value = 20;
    submissionStatus.value = 'Создание заявления в системе...';
    
    const createResult = await appStore.createApplication(applicationPayload);
    const { success, data, error, code } = createResult;
    
    if (!success || !data) {
      if (code === 'ACTIVE_APPLICATION_EXISTS') {
        toast.warning(activeApplicationMessage);
        errors.value.submit = activeApplicationMessage;
        return;
      }

      throw new Error(error || 'Не удалось создать заявление');
    }
    
    let applicationId = data.application_id || data.id;
    
    if (!applicationId) {
      try {
        const { data: existingApps } = await appApi
          .from('applications')
          .select('id')
          .limit(1);
        
        if (existingApps && existingApps.length > 0) {
          const testApplicationId = existingApps[0].id;
          toast.warning('ВНИМАНИЕ: Используется тестовый режим загрузки файлов');
          applicationId = testApplicationId;
        } else {
          throw new Error('Не удалось найти существующие заявления для тестирования');
        }
      } catch (testError) {
        throw new Error('Не удалось получить ID созданного заявления. Data: ' + JSON.stringify(data));
      }
    }
    
    // Этап 3: Подготовка файлов для загрузки (30%)
    submissionProgress.value = 30;
    submissionStatus.value = 'Подготовка документов к загрузке...';

    const MAX_UPLOAD_ATTEMPTS = 3;

    async function uploadWithRetry(uploadFn, name, attempt = 1) {
      submissionStatus.value = attempt > 1
        ? `Повтор ${attempt}/${MAX_UPLOAD_ATTEMPTS}: ${name}...`
        : `Загрузка: ${name}...`;

      let result;
      try {
        result = await uploadFn();
      } catch (networkErr) {
        result = { data: null, error: networkErr };
      }

      if (result.error || !result.data?.id) {
        const errMsg = result.error?.message || result.error || `Ошибка загрузки "${name}"`;
        if (attempt < MAX_UPLOAD_ATTEMPTS) {
          const delaySec = attempt * 3;
          submissionStatus.value = `Сбой "${name}", повтор через ${delaySec} сек...`;
          await new Promise(resolve => setTimeout(resolve, delaySec * 1000));
          return uploadWithRetry(uploadFn, name, attempt + 1);
        }
        throw new Error(`Не удалось загрузить "${name}" после ${MAX_UPLOAD_ATTEMPTS} попыток: ${errMsg}`);
      }

      return result;
    }

    const filesToUpload = [];

    if (form.value.passportScan) {
      filesToUpload.push({
        name: 'Скан паспорта',
        fn: () => applicationFiles.upload(applicationId, form.value.passportScan, 'passport_scan', false),
      });
    }

    if (form.value.passportTranslation) {
      filesToUpload.push({
        name: 'Перевод паспорта',
        fn: () => applicationFiles.upload(applicationId, form.value.passportTranslation, 'passport_translation', false),
      });
    }

    if (form.value.photoFile) {
      filesToUpload.push({
        name: 'Фотография 3х4',
        fn: () => applicationFiles.upload(applicationId, form.value.photoFile, 'photo', true),
      });
    }

    if (form.value.educationScan) {
      filesToUpload.push({
        name: 'Документ об образовании',
        fn: () => applicationFiles.upload(applicationId, form.value.educationScan, 'education_scan', false),
      });
    }

    if (form.value.olympiad_participant && form.value.olympiadCertificate) {
      filesToUpload.push({
        name: 'Сертификат олимпиады',
        fn: () => olympiadCertificates.upload(applicationId, form.value.olympiadCertificate),
      });
    }

    // Этап 4: Загрузка файлов последовательно (30% -> 85%)
    if (filesToUpload.length > 0) {
      const total = filesToUpload.length;
      const progressPerFile = 55 / total;

      for (let i = 0; i < filesToUpload.length; i++) {
        const { name, fn } = filesToUpload[i];
        submissionProgress.value = Math.round(30 + i * progressPerFile);
        await uploadWithRetry(fn, name);
        submissionProgress.value = Math.round(30 + (i + 1) * progressPerFile);
        submissionStatus.value = `Загружено: ${name} (${i + 1} из ${total})`;
      }
    } else {
      submissionProgress.value = 85;
    }
    
    // Этап 5: Финализация (85% -> 100%)
    submissionProgress.value = 90;
    submissionStatus.value = 'Отправка заявления в приемную комиссию...';
    
    const submitResult = await appStore.submitApplication(applicationId);
    if (!submitResult.success) {
      throw new Error(submitResult.error || 'Не удалось отправить заявление на рассмотрение');
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    submissionProgress.value = 100;
    submissionStatus.value = 'Заявление успешно отправлено!';
    await new Promise(resolve => setTimeout(resolve, 800));
    
    isSubmitted.value = true;
    applicationNumber.value = applicationId;
    toast.success('Ваше заявление успешно отправлено!');
    
  } catch (err) {
    submissionStatus.value = 'Ошибка при отправке заявления';
    toast.error(err.message || 'Произошла непредвиденная ошибка при отправке заявления.');
    errors.value.submit = err.message;
  } finally {
    isSubmitting.value = false;
  }
}

// Состояния формы
const fileUploading = ref({});
const filePreview = ref({});

// Обработка файлов
const onFileChange = async (file, fieldName) => {
  if (!file) return;
  
  try {
    fileUploading.value[fieldName] = true;
    
    const fileError = validateSelectedFile(file, fieldName);
    if (fileError) throw new Error(fileError);
    
    form.value[fieldName] = file;
    
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
    
    if (errors.value[fieldName]) {
      delete errors.value[fieldName];
    }
  } catch (err) {
    errors.value[fieldName] = err.message || 'Ошибка загрузки файла';
    form.value[fieldName] = null;
    filePreview.value[fieldName] = null;
  } finally {
    fileUploading.value[fieldName] = false;
  }
};

// Просмотр файла
const viewFile = (fieldName) => {
  const file = form.value[fieldName];
  if (!file) return;
  
  if (filePreview.value[fieldName]?.url) {
    window.open(filePreview.value[fieldName].url, '_blank');
  } else {
    const fileUrl = URL.createObjectURL(file);
    window.open(fileUrl, '_blank');
  }
};

// Сброс файла
const resetFile = (fieldName) => {
  form.value[fieldName] = null;
  
  if (filePreview.value[fieldName]?.url) {
    URL.revokeObjectURL(filePreview.value[fieldName].url);
  }
  
  filePreview.value[fieldName] = null;
};

// Форматирование номера телефона
const formatPhoneNumber = (field) => {
  form.value[field] = isForeignResidenceSelected()
    ? formatInternationalPhone(form.value[field])
    : formatUzbekPhone(form.value[field]);

  if (errors.value[field]) delete errors.value[field];
};

const formatPassportSeries = () => {
  form.value.passport_series = normalizePassportSeries(form.value.passport_series, isForeignResidenceSelected());
  if (errors.value.passport_series) delete errors.value.passport_series;
};
</script> 