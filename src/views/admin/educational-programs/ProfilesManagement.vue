<template>
  <el-card shadow="never" class="profiles-management">
    <template #header>
      <div class="profiles-management__header">
        <div>
          <h3 class="profiles-management__title">Управление профилями и специализациями</h3>
          <el-text type="info">Добавление и редактирование профилей образовательных программ</el-text>
        </div>
        <el-button type="primary" :icon="Plus" @click="openCreateProfileModal">
          Добавить профиль
        </el-button>
      </div>
    </template>

    <el-form label-position="top" class="profiles-management__filters">
      <el-form-item label="Уровень образования">
        <el-select v-model="filters.levelId" clearable placeholder="Все уровни">
          <el-option
            v-for="level in educationLevels"
            :key="level.id"
            :label="level.name"
            :value="level.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Направление">
        <el-select v-model="filters.directionId" clearable filterable placeholder="Все направления">
          <el-option
            v-for="direction in filteredDirections"
            :key="direction.id"
            :label="`${direction.code} - ${direction.name}`"
            :value="direction.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Поиск">
        <el-input v-model="filters.search" placeholder="Название профиля..." clearable />
      </el-form-item>
    </el-form>

    <el-table
      v-loading="isLoading"
      :data="filteredProfiles"
      row-key="id"
      border
      stripe
      empty-text="Профили не найдены"
    >
      <el-table-column label="Профиль/Специализация" min-width="280">
        <template #default="{ row }">
          <el-text tag="div" class="profiles-management__profile-name">{{ row.name }}</el-text>
          <el-text v-if="row.description" type="info" size="small" truncated>
            {{ row.description }}
          </el-text>
        </template>
      </el-table-column>

      <el-table-column label="Направление" min-width="260">
        <template #default="{ row }">
          <template v-if="row.direction">
            <el-tag type="success" effect="light">{{ row.direction.code }}</el-tag>
            <el-text tag="div">{{ row.direction.name }}</el-text>
          </template>
          <el-text v-else type="info">Не указано</el-text>
        </template>
      </el-table-column>

      <el-table-column label="Уровень" width="170">
        <template #default="{ row }">
          <el-tag v-if="row.direction?.level" :type="getLevelTagType(row.direction.level.name)" effect="light">
            {{ row.direction.level.name }}
          </el-tag>
          <el-text v-else type="info">Не указано</el-text>
        </template>
      </el-table-column>

      <el-table-column label="Вступительные экзамены" min-width="260">
        <template #default="{ row }">
          <el-space v-if="row.profile_exams?.length" wrap>
            <el-tag
              v-for="exam in row.profile_exams"
              :key="`${row.id}-${exam.subject_id}`"
              type="primary"
              effect="light"
            >
              {{ exam.priority }}. {{ exam.subject ? exam.subject.name : getSubjectName(exam.subject_id) }}
            </el-tag>
          </el-space>
          <el-text v-else type="info">Экзамены не настроены</el-text>
        </template>
      </el-table-column>

      <el-table-column label="Действия" width="170" align="right" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button size="small" :icon="Edit" @click="openEditProfileModal(row)">
              Изменить
            </el-button>
            <el-button size="small" type="danger" :icon="Delete" @click="confirmDeleteProfile(row.id)" />
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="showProfileModal"
      :title="currentProfile.id ? 'Редактирование профиля' : 'Добавление профиля'"
      width="760px"
    >
      <el-form :model="currentProfile" label-position="top" @submit.prevent="saveProfile">
        <el-divider content-position="left">Основная информация</el-divider>

        <el-form-item label="Название профиля/специализации" required>
          <el-input
            v-model="currentProfile.name"
            placeholder="Например: Бурение нефтяных и газовых скважин (УРБ)"
          />
        </el-form-item>

        <div class="profiles-management__dialog-grid">
          <el-form-item label="Уровень образования" required>
            <el-select
              v-model="selectedLevelId"
              placeholder="Выберите уровень"
              class="profiles-management__select"
              @change="onLevelChange"
            >
              <el-option
                v-for="level in educationLevels"
                :key="level.id"
                :label="level.name"
                :value="level.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="Направление" required>
            <el-select
              v-model="currentProfile.direction_id"
              placeholder="Выберите направление"
              class="profiles-management__select"
              filterable
            >
              <el-option
                v-for="direction in directionsForSelectedLevel"
                :key="direction.id"
                :label="`${direction.code} - ${direction.name}`"
                :value="direction.id"
              />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="Описание">
          <el-input
            v-model="currentProfile.description"
            type="textarea"
            :rows="3"
            placeholder="Краткое описание профиля и особенностей подготовки..."
          />
        </el-form-item>

        <el-divider content-position="left">Вступительные экзамены</el-divider>

        <div class="profiles-management__exams">
          <el-card
            v-for="(exam, index) in currentProfile.exams"
            :key="index"
            shadow="never"
            class="profiles-management__exam"
          >
            <el-form-item :label="`Экзамен ${exam.priority}`" required>
              <el-select
                v-model="exam.subject_id"
                placeholder="Выберите предмет"
                class="profiles-management__select"
              >
                <el-option
                  v-for="subject in allSubjects"
                  :key="subject.id"
                  :label="subject.name"
                  :value="subject.id"
                />
              </el-select>
            </el-form-item>
            <el-button type="danger" plain :icon="Delete" @click="removeExam(index)">
              Удалить
            </el-button>
          </el-card>
        </div>

        <el-button plain :icon="Plus" class="profiles-management__add-exam" @click="addExam">
          Добавить экзамен
        </el-button>
      </el-form>

      <template #footer>
        <el-button @click="closeProfileModal">Отмена</el-button>
        <el-button type="primary" :loading="isSaving" @click="saveProfile">
          {{ currentProfile.id ? 'Обновить профиль' : 'Создать профиль' }}
        </el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { levels as levelsApi, directions as directionsApi, profiles as profilesApi, subjects as subjectsApi } from '@/api/education';
