<template>
  <div class="space-y-6">
    <el-alert
      title="Выбор образовательных программ"
      description="Можно выбрать до 3 профилей. После первого выбора система покажет только программы с совпадающим набором вступительных испытаний."
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
      <el-card shadow="never">
        <template #header>
          <span class="font-medium">Приоритет 1</span>
        </template>
        <el-form-item label="Профиль/Специализация" required :error="errors.choices">
          <el-select
            v-model="selectedProfiles[0]"
            class="w-full"
            filterable
            placeholder="Выберите профиль"
            :loading="isLoadingProfiles"
            @change="onFirstProfileChange"
          >
            <el-option
              v-for="profile in allProfilesWithDetails"
              :key="profile.id"
              :label="getProfileLabel(profile)"
              :value="profile.id"
            />
          </el-select>
        </el-form-item>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <span class="font-medium">Приоритет 2</span>
        </template>
        <el-form-item label="Профиль/Специализация">
          <el-select
            v-model="selectedProfiles[1]"
            class="w-full"
            filterable
            clearable
            placeholder="Выберите профиль"
            :disabled="!isSecondSelectEnabled"
            :loading="isLoadingProfiles"
            @change="onSecondProfileChange"
          >
            <el-option
              v-for="profile in filteredProfilesForSecondSelect"
              :key="profile.id"
              :label="getProfileLabel(profile)"
              :value="profile.id"
            />
          </el-select>
        </el-form-item>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <span class="font-medium">Приоритет 3</span>
        </template>
        <el-form-item label="Профиль/Специализация">
          <el-select
            v-model="selectedProfiles[2]"
            class="w-full"
            filterable
            clearable
            placeholder="Выберите профиль"
            :disabled="!isThirdSelectEnabled"
            :loading="isLoadingProfiles"
            @change="onThirdProfileChange"
          >
            <el-option
              v-for="profile in filteredProfilesForThirdSelect"
              :key="profile.id"
              :label="getProfileLabel(profile)"
              :value="profile.id"
            />
          </el-select>
        </el-form-item>
      </el-card>
    </div>

    <el-alert
      v-if="compatibleProfiles.length > 0 && selectedProfiles[0]"
      title="Список второго и третьего приоритета ограничен программами с тем же набором вступительных испытаний."
      type="success"
      show-icon
      :closable="false"
    />
  </div>
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

const selectedProfiles = ref([null, null, null]);
const compatibleProfiles = ref([]);
const isLoadingProfiles = ref(false);

const isSecondSelectEnabled = computed(() => !!selectedProfiles.value[0] && compatibleProfiles.value.length > 0);
const isThirdSelectEnabled = computed(() => !!selectedProfiles.value[1] && compatibleProfiles.value.length > 1);

onMounted(() => {
  if (!props.modelValue.choices?.length) return;

  const initialProfiles = [null, null, null];
  props.modelValue.choices.forEach((choice, index) => {
    if (index < 3) initialProfiles[index] = choice.profile_id;
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

const filteredProfilesForSecondSelect = computed(() => {
  if (!compatibleProfiles.value.length || !selectedProfiles.value[0]) return [];

  return compatibleProfiles.value
    .filter(profile => profile.profile_id !== selectedProfiles.value[0])
    .map(profile => allProfilesWithDetails.value.find(p => p.id === profile.profile_id) || profile);
});

const filteredProfilesForThirdSelect = computed(() => {
  if (!compatibleProfiles.value.length || !selectedProfiles.value[0] || !selectedProfiles.value[1]) return [];

  return compatibleProfiles.value
    .filter(profile => profile.profile_id !== selectedProfiles.value[0] && profile.profile_id !== selectedProfiles.value[1])
    .map(profile => allProfilesWithDetails.value.find(p => p.id === profile.profile_id) || profile);
});

function getProfileLabel(profile) {
  const directionName = profile.direction?.name || profile.direction?.code;
  return directionName ? `${profile.name} (${directionName})` : profile.name;
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

async function onFirstProfileChange() {
  selectedProfiles.value[1] = null;
  selectedProfiles.value[2] = null;

  if (selectedProfiles.value[0]) {
    await loadCompatibleProfiles(selectedProfiles.value[0]);
    return;
  }

  compatibleProfiles.value = [];
}

function onSecondProfileChange() {
  selectedProfiles.value[2] = null;
}

function onThirdProfileChange() {}

watch(selectedProfiles, (newSelectedProfiles) => {
  const validChoices = newSelectedProfiles
    .filter(profileId => profileId !== null && profileId !== undefined && profileId !== '')
    .map((profileId, index) => ({
      profile_id: profileId,
      priority: index + 1
    }));

  emit('update:modelValue', { ...props.modelValue, choices: validChoices });
}, { deep: true });
</script>
