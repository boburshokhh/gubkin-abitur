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
            <DirectionSelectionStep
              v-if="currentStep === 4"
              v-model="form"
              :errors="errors"
              :availableDirections="availableDirections"
              :availableProfiles="availableProfiles"
              :availableSpecialties="availableSpecialties"
              :selectedDirection="selectedDirection"
              @direction-change="onDirectionChange"
              @profile-change="onProfileChange"
            />
            
            <!-- Шаг 5: Подтверждение -->
            <ConfirmationStep
              v-if="currentStep === 5"
              v-model="form"
              :errors="errors"
              :regions="regionsData"
              :availableDirections="availableDirections"
              :availableProfiles="availableProfiles"
              :availableSpecialties="availableSpecialties"
              :selectedDirection="selectedDirection"
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
import { supabase } from '@/api/supabase';

// Импорт компонентов
import ProgressBar from '@/components/register/ProgressBar.vue';
import SubmissionLoader from '@/components/register/SubmissionLoader.vue';
import PersonalInfoStep from '@/components/register/PersonalInfoStep.vue';
import PassportInfoStep from '@/components/register/PassportInfoStep.vue';
import EducationInfoStep from '@/components/register/EducationInfoStep.vue';
import DirectionSelectionStep from '@/components/register/DirectionSelectionStep.vue';
import ConfirmationStep from '@/components/register/ConfirmationStep.vue';
import SuccessMessage from '@/components/register/SuccessMessage.vue';

const router = useRouter();
const appStore = useApplicationStore();
const authStore = useAuthStore();
const toast = useToast();

// Загрузка данных при монтировании компонента
onMounted(async () => {
  isFormLoading.value = true;
  await appStore.loadDirections();
  await appStore.loadDocumentTypes();
  await appStore.loadRegions();
  
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
    form.value.region = authStore.profile.region_id || '';
    
    if (authStore.profile.birth_date) {
      form.value.birthDate = authStore.profile.birth_date;
    }
  }
  
  isFormLoading.value = false;
});

// Данные из хранилища
const availableDirections = computed(() => appStore.allDirections);
const documentTypes = computed(() => appStore.documentTypes);
const regionsData = computed(() => appStore.regions);

// Состояния формы
const isFormLoading = ref(false);
const fileUploading = ref({
  passportScan: false,
  educationScan: false,
  olympiadCertificate: false
});

const filePreview = ref({
  passportScan: null,
  educationScan: null,
  olympiadCertificate: null
});

// Форма и ошибки
const form = ref({
  // Личные данные
  lastName: '',
  firstName: '',
  middleName: '',
  birthDate: '',
  region: '',
  phone: '',
  parentPhone: '',
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
  profile: '',
  specialty: '',
  fundingForm: 'budget',
  
  // Дополнительные параметры
  accommodationNeeded: false,
  olympiadParticipant: false,
  olympiadCertificate: null
});

const errors = ref({});

// Навигация по шагам
const currentStep = ref(1);
const totalSteps = 5;

// Статус отправки
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const applicationNumber = ref('');
const submissionProgress = ref(0);
const submissionStatus = ref('Подготовка данных...');

// Заголовки шагов
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

