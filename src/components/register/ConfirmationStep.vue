<template>
  <div class="space-y-6">
    <el-card shadow="never">
      <template #header>
        <span class="font-medium">Личные данные</span>
      </template>
      <el-descriptions :column="descriptionColumn" border>
        <el-descriptions-item label="Ф.И.О.">{{ modelValue.lastName }} {{ modelValue.firstName }} {{ modelValue.middleName }}</el-descriptions-item>
        <el-descriptions-item label="Дата рождения">{{ formatDate(modelValue.birthDate) }}</el-descriptions-item>
        <el-descriptions-item label="Регион">{{ getRegionName(modelValue.region_id) }}</el-descriptions-item>
        <el-descriptions-item label="Адрес">{{ modelValue.address }}</el-descriptions-item>
        <el-descriptions-item label="Контактный телефон">{{ modelValue.phone }}</el-descriptions-item>
        <el-descriptions-item label="Телефон родителя">{{ modelValue.parentPhone }}</el-descriptions-item>
        <el-descriptions-item label="Email">{{ modelValue.email }}</el-descriptions-item>
        <el-descriptions-item label="Пол">{{ modelValue.gender === 'male' ? 'Мужской' : 'Женский' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <span class="font-medium">Паспортные данные</span>
      </template>
      <el-descriptions :column="descriptionColumn" border>
        <el-descriptions-item label="Серия и номер">{{ modelValue.passport_series }}</el-descriptions-item>
        <el-descriptions-item label="Дата выдачи">{{ formatDate(modelValue.passport_issue_date) }}</el-descriptions-item>
        <el-descriptions-item label="Кем выдан">{{ modelValue.passport_issued_by }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <span class="font-medium">Образование</span>
      </template>
      <el-descriptions :column="descriptionColumn" border>
        <el-descriptions-item label="Уровень образования">{{ getEducationLevelName(modelValue.education_level) }}</el-descriptions-item>
        <el-descriptions-item label="Учебное заведение">{{ modelValue.education_institution }}</el-descriptions-item>
        <el-descriptions-item label="Год окончания">{{ modelValue.education_graduation_year }}</el-descriptions-item>
        <el-descriptions-item label="Документ">
          {{ modelValue.education_document_number }} от {{ formatDate(modelValue.education_document_date) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <span class="font-medium">Выбранные образовательные программы</span>
      </template>
      <div v-if="modelValue.choices?.length" class="space-y-3">
        <el-card v-for="choice in modelValue.choices" :key="choice.priority" shadow="never">
          <el-tag type="primary" effect="light">Приоритет {{ choice.priority }}</el-tag>
          <p class="mt-2">{{ getProfileFullName(choice.profile_id) }}</p>
        </el-card>
        <el-alert
          v-if="selectedProgramExams.length"
          class="confirmation-exams-alert"
          title="Набор вступительных экзаменов"
          type="warning"
          show-icon
          :closable="false"
        >
          <el-space wrap>
            <el-tag
              v-for="exam in selectedProgramExams"
              :key="`${exam.priority}-${exam.name}`"
              type="warning"
              effect="light"
            >
              {{ exam.priority }}. {{ exam.name }}
            </el-tag>
          </el-space>
        </el-alert>
      </div>
      <el-empty v-else description="Образовательные программы не выбраны" />
    </el-card>

    <el-card shadow="never">
      <template #header>
        <span class="font-medium">Дополнительные параметры</span>
      </template>
      <div class="space-y-5">
        <!-- Общежитие -->
        <label class="flex cursor-pointer items-start gap-3">
          <el-checkbox
            :model-value="modelValue.accommodation_needed"
            @update:model-value="updateField('accommodation_needed', $event)"
          />
          <span class="text-sm leading-relaxed text-gray-700">Нуждаюсь в общежитии</span>
        </label>

        <!-- Олимпиада -->
        <label class="flex cursor-pointer items-start gap-3">
          <el-checkbox
            :model-value="modelValue.olympiad_participant"
            @update:model-value="updateField('olympiad_participant', $event)"
          />
          <span class="text-sm leading-relaxed text-gray-700">
            Участвовал в Республиканской олимпиаде по математике / Губкинской предметной олимпиаде
          </span>
        </label>

        <!-- Блок загрузки сертификата (появляется при отметке) -->
        <div v-if="modelValue.olympiad_participant" class="min-w-0 rounded-lg border border-yellow-200 bg-yellow-50 p-4 space-y-4">
          <div class="flex items-start gap-2 text-sm text-yellow-800">
            <el-icon class="mt-0.5 flex-shrink-0"><Warning /></el-icon>
            <span class="min-w-0 break-words">Загрузите цветную копию диплома победителя, призёра или участника олимпиады. Файл должен быть <strong>PDF</strong>.</span>
          </div>
          <el-form label-position="top" class="olympiad-upload-form">
          <FileUploadField
            fieldName="olympiadCertificate"
            label="Сертификат / диплом олимпиады"
            required
            accept=".pdf"
            :isUploading="fileUploading.olympiadCertificate"
            :preview="filePreview.olympiadCertificate"
            :error="errors.olympiadCertificate"
            @change="(file) => emit('file-change', file, 'olympiadCertificate')"
            @view="() => emit('file-view', 'olympiadCertificate')"
            @reset="() => emit('file-reset', 'olympiadCertificate')"
          />
          </el-form>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, onBeforeUnmount } from 'vue';
import { Warning } from '@element-plus/icons-vue';
import FileUploadField from './FileUploadField.vue';
import { useApplicationStore } from '@/stores/application';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  regions: {
    type: Array,
    default: () => []
  },
  availableProfiles: {
    type: Array,
    default: () => []
  },
  availableSpecialties: {
    type: Array,
    default: () => []
  },
  fileUploading: {
    type: Object,
    default: () => ({})
  },
  filePreview: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'file-change', 'file-view', 'file-reset']);

const appStore = useApplicationStore();

const isMobileWidth = ref(typeof window !== 'undefined' && window.innerWidth < 640);
function handleResize() {
  isMobileWidth.value = window.innerWidth < 640;
}
if (typeof window !== 'undefined') {
  window.addEventListener('resize', handleResize);
}
onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('resize', handleResize);
});
const descriptionColumn = computed(() => isMobileWidth.value ? 1 : 2);