import { ElMessageBox } from 'element-plus';
import { Delete, Edit, Plus } from '@element-plus/icons-vue';

// Состояние компонента
const isLoading = ref(false);
const isSaving = ref(false);
const toast = useToast();

// Данные
const educationLevels = ref([]);
const allDirections = ref([]);
const allProfiles = ref([]);
const allSubjects = ref([]);

// Фильтры
const filters = reactive({
  levelId: null,
  directionId: null,
  search: ''
});

// Модальное окно профиля
const showProfileModal = ref(false);
const selectedLevelId = ref(null);

// Начальный объект профиля
const initialProfile = () => ({
  id: null,
  name: '',
  description: '',
  direction_id: null,
  exams: []
});

const currentProfile = ref(initialProfile());

// Вычисляемые свойства
const filteredDirections = computed(() => {
  if (!filters.levelId) return allDirections.value;
  return allDirections.value.filter(d => d.level_id === filters.levelId);
});

const directionsForSelectedLevel = computed(() => {
  if (!selectedLevelId.value) return [];
  return allDirections.value.filter(d => d.level_id === selectedLevelId.value);
});

const filteredProfiles = computed(() => {
  let result = [...allProfiles.value];
  
  // Фильтрация по уровню образования
  if (filters.levelId) {
    result = result.filter(p => 
      p.direction && 
      p.direction.level && 
      p.direction.level.id === filters.levelId
    );
  }
  
  // Фильтрация по направлению
  if (filters.directionId) {
    result = result.filter(p => p.direction_id === filters.directionId);
  }
  
  // Поиск по названию
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      (p.description && p.description.toLowerCase().includes(searchLower))
    );
  }
  
  return result;
});

// Жизненный цикл
onMounted(async () => {
  await fetchData();
});

