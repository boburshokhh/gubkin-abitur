<template>
  <div class="space-y-6">
    <el-card shadow="never">
      <template #header>
        <span class="font-medium">Личные данные</span>
      </template>
      <el-descriptions :column="2" border>
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
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Серия и номер">{{ modelValue.passport_series }}</el-descriptions-item>
        <el-descriptions-item label="Дата выдачи">{{ formatDate(modelValue.passport_issue_date) }}</el-descriptions-item>
        <el-descriptions-item label="Кем выдан">{{ modelValue.passport_issued_by }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <span class="font-medium">Образование</span>
      </template>
      <el-descriptions :column="2" border>
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
      </div>
      <el-empty v-else description="Образовательные программы не выбраны" />
    </el-card>

    <el-card shadow="never">
      <template #header>
        <span class="font-medium">Дополнительные параметры</span>
      </template>
      <div class="space-y-4">
        <el-checkbox v-model="modelValue.accommodation_needed">Нуждаюсь в общежитии</el-checkbox>
        <el-checkbox v-model="modelValue.olympiad_participant">
          Участвовал в Республиканской олимпиаде по математике / Губкинской предметной олимпиаде
        </el-checkbox>
        <el-alert
          v-if="modelValue.olympiad_participant"
          title="Загрузите цветную копию диплома победителя, призёра или участника олимпиады. Файл должен быть PDF."
          type="warning"
          show-icon
          :closable="false"
        />
        <FileUploadField
          v-if="modelValue.olympiad_participant"
          fieldName="olympiadCertificate"
          label="Сертификат олимпиады"
          required
          accept=".pdf"
          :isUploading="fileUploading.olympiadCertificate"
          :preview="filePreview.olympiadCertificate"
          :error="errors.olympiadCertificate"
          @change="(file) => emit('file-change', file, 'olympiadCertificate')"
          @view="() => emit('file-view', 'olympiadCertificate')"
          @reset="() => emit('file-reset', 'olympiadCertificate')"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
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

const allRegions = computed(() => {
  const regionsMap = new Map();
  props.regions.forEach(region => regionsMap.set(region.id, region));
  appStore.regions.forEach(region => regionsMap.set(region.id, region));
  return Array.from(regionsMap.values());
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

  const profile = appStore.allProfiles.find(p => p.id === profileId) || props.availableProfiles.find(p => p.id === profileId);
  if (!profile) return 'Профиль не найден';

  const direction = appStore.allDirections.find(d => d.id === profile.direction_id);
  return direction ? `${profile.name} (${direction.name || direction.code})` : profile.name;
}
</script>
