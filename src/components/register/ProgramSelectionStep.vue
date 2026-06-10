<template>
  <el-form label-position="top" class="register-step-form">
    <el-alert
      title="Выбор образовательных программ"
      description="Можно выбрать до 5 профилей или специализаций. После первого выбора система покажет только программы с совпадающим набором вступительных испытаний."
      type="info"
      show-icon
      :closable="false"
    />

    <el-alert
      v-if="errors.choices"
      :title="errors.choices"
      type="error"
      show-icon
      :closable="false"
    />

    <div class="space-y-4">
      <el-card v-for="priorityIndex in maxProfileChoices" :key="priorityIndex" shadow="never">
        <template #header>
          <span class="font-medium">Приоритет {{ priorityIndex }}</span>
        </template>
        <el-form-item
          label="Профиль/Специализация"
          :required="priorityIndex === 1"
          :error="priorityIndex === 1 ? errors.choices : ''"
        >
          <el-select
            v-model="selectedProfiles[priorityIndex - 1]"
            class="w-full"
            filterable
            clearable
            placeholder="Выберите профиль"
            :disabled="isProfileSelectDisabled(priorityIndex - 1)"
            :loading="isLoadingProfiles"
            @change="onProfileChange(priorityIndex - 1)"
          >
            <el-option
              v-for="profile in getProfilesForPriority(priorityIndex - 1)"
              :key="profile.id"
              :label="getProfileLabel(profile)"
              :value="profile.id"
            />
          </el-select>
        </el-form-item>

        <el-text
          v-if="getSelectedProfile(priorityIndex - 1)"
          class="block mt-3"
          type="info"
        >
          Срок обучения: {{ getProfileDurationText(getSelectedProfile(priorityIndex - 1)) }}
        </el-text>
      </el-card>
    </div>

    <el-alert
      v-if="compatibleProfiles.length > 0 && selectedProfiles[0]"
      title="Список последующих приоритетов ограничен программами с тем же набором вступительных испытаний."
      type="success"
      show-icon
      :closable="false"
    />
  </el-form>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useApplicationStore } from '@/stores/application';
import { profiles as profilesApi } from '@/api/education';
import { useToast } from 'vue-toastification';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue']);

const appStore = useApplicationStore();
const toast = useToast();

const maxProfileChoices = 5;
const selectedProfiles = ref(Array(maxProfileChoices).fill(null));
const compatibleProfiles = ref([]);
const isLoadingProfiles = ref(false);

onMounted(() => {
  if (!props.modelValue.choices?.length) return;

  const initialProfiles = Array(maxProfileChoices).fill(null);
  props.modelValue.choices.forEach((choice, index) => {
    if (index < maxProfileChoices) initialProfiles[index] = choice.profile_id;
  });

  selectedProfiles.value = initialProfiles;
  if (selectedProfiles.value[0]) loadCompatibleProfiles(selectedProfiles.value[0]);
});

const allProfilesWithDetails = computed(() => {
  return appStore.allProfiles.map(profile => {
    const direction = appStore.allDirections.find(d => d.id === profile.direction_id);
    return {
      ...profile,
      direction: direction || { name: '', code: '' }
    };
  });
});

const compatibleProfilesWithDetails = computed(() => {
  if (!compatibleProfiles.value.length || !selectedProfiles.value[0]) return [];

  return compatibleProfiles.value
    .map(profile => allProfilesWithDetails.value.find(p => p.id === profile.profile_id) || profile);
});

function getProfileLabel(profile) {
  const directionName = profile.direction?.name || profile.direction?.code;
  const baseLabel = directionName ? `${profile.name} (${directionName})` : profile.name;
  const durationText = getProfileDurationText(profile);
  return durationText ? `${baseLabel} - ${durationText}` : baseLabel;
}

function getProfilesForPriority(index) {
  if (index === 0) return allProfilesWithDetails.value;
  if (!selectedProfiles.value[0]) return [];

  const selectedBeforeCurrent = selectedProfiles.value.filter((profileId, selectedIndex) => (
    selectedIndex !== index && profileId !== null && profileId !== undefined && profileId !== ''
  )).map(profileId => String(profileId));

  return compatibleProfilesWithDetails.value.filter(profile => !selectedBeforeCurrent.includes(String(profile.id)));
}

function getSelectedProfile(index) {
  const profileId = selectedProfiles.value[index];
  if (!profileId) return null;

  return allProfilesWithDetails.value.find(profile => String(profile.id) === String(profileId)) || null;
}

function getProfileDurationText(profile) {
  if (!profile?.duration_years) return '';

  const duration = Number(profile.duration_years);
  if (!Number.isFinite(duration)) return `${profile.duration_years} лет`;

  const formattedDuration = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(duration);
  if (!Number.isInteger(duration)) return `${formattedDuration} года`;

  const lastDigit = duration % 10;
  const lastTwoDigits = duration % 100;
  if (lastDigit === 1 && lastTwoDigits !== 11) return `${formattedDuration} год`;
  if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) return `${formattedDuration} года`;
  return `${formattedDuration} лет`;
}

function isProfileSelectDisabled(index) {
  if (index === 0) return false;
  if (isLoadingProfiles.value) return true;
  if (!selectedProfiles.value[index - 1]) return true;

  return getProfilesForPriority(index).length === 0;
}

async function loadCompatibleProfiles(profileId) {
  if (!profileId) return;

  isLoadingProfiles.value = true;

  try {
    const { data, error } = await profilesApi.getWithSameExams(profileId);
    if (error) {
      toast.error('Не удалось загрузить совместимые профили');
      console.error('Ошибка загрузки совместимых профилей:', error);
      return;
    }

    compatibleProfiles.value = data || [];
  } catch (err) {
    toast.error('Произошла ошибка при загрузке совместимых профилей');
    console.error('Ошибка загрузки совместимых профилей:', err);
  } finally {
    isLoadingProfiles.value = false;
  }
}

async function onProfileChange(index) {
  selectedProfiles.value = selectedProfiles.value.map((profileId, profileIndex) => (
    profileIndex > index ? null : profileId
  ));

  if (index === 0 && selectedProfiles.value[0]) {
    await loadCompatibleProfiles(selectedProfiles.value[0]);
    return;
  }

  if (index === 0) compatibleProfiles.value = [];
}

function getChoicesFromSelectedProfiles(selectedProfileIds) {
  return selectedProfileIds
    .filter(profileId => profileId !== null && profileId !== undefined && profileId !== '')
    .map((profileId, index) => ({
      profile_id: profileId,
      priority: index + 1
    }));
}

function areChoicesEqual(nextChoices) {
  return JSON.stringify(props.modelValue.choices || []) === JSON.stringify(nextChoices);
}

watch(selectedProfiles, (newSelectedProfiles) => {
  const validChoices = getChoicesFromSelectedProfiles(newSelectedProfiles);
  if (areChoicesEqual(validChoices)) return;

  emit('update:modelValue', { ...props.modelValue, choices: validChoices });
}, { deep: true });
</script>

<style scoped>
.register-step-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  justify-content: flex-start;
  height: auto;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 500;
  line-height: 1.35;
}

:deep(.el-form-item__content),
:deep(.el-select) {
  width: 100%;
}
</style>