// Методы
async function fetchData() {
  isLoading.value = true;
  try {
    const [levelsRes, directionsRes, profilesRes, subjectsRes] = await Promise.all([
      levelsApi.getAll(),
      directionsApi.getAll(),
      profilesApi.getAllWithDetails(),
      subjectsApi.getAll()
    ]);
    
    if (levelsRes.error) throw new Error(levelsRes.error.message);
    educationLevels.value = levelsRes.data || [];
    
    if (directionsRes.error) throw new Error(directionsRes.error.message);
    allDirections.value = directionsRes.data || [];
    
    if (profilesRes.error) throw new Error(profilesRes.error.message);
    allProfiles.value = profilesRes.data || [];
    
    if (subjectsRes.error) throw new Error(subjectsRes.error.message);
    allSubjects.value = subjectsRes.data || [];
    
  } catch (error) {
    toast.error(`Ошибка загрузки данных: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
}

function getSubjectName(subjectId) {
  const subject = allSubjects.value.find(s => s.id === subjectId);
  return subject ? subject.name : 'Неизвестный предмет';
}

function getLevelTagType(levelName) {
  switch (levelName) {
    case 'Бакалавриат':
      return 'primary';
    case 'Специалитет':
      return 'success';
    case 'Магистратура':
      return 'warning';
    default:
      return 'info';
  }
}

function onLevelChange() {
  // Сброс выбранного направления при изменении уровня
  currentProfile.value.direction_id = null;
}

function openCreateProfileModal() {
  currentProfile.value = initialProfile();
  selectedLevelId.value = null;
  showProfileModal.value = true;
}

function openEditProfileModal(profile) {
  // Находим направление для определения уровня образования
  const direction = allDirections.value.find(d => d.id === profile.direction_id);
  selectedLevelId.value = direction ? direction.level_id : null;
  
  // Копируем профиль и преобразуем его экзамены в формат для формы
  currentProfile.value = {
    ...profile,
    // Если нет exams, создаем пустой массив
    exams: profile.profile_exams 
      ? profile.profile_exams.map(pe => ({ 
          subject_id: pe.subject ? pe.subject.id : pe.subject_id, 
          priority: pe.priority
        })) 
      : []
  };
  
  showProfileModal.value = true;
}

function closeProfileModal() {
  showProfileModal.value = false;
  currentProfile.value = initialProfile();
  selectedLevelId.value = null;
}

async function saveProfile() {
  if (!currentProfile.value.direction_id) {
    toast.error('Необходимо выбрать направление');
    return;
  }
  
  // Проверка на дублирование предметов в экзаменах
  const subjectIds = currentProfile.value.exams.filter(e => e.subject_id).map(e => e.subject_id);
  const uniqueSubjectIds = [...new Set(subjectIds)];
  if (subjectIds.length !== uniqueSubjectIds.length) {
    toast.error('В списке экзаменов есть повторяющиеся предметы');
    return;
  }
  
  isSaving.value = true;
  try {
    const payload = { ...currentProfile.value };
    
    if (payload.id) {
      // Обновление существующего профиля
      const { data, error } = await profilesApi.update(payload.id, payload);
      
      if (error) throw new Error(error.message);
      
      toast.success('Профиль успешно обновлен');
    } else {
      // Создание нового профиля
      const { data, error } = await profilesApi.create(payload);
      
      if (error) throw new Error(error.message);
      
      toast.success('Профиль успешно создан');
    }
    
    // Закрытие модального окна и обновление данных
    closeProfileModal();
    await fetchData();
    
  } catch (error) {
    toast.error(`Ошибка при сохранении профиля: ${error.message}`);
  } finally {
    isSaving.value = false;
  }
}

async function confirmDeleteProfile(profileId) {
  try {
    await ElMessageBox.confirm(
      'Вы уверены, что хотите удалить этот профиль? Это действие нельзя отменить.',
      'Подтверждение удаления',
      {
        confirmButtonText: 'Удалить',
        cancelButtonText: 'Отмена',
        type: 'warning'
      }
    );

    try {
      const { error } = await profilesApi.delete(profileId);
      
      if (error) throw new Error(error.message);
      
      toast.success('Профиль успешно удален');
      await fetchData();
      
    } catch (error) {
      toast.error(`Ошибка при удалении профиля: ${error.message}`);
    }
  } catch {
    // Пользователь отменил удаление.
  }
}

function addExam() {
  currentProfile.value.exams.push({
    subject_id: null,
    priority: currentProfile.value.exams.length + 1
  });
}

function removeExam(index) {
  currentProfile.value.exams.splice(index, 1);
  
  // Перенумеруем приоритеты
  currentProfile.value.exams.forEach((exam, idx) => {
    exam.priority = idx + 1;
  });
}
</script>

<style scoped>
.profiles-management__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.profiles-management__title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.profiles-management__filters {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 16px;
  padding: 16px;
  margin-bottom: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}

.profiles-management__profile-name {
  font-weight: 600;
}

.profiles-management__dialog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 16px;
}

.profiles-management__select {
  width: 100%;
}

.profiles-management__exams {
  display: grid;
  gap: 12px;
}

.profiles-management__exam {
  background: var(--el-fill-color-lighter);
}

.profiles-management__add-exam {
  width: 100%;
  margin-top: 12px;
}

@media (max-width: 768px) {
  .profiles-management__header,
  .profiles-management__dialog-grid {
    align-items: flex-start;
    grid-template-columns: 1fr;
  }

  .profiles-management__header {
    flex-direction: column;
  }

  .profiles-management__filters {
    grid-template-columns: 1fr;
  }
}
</style>