// Выбранное направление и связанные данные
const selectedDirection = computed(() => {
  if (!form.value.direction) return null;
  return availableDirections.value.find(d => d.id === form.value.direction);
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
  let value = form.value[field];
  
  // Удаляем все нецифровые символы
  value = value.replace(/\D/g, '');
  
  if (value.startsWith('998')) {
    value = value.substring(3);
  }
  
  if (value.length > 9) {
    value = value.substring(0, 9);
  }
  
  if (value.length > 0) {
    let formattedValue = '';
    
    if (value.length > 0) {
      formattedValue += value.substring(0, Math.min(2, value.length));
    }
    
    if (value.length > 2) {
      formattedValue += ' ' + value.substring(2, Math.min(5, value.length));
    }
    
    if (value.length > 5) {
      formattedValue += ' ' + value.substring(5, Math.min(7, value.length));
    }
    
    if (value.length > 7) {
      formattedValue += ' ' + value.substring(7, 9);
    }
    
    form.value[field] = formattedValue;
  }
};

// Валидация номера телефона
const validateUzbekPhoneNumber = (phone) => {
  const phoneRegex = /^(\+998[\s]?)?\d{2}[\s]?\d{3}[\s]?\d{2}[\s]?\d{2}$/;
  return phoneRegex.test(phone) || phoneRegex.test('+998 ' + phone);
};

// Валидация шага
const validateStep = (step) => {
  const newErrors = {};
  
  if (step === 1) {
    if (!form.value.lastName) newErrors.lastName = 'Введите фамилию';
    if (!form.value.firstName) newErrors.firstName = 'Введите имя';
    if (!form.value.birthDate) newErrors.birthDate = 'Выберите дату рождения';
    if (!form.value.region) newErrors.region = 'Выберите регион';
    
    if (!form.value.phone) {
      newErrors.phone = 'Введите номер телефона';
    } else if (!validateUzbekPhoneNumber(form.value.phone)) {
      newErrors.phone = 'Введите корректный номер телефона Узбекистана (+998 XX XXX XX XX)';
    }
    
    if (!form.value.parentPhone) {
      newErrors.parentPhone = 'Введите номер телефона родителя';
    } else if (!validateUzbekPhoneNumber(form.value.parentPhone)) {
      newErrors.parentPhone = 'Введите корректный номер телефона Узбекистана (+998 XX XXX XX XX)';
    }
    
    if (!form.value.email) newErrors.email = 'Введите адрес электронной почты';
    if (!form.value.gender) newErrors.gender = 'Выберите пол';
  }
  
  else if (step === 2) {
    if (!form.value.passportSeries) newErrors.passportSeries = 'Введите серию и номер паспорта';
    if (!form.value.passportIssueDate) newErrors.passportIssueDate = 'Выберите дату выдачи паспорта';
    if (!form.value.passportIssuedBy) newErrors.passportIssuedBy = 'Введите название выдавшего органа';
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
    
    if (availableProfiles.value.length > 0 && !form.value.profile) {
      newErrors.profile = 'Выберите профиль подготовки';
    }
    
    if (availableSpecialties.value.length > 0 && !form.value.specialty) {
      newErrors.specialty = 'Выберите специальность';
    }
    
    if (!form.value.fundingForm) newErrors.fundingForm = 'Выберите форму финансирования';
  }
  
  else if (step === 5) {
    if (form.value.olympiadParticipant && !form.value.olympiadCertificate) {
      newErrors.olympiadCertificate = 'Загрузите сертификат об участии в олимпиаде';
    }
  }
  
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

// Навигация по шагам
const nextStep = () => {
  if (validateStep(currentStep.value)) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// Загрузка документов
const uploadDocument = async (applicationId, documentTypeId, file) => {
  try {
    const docType = documentTypeId === 1 ? 'паспорта' : 
                   documentTypeId === 2 ? 'об образовании' : 
                   'сертификата';
    submissionStatus.value = `Загрузка документа ${docType}...`;
    
    const { success, error } = await appStore.uploadDocument(
      applicationId, 
      documentTypeId, 
      file
    );
    
    if (!success) {
      throw new Error(error || 'Ошибка загрузки документа');
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Ошибка при загрузке документа типа ${documentTypeId}:`, error);
    return { success: false, error };
  }
};

// Отправка формы
const submitForm = async () => {
  if (!validateStep(currentStep.value)) {
    return;
  }
  
  isSubmitting.value = true;
  submissionProgress.value = 10;
  submissionStatus.value = 'Подготовка данных...';
  
  try {
    const phoneFormatted = form.value.phone ? (form.value.phone.startsWith('+998') ? form.value.phone : '+998 ' + form.value.phone) : '';
    const parentPhoneFormatted = form.value.parentPhone ? (form.value.parentPhone.startsWith('+998') ? form.value.parentPhone : '+998 ' + form.value.parentPhone) : '';
    
    const applicationData = {
      direction_id: form.value.direction,
      profile_id: form.value.profile || null,
      specialty_id: form.value.specialty || null,
      study_form: 'full-time',
      funding_form: form.value.fundingForm,
      academic_year: new Date().getFullYear(),
      education_level: form.value.educationLevel,
      education_institution: form.value.educationInstitution,
      education_graduation_year: form.value.educationGraduationYear,
      education_document_number: form.value.documentNumber,
      education_document_date: form.value.documentDate,
      passport_series: form.value.passportSeries,
      passport_issue_date: form.value.passportIssueDate,
      passport_issued_by: form.value.passportIssuedBy,
      accommodation_needed: form.value.accommodationNeeded,
      olympiad_participant: form.value.olympiadParticipant,
      parent_phone: parentPhoneFormatted
    };
    
    submissionProgress.value = 30;
    submissionStatus.value = 'Создание заявления...';
    
    const { success, data, error } = await appStore.createApplication(applicationData);
    
    if (!success) {
      throw new Error(error || 'Не удалось создать заявку');
    }
    
    const applicationId = data.id;
    submissionProgress.value = 50;
    submissionStatus.value = 'Загрузка документов...';
    
    const uploadPromises = [
      uploadDocument(applicationId, 1, form.value.passportScan),
      uploadDocument(applicationId, 2, form.value.educationScan)
    ];
    
    if (form.value.olympiadParticipant && form.value.olympiadCertificate) {
      uploadPromises.push(uploadDocument(applicationId, 3, form.value.olympiadCertificate));
      
      await appStore.createOlympiadCertificate({
        application_id: applicationId,
        name: 'Сертификат олимпиады Университета Губкина',
        year: new Date().getFullYear()
      });
    }
    
    await Promise.all(uploadPromises);
    
    submissionProgress.value = 90;
    submissionStatus.value = 'Завершение процесса...';
    
    if (!authStore.profile || 
        authStore.profile.last_name !== form.value.lastName || 
        authStore.profile.first_name !== form.value.firstName) {
      
      await authStore.updateProfile({
        last_name: form.value.lastName,
        first_name: form.value.firstName,
        middle_name: form.value.middleName,
        phone: phoneFormatted,
        gender: form.value.gender,
        birth_date: form.value.birthDate,
        region_id: form.value.region
      });
    }
    
    submissionProgress.value = 100;
    submissionStatus.value = 'Заявление успешно отправлено!';
    
    isSubmitted.value = true;
    applicationNumber.value = applicationId.toString().padStart(6, '0');
    
    setTimeout(() => {
      toast.success('Заявление успешно отправлено!');
    }, 500);
    
  } catch (error) {
    console.error('Ошибка при отправке заявления:', error);
    toast.error('Произошла ошибка при отправке заявления. Пожалуйста, попробуйте позже.');
    submissionStatus.value = 'Ошибка: ' + (error.message || 'Неизвестная ошибка');
  } finally {
    isSubmitting.value = false;
  }
};
</script> 