<template>
  <el-card shadow="never">
    <div class="application-filters">
      <div class="application-filters__toolbar">
        <el-input
          v-model="localFilters.searchQuery"
          class="application-filters__search"
          placeholder="Поиск: ФИО, телефон, email, ID заявки, паспорт, документ..."
          clearable
        />

        <el-button @click="resetFilters">
          Сбросить
        </el-button>
      </div>

      <div class="application-filters__quick-row">
        <el-text type="info" size="small">Быстрые фильтры:</el-text>
        <el-check-tag
          v-for="quickFilter in quickFilters"
          :key="quickFilter.id"
          :checked="activeQuickFilterId === quickFilter.id"
          @change="applyQuickFilter(quickFilter)"
        >
          {{ quickFilter.label }}
        </el-check-tag>
      </div>

      <el-text type="info" size="small">
        Уровень, направление и профиль применяются к приоритету 1
      </el-text>

      <el-form label-position="top" class="application-filters__grid">
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

        <el-form-item label="Уровень">
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

        <el-form-item label="Направление">
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

        <el-form-item label="Профиль">
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
      </el-form>
    </div>
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
const activeQuickFilterId = ref('all');
let emitTimeout = null;
let lastEmittedFiltersSignature = JSON.stringify(props.initialFilters || {});

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
  activeQuickFilterId.value = getActiveQuickFilterId(newFilters);
  window.clearTimeout(emitTimeout);
  emitTimeout = window.setTimeout(() => {
    const nextFilters = { ...newFilters };
    const nextFiltersSignature = JSON.stringify(nextFilters);
    if (nextFiltersSignature === lastEmittedFiltersSignature) return;

    lastEmittedFiltersSignature = nextFiltersSignature;
    emit('update:filters', nextFilters);
  }, 350);
}, { deep: true });

const quickFilters = computed(() => [
  { id: 'all', label: 'Все заявки', filters: { statusId: null } },
  { id: 'submitted', label: 'Новые', filters: { statusId: getStatusIdByName('Подано') } },
  { id: 'revision', label: 'На доработке', filters: { statusId: getStatusIdByName('Требует доработки') } },
  { id: 'accepted', label: 'Принятые', filters: { statusId: getStatusIdByName('Принято') } },
  { id: 'rejected', label: 'Отклонённые', filters: { statusId: getStatusIdByName('Отклонено') } }
].filter(filter => filter.id === 'all' || filter.filters.statusId));

function resetDirectionAndProfile() {
    localFilters.directionId = null;
    localFilters.profileId = null;
}

function resetProfile() {
    localFilters.profileId = null;
}

function getStatusIdByName(name) {
  return props.statuses?.find(status => status.name === name)?.id || null;
}

function applyQuickFilter(quickFilter) {
  Object.assign(localFilters, {
    ...localFilters,
    statusId: quickFilter.filters.statusId,
  });
  activeQuickFilterId.value = quickFilter.id;
}

function resetFilters() {
  Object.assign(localFilters, {
    statusId: null,
    levelId: null,
    directionId: null,
    profileId: null,
    searchQuery: ''
  });
  activeQuickFilterId.value = 'all';
}

function getActiveQuickFilterId(filters) {
  const match = quickFilters.value.find(filter => filter.filters.statusId === filters.statusId);
  return match?.id || '';
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
  gap: 16px;
}

.application-filters__toolbar {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) auto;
  gap: 12px;
}

.application-filters__search,
.application-filters :deep(.el-select) {
  width: 100%;
}

.application-filters__quick-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.application-filters__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 16px;
}

@media (max-width: 1200px) {
  .application-filters__toolbar {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }

  .application-filters__grid {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }
}

@media (max-width: 640px) {
  .application-filters__toolbar,
  .application-filters__grid {
    grid-template-columns: 1fr;
  }
}
</style>