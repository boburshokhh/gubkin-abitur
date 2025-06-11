<template>
  <div class="min-h-screen bg-gray-50">
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
          
          <!-- Полноэкранный индикатор загрузки -->
          <SubmissionLoader 
            v-if="isSubmitting" 
            :progress="submissionProgress" 
            :status="submissionStatus" 
          />
          
          <!-- Форма подачи заявления -->
          <BaseCard v-if="!isSubmitted">
            <template #header>
              <h2 class="text-xl font-bold text-gray-900">{{ stepTitle }}</h2>
            </template>
            
            <!-- Шаг 1: Личные данные -->
            <PersonalInfoStep
              v-if="currentStep === 1"
              v-model="form"
              :errors="errors"
              :isLoading="isFormLoading"
              @phone-format="formatPhoneNumber"
            />
            
            <!-- Шаг 2: Паспортные данные -->
            <PassportInfoStep
              v-if="currentStep === 2"
              v-model="form"
              :errors="errors"
              :fileUploading="fileUploading"
              :filePreview="filePreview"
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
              :availablePrograms="availablePrograms"
              :availableProfiles="appStore.allProfiles"
              :availableSpecialties="appStore.allSpecialties"
              :fileUploading="fileUploading"
              :filePreview="filePreview"
              @file-change="onFileChange"
              @file-view="viewFile"
              @file-reset="resetFile"
            />
            
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
import { useRouter } from 'vue-router';
import { BaseButton, BaseCard } from '@/components/ui';
import { useAuthStore } from '@/stores/auth';
import { useApplicationStore } from '@/stores/application';
import { useToast } from 'vue-toastification';
import { supabase, documents, applicationFiles, olympiadCertificates } from '@/api/supabase';

// Импорт компонентов
import ProgressBar from '@/components/register/ProgressBar.vue';
import SubmissionLoader from '@/components/register/SubmissionLoader.vue';
import PersonalInfoStep from '@/components/register/PersonalInfoStep.vue';
import PassportInfoStep from '@/components/register/PassportInfoStep.vue';
import EducationInfoStep from '@/components/register/EducationInfoStep.vue';
import ProgramSelectionStep from '@/components/register/ProgramSelectionStep.vue';
import ConfirmationStep from '@/components/register/ConfirmationStep.vue';
import SuccessMessage from '@/components/register/SuccessMessage.vue';

const router = useRouter();
const appStore = useApplicationStore();
const authStore = useAuthStore();
const toast = useToast();

const totalSteps = 5;
const currentStep = ref(1);

const isFormLoading = ref(true);
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const errors = ref({});
const applicationNumber = ref('');

