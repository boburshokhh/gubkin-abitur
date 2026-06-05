<template>
  <el-card shadow="never">
    <el-form label-position="top" class="application-filters">
      <el-form-item label="Статус">
        <el-select v-model="localFilters.statusId" clearable placeholder="Все статусы">
          <el-option
            v-for="status in statuses"
            :key="status.id"
            :label="status.name"
            :value="status.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <template #label>
          Уровень <el-text type="info" size="small">(только Приоритет 1)</el-text>
        </template>
        <el-select
          v-model="localFilters.levelId"
          clearable
          placeholder="Все уровни"
          @change="resetDirectionAndProfile"
        >
          <el-option
            v-for="level in allLevels"
            :key="level.id"
            :label="level.name"
            :value="level.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <template #label>
          Направление <el-text type="info" size="small">(только Приоритет 1)</el-text>
        </template>
        <el-select
          v-model="localFilters.directionId"
          :disabled="!localFilters.levelId"
          clearable
          filterable
          placeholder="Все направления"
          @change="resetProfile"
        >
          <el-option
            v-for="direction in availableDirections"
            :key="direction.id"
            :label="direction.name"
            :value="direction.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <template #label>
          Профиль <el-text type="info" size="small">(только Приоритет 1)</el-text>
        </template>
        <el-select
          v-model="localFilters.profileId"
          :disabled="!localFilters.directionId"
          clearable
          filterable
          placeholder="Все профили"
        >
          <el-option
            v-for="profile in availableProfiles"
            :key="profile.id"
            :label="profile.name"
            :value="profile.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Поиск по ФИО">
        <el-input v-model.lazy="localFilters.searchQuery" placeholder="Введите ФИО..." clearable />
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { reactive, watch, computed, ref, onMounted } from 'vue';
import { levels as levelsApi, directions as directionsApi, profiles as profilesApi } from '@/api/education';
import { useToast } from 'vue-toastification';

const props = defineProps({
  statuses: Array,
  initialFilters: Object,
});

const emit = defineEmits(['update:filters']);
const toast = useToast();

const localFilters = reactive({ ...props.initialFilters });

const allLevels = ref([]);
const allDirections = ref([]);
const allProfiles = ref([]);

onMounted(async () => {
  try {
    const [levelsRes, directionsRes, profilesRes] = await Promise.all([
      levelsApi.getAll(),
      directionsApi.getAll(),
      profilesApi.getAllWithDetails()
    ]);
    if (levelsRes.error) throw levelsRes.error;
    allLevels.value = levelsRes.data;
    if (directionsRes.error) throw directionsRes.error;
    allDirections.value = directionsRes.data;
    if (profilesRes.error) throw profilesRes.error;
    allProfiles.value = profilesRes.data;
  } catch (e) {
    toast.error('Ошибка загрузки данных для фильтров: ' + e.message);
  }
});

watch(localFilters, (newFilters) => {
  emit('update:filters', newFilters);
}, { deep: true });

function resetDirectionAndProfile() {
    localFilters.directionId = null;
    localFilters.profileId = null;
}

function resetProfile() {
    localFilters.profileId = null;
}

const availableDirections = computed(() => {
  if (!localFilters.levelId) return allDirections.value;
  return allDirections.value.filter(d => d.level_id === localFilters.levelId);
});

const availableProfiles = computed(() => {
  if (!localFilters.directionId) return allProfiles.value.filter(p => availableDirections.value.some(d => d.id === p.direction_id));
  return allProfiles.value.filter(p => p.direction_id === localFilters.directionId);
});
</script>

<style scoped>
.application-filters {
  display: grid;
  grid-template-columns: repeat(5, minmax(180px, 1fr));
  gap: 16px;
}

.application-filters :deep(.el-select) {
  width: 100%;
}

@media (max-width: 1200px) {
  .application-filters {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }
}

@media (max-width: 640px) {
  .application-filters {
    grid-template-columns: 1fr;
  }
}
</style>