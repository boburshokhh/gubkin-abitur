<template>
  <div class="programs-management">
    <el-page-header title="" content="Образовательные программы">
      <template #extra>
        <el-text type="info">Иерархическое управление уровнями, направлениями и профилями</el-text>
      </template>
    </el-page-header>

    <el-skeleton v-if="isLoading" :rows="8" animated />

    <el-empty
      v-else-if="educationLevels.length === 0"
      description="Сначала необходимо добавить уровни образования и направления."
    />

    <div v-else class="programs-management__levels">
      <el-card v-for="level in educationLevels" :key="level.id" shadow="never">
        <template #header>
          <div class="programs-management__level-header">
            <div>
              <h2 class="programs-management__level-title">{{ level.name }}</h2>
              <el-text type="info">
                {{ getDirectionCount(level.id) }} направлений, {{ getProfileCount(level.id) }} профилей
              </el-text>
            </div>
            <el-button type="primary" :icon="Plus" @click="openDirectionModal(null, level.id)">
              Добавить направление
            </el-button>
          </div>
        </template>

        <el-empty
          v-if="directionsByLevel(level.id).length === 0"
          description="Нет направлений для данного уровня"
        />

        <el-collapse v-else accordion>
          <el-collapse-item
            v-for="direction in directionsByLevel(level.id)"
            :key="direction.id"
            :name="direction.id"
          >
            <template #title>
              <div class="programs-management__direction-title">
                <el-tag type="success" effect="light">{{ direction.code }}</el-tag>
                <span>{{ direction.name }}</span>
                <el-text type="info" size="small">
                  {{ getProfileCountByDirection(direction.id) }} профилей
                </el-text>
                <el-tag :type="direction.is_published === false ? 'info' : 'success'" effect="light">
                  {{ direction.is_published === false ? 'Скрыто' : 'На сайте' }}
                </el-tag>
                <el-tag type="info" effect="plain">порядок: {{ direction.sort_order ?? 0 }}</el-tag>
              </div>
            </template>

            <div class="programs-management__direction-actions">
              <el-button
                type="primary"
                plain
                size="small"
                :icon="Plus"
                @click="openProfileModal(null, direction.id)"
              >
                Добавить профиль
              </el-button>
              <el-button size="small" :icon="Edit" @click="openDirectionModal(direction)">
                Редактировать
              </el-button>
            </div>

            <el-empty
              v-if="profilesByDirection(direction.id).length === 0"
              description="Нет профилей/специализаций"
            />

            <el-table
              v-else
              :data="profilesByDirection(direction.id)"
              row-key="id"
              border
              stripe
            >
              <el-table-column prop="name" label="Профиль/специализация" min-width="260" />
              <el-table-column prop="places" label="Мест" width="90" align="center" />
              <el-table-column prop="sort_order" label="Порядок" width="100" align="center" />
              <el-table-column label="На сайте" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.is_published === false ? 'info' : 'success'" effect="light">
                    {{ row.is_published === false ? 'Скрыт' : 'Показан' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="Экзамены" min-width="260">
                <template #default="{ row }">
                  <el-space v-if="row.profile_exams?.length" wrap>
                    <el-tag
                      v-for="exam in row.profile_exams.slice(0, 3)"
                      :key="exam.subject_id"
                      type="primary"
                      effect="light"
                    >
                      {{ exam.priority }}. {{ exam.subject ? exam.subject.name : getSubjectName(exam.subject_id) }}
                    </el-tag>
                    <el-tag v-if="row.profile_exams.length > 3" type="info">
                      +{{ row.profile_exams.length - 3 }}
                    </el-tag>
                  </el-space>
                  <el-text v-else type="info">Экзамены не настроены</el-text>
                </template>
              </el-table-column>
              <el-table-column label="Действия" width="140" align="right">
                <template #default="{ row }">
                  <el-button-group>
                    <el-button size="small" :icon="Edit" @click="openProfileModal(row)" />
                    <el-button
                      size="small"
                      type="danger"
                      :icon="Delete"
                      @click="confirmDelete('profile', row.id)"
                    />
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </div>

    <el-dialog
      v-model="showDirectionModal"
      :title="currentDirection.id ? 'Редактирование направления' : 'Добавление направления'"
      width="520px"
    >
      <el-form :model="currentDirection" label-position="top" @submit.prevent="saveDirection">
        <el-form-item label="Код направления" required>
          <el-input v-model="currentDirection.code" placeholder="Например: 21.03.01" />
          <el-text type="info" size="small">Стандартный код ФГОС</el-text>
        </el-form-item>
        <el-form-item label="Название направления" required>
          <el-input v-model="currentDirection.name" placeholder="Например: Нефтегазовое дело" />
        </el-form-item>
        <el-form-item label="Порядок отображения">
          <el-input-number v-model="currentDirection.sort_order" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="Показывать на сайте">
          <el-switch v-model="currentDirection.is_published" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeDirectionModal">Отмена</el-button>
        <el-button type="primary" :loading="isSaving" @click="saveDirection">
          Сохранить
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showProfileModal"
      :title="currentProfile.id ? 'Редактирование профиля' : 'Добавление профиля'"
      width="720px"
    >
      <el-form :model="currentProfile" label-position="top" @submit.prevent="saveProfile">
        <el-form-item label="Название профиля/специализации" required>
          <el-input
            v-model="currentProfile.name"
            placeholder="Например: Бурение нефтяных и газовых скважин (УРБ)"
          />
        </el-form-item>

        <el-form-item label="Описание">
          <el-input
            v-model="currentProfile.description"
            type="textarea"
            :rows="3"
            placeholder="Краткое описание профиля..."
          />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="Количество мест">
              <el-input-number v-model="currentProfile.places" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Порядок">
              <el-input-number v-model="currentProfile.sort_order" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Показывать на сайте">
              <el-switch v-model="currentProfile.is_published" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Срок обучения">
              <el-input v-model="currentProfile.duration_years" placeholder="Например: 4.0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Форма финансирования">
              <el-input v-model="currentProfile.tuition_fee" placeholder="Контракт / Бюджет" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Карьерные возможности">
          <el-input v-model="currentProfile.career_info" type="textarea" :rows="2" />
        </el-form-item>

        <el-form-item label="Практика / стажировки">
          <el-input v-model="currentProfile.internship_info" type="textarea" :rows="2" />
        </el-form-item>

        <el-divider content-position="left">Вступительные экзамены</el-divider>

        <div class="programs-management__exams">
          <el-card
            v-for="(exam, index) in currentProfile.exams"
            :key="index"
            shadow="never"
            class="programs-management__exam"
          >
            <el-form-item :label="`Экзамен ${exam.priority}`">
              <el-select v-model="exam.subject_id" placeholder="Выберите предмет" class="programs-management__select">
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

        <el-button plain :icon="Plus" class="programs-management__add-exam" @click="addExam">
          Добавить экзамен
        </el-button>
      </el-form>

      <template #footer>
        <el-button @click="closeProfileModal">Отмена</el-button>
        <el-button type="primary" :loading="isSaving" @click="saveProfile">
          Сохранить
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { levels as levelsApi, directions as directionsApi, profiles as profilesApi, subjects as subjectsApi } from '@/api/education';
import { useToast } from 'vue-toastification';
import { ElMessageBox } from 'element-plus';
import { Delete, Edit, Plus } from '@element-plus/icons-vue';

const toast = useToast();

const isLoading = ref(false);
const isSaving = ref(false);

const educationLevels = ref([]);
const allDirections = ref([]);
const allProfiles = ref([]);
const allSubjects = ref([]);

const showDirectionModal = ref(false);
const showProfileModal = ref(false);

const initialDirection = () => ({ id: null, name: '', code: '', level_id: null, sort_order: null, is_published: true });
const currentDirection = ref(initialDirection());

const initialProfile = () => ({
  id: null,
  name: '',
  description: '',
  direction_id: null,
  places: 30,
  sort_order: null,
  is_published: true,
  duration_years: '',
  tuition_fee: '',
  career_info: '',
  internship_info: '',
  exams: []
});
const currentProfile = ref(initialProfile());

// Computed properties for filtering
const directionsByLevel = (levelId) => {
    return allDirections.value
      .filter(d => d.level_id === levelId)
      .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || a.code.localeCompare(b.code, 'ru'));
}

const profilesByDirection = (directionId) => {
    return allProfiles.value
      .filter(p => p.direction_id === directionId)
      .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || a.name.localeCompare(b.name, 'ru'));
}