const userApplications = ref([])
const currentApplication = ref(null)
const applicationDocuments = ref([])
const educationLevels = ref([])
const allDirections = ref([])
const allProfiles = ref([])
const documentTypes = ref([])
const regionsData = ref([])
const isLoading = ref(false)
const error = ref(null)

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
  isFormLoading.value = true;
  await Promise.all([
    appStore.loadEducationData(),
    appStore.loadDocumentTypes(),
    appStore.loadRegions()
  ]);
  
  // console.log('Регионы после загрузки:', appStore.regions);
  // Сохраняем регионы в локальный массив для гарантированного доступа
  regionsData.value = [...appStore.regions];
  // console.log('Локальная копия регионов:', regionsData.value);
  
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
    form.value.birthDate = p.birth_date || null; // null вместо пустой строки
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
  
  if (currentStep.value === 5) {
    console.log('Данные формы на шаге подтверждения:', JSON.stringify(f));
  }
  
  if (currentStep.value === 1) {
    if (!f.lastName || !f.firstName) errors.value.name = 'Фамилия и имя обязательны.';
    if (!f.birthDate) errors.value.birthDate = 'Дата рождения обязательна.';
    if (!f.phone) errors.value.phone = 'Телефон обязателен.';
    if (!f.email) errors.value.email = 'Email обязателен.';
  } else if (currentStep.value === 2) {
    // console.log('passport_series',f.passport_series,f.passport_issue_date,f.passport_issued_by);
    if (!f.passport_series) errors.value.passport_series = 'Серия и номер паспорта обязательны.';
    if (!f.passport_issue_date) errors.value.passport_issue_date = 'Дата выдачи обязательна.';
    if (!f.passport_issued_by) errors.value.passport_issued_by = 'Кем выдан паспорт, обязательно.';
    
    // Проверка обязательного файла скана паспорта
    if (!f.passportScan && !filePreview.value.passportScan) {
      errors.value.passportScan = 'Загрузка скана паспорта обязательна.';
    }
  } else if (currentStep.value === 3) {
    if (!f.education_level) errors.value.education_level = 'Уровень образования обязателен.';
    if (!f.education_institution) errors.value.education_institution = 'Учебное заведение обязательно.';
    if (!f.education_document_number) errors.value.education_document_number = 'Номер документа об образовании обязателен.';
    if (!f.education_document_date) errors.value.education_document_date = 'Дата документа об образовании обязательна.';
    
    // Проверка обязательных файлов
    if (!f.photoFile && !filePreview.value.photoFile) {
      errors.value.photoFile = 'Загрузка фотографии 3х4 см обязательна.';
    }
    if (!f.educationScan && !filePreview.value.educationScan) {
      errors.value.educationScan = 'Загрузка документа об образовании обязательна.';
    }
  } else if (currentStep.value === 4) {
    if (!f.choices || f.choices.length === 0) {
      errors.value.choices = 'Необходимо выбрать хотя бы одну образовательную программу.';
    } else if (f.choices.some(c => !c.profile_id)) {
      errors.value.choices = 'Пожалуйста, завершите выбор для всех указанных приоритетов.';
    } else if (f.choices.length > 1) {
      // Проверяем, что все выбранные профили имеют одинаковый набор экзаменов
      // Эта проверка выполняется на клиенте для быстрой обратной связи
      // Дополнительная проверка будет выполнена на сервере при отправке формы
      const firstProfileId = f.choices[0].profile_id;
      
      // Проверка уже выполнена в компоненте ProgramSelectionStep,
      // здесь просто проверяем, что у нас есть совместимые профили
      if (firstProfileId) {
        // Фактически, проверка уже выполнена при выборе профилей в ProgramSelectionStep
        // Если пользователь смог выбрать профили, значит они имеют одинаковый набор экзаменов
        // Но можно добавить дополнительную проверку, если необходимо
      }
    }
  }
  
  return Object.keys(errors.value).length === 0;
}

// Навигация
function nextStep() {
  // console.log('nextStep',validateStep());
  if (validateStep()) {
    if (currentStep.value < totalSteps) currentStep.value++;
  } else {
    toast.warning('Пожалуйста, заполните все обязательные поля.');
  }
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--;
}

