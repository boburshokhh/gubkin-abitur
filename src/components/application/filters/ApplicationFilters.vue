<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
    <div>
      <label for="status-filter" class="block text-sm font-medium text-gray-700">Статус</label>
      <select id="status-filter" v-model="localFilters.statusId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
        <option :value="null">Все статусы</option>
        <option v-for="status in statuses" :key="status.id" :value="status.id">{{ status.name }}</option>
      </select>
    </div>
    
    <div>
      <label for="level-filter" class="block text-sm font-medium text-gray-700">Уровень</label>
      <select id="level-filter" v-model="localFilters.levelId" @change="resetDirectionAndProfile" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
        <option :value="null">Все уровни</option>
        <option v-for="level in allLevels" :key="level.id" :value="level.id">{{ level.name }}</option>
      </select>
    </div>
    
    <div>
      <label for="direction-filter" class="block text-sm font-medium text-gray-700">Направление</label>
      <select id="direction-filter" v-model="localFilters.directionId" @change="resetProfile" :disabled="!localFilters.levelId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
        <option :value="null">Все направления</option>
        <option v-for="direction in availableDirections" :key="direction.id" :value="direction.id">{{ direction.name }}</option>
      </select>
    </div>

    <div>
      <label for="profile-filter" class="block text-sm font-medium text-gray-700">Профиль</label>
      <select id="profile-filter" v-model="localFilters.profileId" :disabled="!localFilters.directionId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
        <option :value="null">Все профили</option>
        <option v-for="profile in availableProfiles" :key="profile.id" :value="profile.id">{{ profile.name }}</option>
      </select>
    </div>
    
    <div>
      <label for="search-filter" class="block text-sm font-medium text-gray-700">Поиск по ФИО</label>
      <input type="text" id="search-filter" v-model.lazy="localFilters.searchQuery" placeholder="Введите ФИО..." class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
    </div>
  </div>
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