const getDirectionCount = (levelId) => {
  return directionsByLevel(levelId).length;
}

const getProfileCount = (levelId) => {
  return allProfiles.value.filter(p => {
    const direction = allDirections.value.find(d => d.id === p.direction_id);
    return direction && direction.level_id === levelId;
  }).length;
}

const getProfileCountByDirection = (directionId) => {
  return profilesByDirection(directionId).length;
}

function getSubjectName(subjectId) {
  const subject = allSubjects.value.find(s => s.id === subjectId);
  return subject ? subject.name : 'Неизвестно';
}

onMounted(async () => {
  await fetchData();
});

async function fetchData() {
    isLoading.value = true;
    try {
        const [levelsRes, directionsRes, profilesRes, subjectsRes] = await Promise.all([
            levelsApi.getAll(),
            directionsApi.getAll(),
            profilesApi.getAllWithDetails(),
            subjectsApi.getAll()
        ]);
        if (levelsRes.error) throw levelsRes.error;
        educationLevels.value = levelsRes.data;
        if (directionsRes.error) throw directionsRes.error;
        allDirections.value = directionsRes.data;
        if (profilesRes.error) throw profilesRes.error;
        allProfiles.value = profilesRes.data;
        if (subjectsRes.error) throw subjectsRes.error;
        allSubjects.value = subjectsRes.data;
    } catch(e) {
        toast.error('Ошибка загрузки данных: ' + e.message);
    } finally {
        isLoading.value = false;
    }
}