// Отправка формы
async function submitForm() {
  if (!validateStep()) {
    toast.error('Пожалуйста, проверьте правильность заполнения всех полей.');
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // Подготавливаем данные для отправки, заменяя пустые строки в полях дат на null
    const applicationPayload = { ...form.value };
    
    // Обрабатываем поля дат - заменяем пустые строки на null
    const dateFields = ['birthDate', 'passport_issue_date', 'education_document_date'];
    dateFields.forEach(field => {
      if (applicationPayload[field] === '') {
        applicationPayload[field] = null;
      }
    });
    
    // Обрабатываем обязательные поля document_date и document_number
    // Сопоставляем их с education_document_date и education_document_number
    applicationPayload.document_date = applicationPayload.education_document_date;
    applicationPayload.document_number = applicationPayload.education_document_number || '';
    
    // Убираем поля файлов, которые не относятся к таблице applications
    delete applicationPayload.passportScan;
    delete applicationPayload.photoFile;
    delete applicationPayload.educationScan;
    delete applicationPayload.olympiadCertificate;

    const { success, data, error } = await appStore.createApplication(applicationPayload);
    
    if (!success || !data) {
      throw new Error(error || 'Не удалось создать заявление');
    }
    
    const applicationId = data.id;
    
    // Загружаем обязательные файлы
    const fileUploads = [];
    
    // Загрузка скана паспорта (в application_files с категорией 'passport_scan')
    if (form.value.passportScan) {
      fileUploads.push(
        applicationFiles.upload(applicationId, form.value.passportScan, 'passport_scan', false)
      );
    }
    
    // Загрузка фотографии (в application_files с категорией 'photo')
    if (form.value.photoFile) {
      fileUploads.push(
        applicationFiles.upload(applicationId, form.value.photoFile, 'photo', true)
      );
    }
    
    // Загрузка документа об образовании (в application_files с категорией 'education_scan')
    if (form.value.educationScan) {
      fileUploads.push(
        applicationFiles.upload(applicationId, form.value.educationScan, 'education_scan', false)
      );
    }
    
    // Загрузка сертификата олимпиады (если есть)
    if (form.value.olympiad_participant && form.value.olympiadCertificate) {
      fileUploads.push(
        olympiadCertificates.upload(applicationId, form.value.olympiadCertificate)
      );
    }
    
    // Ждем завершения всех загрузок
    if (fileUploads.length > 0) {
      const uploadResults = await Promise.allSettled(fileUploads);
      
      // Проверяем результаты загрузки
      const failedUploads = uploadResults.filter(result => result.status === 'rejected');
      if (failedUploads.length > 0) {
        console.error('Некоторые файлы не удалось загрузить:', failedUploads);
        toast.warning('Заявление создано, но некоторые файлы не удалось загрузить. Пожалуйста, добавьте их позже в личном кабинете.');
      }
    }
    
    isSubmitted.value = true;
    applicationNumber.value = applicationId;
    toast.success('Ваше заявление успешно отправлено!');
    
  } catch (err) {
    console.error('Ошибка при отправке заявления:', err);
    toast.error(err.message || 'Произошла непредвиденная ошибка при отправке заявления.');
    errors.value.submit = err.message;
  } finally {
    isSubmitting.value = false;
  }
}

// Данные из хранилища
const availablePrograms = computed(() => appStore.programsForSelection);
// Состояния формы
const fileUploading = ref({});
const filePreview = ref({});

// Выбранное направление и связанные данные
const selectedDirection = computed(() => {
  if (!form.value.direction) return null;
  return availablePrograms.value.find(d => d.id === form.value.direction);
});

const availableProfiles = ref([]);
const availableSpecialties = ref([]);

// Обработчик изменения направления
const onDirectionChange = async () => {
  form.value.profile = '';
  form.value.specialty = '';
  availableProfiles.value = [];
  availableSpecialties.value = [];
  
  if (!form.value.direction) return;
  
  try {
    const { data: profilesData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('direction_id', form.value.direction);
    
    if (error) throw error;
    
    if (profilesData && profilesData.length > 0) {
      availableProfiles.value = profilesData;
    }
  } catch (error) {
    console.error('Ошибка при загрузке профилей:', error);
    toast.error('Не удалось загрузить профили для выбранного направления');
  }
};

// Обработчик изменения профиля
const onProfileChange = async () => {
  form.value.specialty = '';
  availableSpecialties.value = [];
  
  if (!form.value.profile) return;
  
  try {
    const { data: specialtiesData, error } = await supabase
      .from('specialties')
      .select('*')
      .eq('profile_id', form.value.profile);
    
    if (error) throw error;
    
    if (specialtiesData && specialtiesData.length > 0) {
      availableSpecialties.value = specialtiesData;
    }
  } catch (error) {
    console.error('Ошибка при загрузке специальностей:', error);
    toast.error('Не удалось загрузить специальности для выбранного профиля');
  }
};

// Обработка файлов
const onFileChange = async (file, fieldName) => {
  if (!file) return;
  
  try {
    fileUploading.value[fieldName] = true;
    
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      throw new Error('Неподдерживаемый тип файла. Допустимые форматы: JPG, PNG, PDF');
    }
    
    if (file.size > maxSize) {
      throw new Error('Размер файла превышает допустимый максимум (10MB)');
    }
    
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
  // Оставляем номер как есть, без форматирования и валидации
  // Можно добавить + в начало, если нужно отображать со знаком плюса
  if (form.value[field] && !form.value[field].startsWith('+')) {
    form.value[field] = '+' + form.value[field];
  }
};
</script> 