function updateField(key, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  });
}

const allRegions = computed(() => {
  const regionsMap = new Map();
  props.regions.forEach(region => regionsMap.set(region.id, region));
  appStore.regions.forEach(region => regionsMap.set(region.id, region));
  return Array.from(regionsMap.values());
});

const selectedProgramExams = computed(() => {
  const firstChoice = [...(props.modelValue.choices || [])]
    .sort((firstChoiceItem, secondChoiceItem) => firstChoiceItem.priority - secondChoiceItem.priority)[0];

  if (!firstChoice) return [];

  return getProfileExams(firstChoice.profile_id);
});

onMounted(async () => {
  if (allRegions.value.length === 0) await appStore.loadRegions();
});

function formatDate(dateString) {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('ru-RU').format(new Date(dateString));
}

function getRegionName(regionId) {
  if (props.modelValue.isForeignResidence) return 'Другая страна';
  if (!regionId) return '';

  const parsedId = typeof regionId === 'string' ? parseInt(regionId, 10) : regionId;
  const region = allRegions.value.find(r => r.id === parsedId || r.id?.toString() === regionId?.toString());
  return region?.name || '';
}

function getEducationLevelName(level) {
  const levels = {
    'high-school': 'Среднее общее (11 классов)',
    college: 'Среднее профессиональное (колледж, техникум)',
    bachelor: 'Высшее - бакалавриат',
    master: 'Высшее - магистратура'
  };
  return levels[level] || '';
}

function getProfileFullName(profileId) {
  if (!profileId) return '';

  const profile = getProfileById(profileId);
  if (!profile) return 'Профиль не найден';

  const direction = appStore.allDirections.find(d => d.id === profile.direction_id);
  return direction ? `${profile.name} (${direction.name || direction.code})` : profile.name;
}

function getProfileById(profileId) {
  return appStore.allProfiles.find(profile => String(profile.id) === String(profileId))
    || props.availableProfiles.find(profile => String(profile.id) === String(profileId))
    || null;
}

function getProfileExams(profileId) {
  const profile = getProfileById(profileId);
  return (profile?.profile_exams || [])
    .map(exam => ({
      priority: exam.priority || 0,
      name: exam.subject?.name || exam.subject_name || exam.name || 'Предмет не указан'
    }))
    .sort((firstExam, secondExam) => firstExam.priority - secondExam.priority);
}
</script>

<style scoped>
.confirmation-exams-alert {
  margin-top: 12px;
}

.olympiad-upload-form {
  min-width: 0;
}

.olympiad-upload-form :deep(.file-upload-field) {
  margin-bottom: 0;
}

/* Мобильный паддинг карточек */
@media (max-width: 639px) {
  :deep(.el-card__body) {
    padding: 12px;
  }
  :deep(.el-descriptions__label),
  :deep(.el-descriptions__content) {
    padding: 8px 10px;
    font-size: 13px;
  }
}
</style>