// Direction Modal
function openDirectionModal(direction = null, levelId = null) {
  if (direction) {
    currentDirection.value = { ...direction };
  } else {
    currentDirection.value = initialDirection();
    currentDirection.value.level_id = levelId;
  }
  showDirectionModal.value = true;
}

function closeDirectionModal() {
  showDirectionModal.value = false;
}

async function saveDirection() {
  isSaving.value = true;
  try {
    if (currentDirection.value.id) {
      const { error } = await directionsApi.update(currentDirection.value.id, currentDirection.value);
      if (error) throw error;
    } else {
      const { error } = await directionsApi.create(currentDirection.value);
      if (error) throw error;
    }
    toast.success('Направление сохранено');
    closeDirectionModal();
    await fetchData();
  } catch (e) {
    toast.error('Ошибка сохранения направления: ' + e.message);
  } finally {
    isSaving.value = false;
  }
}

// Profile Modal
function openProfileModal(profile = null, directionId = null) {
  if (profile) {
    currentProfile.value = {
        ...profile,
      exams: profile.profile_exams ? profile.profile_exams.map(pe => ({ 
        subject_id: pe.subject ? pe.subject.id : pe.subject_id, 
        priority: pe.priority 
      })) : []
    };
  } else {
    currentProfile.value = initialProfile();
    currentProfile.value.direction_id = directionId;
  }
  showProfileModal.value = true;
}

function closeProfileModal() {
  showProfileModal.value = false;
}

async function saveProfile() {
  isSaving.value = true;
  try {
    const payload = { ...currentProfile.value };
    if (payload.id) {
      const { error } = await profilesApi.update(payload.id, payload);
      if (error) throw error;
    } else {
      const { error } = await profilesApi.create(payload);
      if (error) throw error;
    }
    toast.success('Профиль сохранен');
    closeProfileModal();
    await fetchData();
  } catch (e) {
    toast.error('Ошибка сохранения профиля: ' + e.message);
  } finally {
    isSaving.value = false;
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

// Delete
async function confirmDelete(type, id) {
  try {
    await ElMessageBox.confirm(
      `Вы уверены, что хотите удалить этот ${type === 'profile' ? 'профиль' : 'направление'}?`,
      'Подтверждение удаления',
      {
        confirmButtonText: 'Удалить',
        cancelButtonText: 'Отмена',
        type: 'warning'
      }
    );

    try {
        let error;
        if (type === 'profile') {
            ({ error } = await profilesApi.delete(id));
        } else {
            ({ error } = await directionsApi.delete(id));
        }
        if (error) throw error;
        toast.success('Успешно удалено');
        await fetchData();
    } catch (e) {
        toast.error('Ошибка удаления: ' + e.message);
    }
  } catch {
    // Пользователь отменил удаление.
  }
}
</script> 

<style scoped>
.programs-management {
  display: grid;
  gap: 24px;
}

.programs-management__levels {
  display: grid;
  gap: 20px;
}

.programs-management__level-header,
.programs-management__direction-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.programs-management__level-title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.programs-management__direction-title {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.programs-management__direction-actions {
  margin-bottom: 16px;
}

.programs-management__exams {
  display: grid;
  gap: 12px;
}

.programs-management__exam {
  background: var(--el-fill-color-lighter);
}

.programs-management__select {
  width: 100%;
}

.programs-management__add-exam {
  width: 100%;
  margin-top: 12px;
}

@media (max-width: 640px) {
  .programs-management__level-header,
  .programs-management__direction-actions {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>