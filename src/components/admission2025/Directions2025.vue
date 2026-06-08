<template>
  <section class="admission-section muted">
    <div class="admission-container">
      <div class="section-heading">
        <el-tag class="section-kicker" effect="plain" round>{{ sectionKicker }}</el-tag>
        <h2>{{ sectionTitle }}</h2>
        <p>{{ sectionSubtitle }}</p>
      </div>

      <el-skeleton v-if="isLoading" :rows="8" animated />
      <el-empty v-else-if="!directions.length" description="Направления не найдены" />

      <el-row v-else :gutter="24">
        <el-col v-for="direction in directions" :key="direction.code" :span="24">
          <el-card class="direction-card" shadow="hover">
            <template #header>
              <div class="direction-header">
                <div>
                  <el-tag class="direction-tag" effect="plain" round>{{ direction.level }}</el-tag>
                  <h3>{{ direction.code }} «{{ direction.title }}»</h3>
                </div>
                <el-statistic :value="direction.places" suffix="мест" />
              </div>
            </template>

            <p class="profiles-title">{{ direction.profileTitle }}</p>
            <el-row :gutter="14">
              <el-col
                v-for="profile in direction.profiles"
                :key="profile.name"
                :xs="24"
                :sm="direction.profiles.length === 1 ? 24 : 12"
                :lg="getProfileColumnSpan(direction.profiles.length)"
              >
                <div class="profile-card">
                  <div class="profile-main">
                    <div class="profile-title-row">
                      <span class="profile-name">{{ profile.name }}</span>
                      <el-tag class="places-tag" effect="plain" round>{{ profile.places }} мест</el-tag>
                    </div>
                    <p v-if="profile.description" class="profile-description">{{ profile.description }}</p>
                    <div v-if="profile.exams.length" class="profile-exams">
                      <el-tag
                        v-for="exam in profile.exams"
                        :key="`${profile.id}-${exam.subject_id}`"
                        size="small"
                        effect="plain"
                      >
                        {{ exam.priority }}. {{ exam.subject?.name || exam.subject_name }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>

      <el-alert
        v-if="importantDescription"
        class="important-alert"
        type="info"
        show-icon
        :closable="false"
        :title="importantTitle"
        :description="importantDescription"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  educationProfiles: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  sectionData: { type: Object, default: () => ({}) }
})

const defaultProfilePlaces = computed(() => Number(props.sectionData?.default_profile_places) || 30)
const profilePlaces = computed(() => props.sectionData?.profile_places || {})
const sectionKicker = computed(() => props.sectionData?.kicker || 'Направления подготовки')
const sectionTitle = computed(() => props.sectionData?.title || getGeneratedTitle())
const sectionSubtitle = computed(() => props.sectionData?.subtitle || 'Выберите конкурсные группы с единым набором вступительных испытаний.')
const importantTitle = computed(() => props.sectionData?.important_title || 'Важная информация')
const importantDescription = computed(() => props.sectionData?.important_description || 'Вступительные испытания одинаковые для всех направлений как для бюджетных мест, так и для мест по договорам. Абитуриенты могут указать конкурсные группы с приоритетом.')

const directions = computed(() => {
  const groupedDirections = new Map()

  props.educationProfiles.forEach((profile) => {
    if (!profile?.direction) return
    if (profile.is_published === false || profile.direction.is_published === false) return

    const directionKey = profile.direction_id || profile.direction.code || profile.direction.name
    const existingDirection = groupedDirections.get(directionKey)
    const places = getProfilePlaces(profile)
    const nextProfile = {
      id: profile.id,
      name: getProfileName(profile.name),
      description: profile.description || '',
      exams: profile.profile_exams || [],
      sortOrder: Number(profile.sort_order) || 0,
      places
    }

    if (existingDirection) {
      existingDirection.profiles.push(nextProfile)
      existingDirection.places += places
      existingDirection.profileTitle = getProfileTitle(existingDirection.level, existingDirection.profiles.length)
      return
    }

    groupedDirections.set(directionKey, {
      code: profile.direction.code,
      title: profile.direction.name,
      level: profile.direction.level?.name || '',
      places,
      sortOrder: Number(profile.direction.sort_order) || 0,
      profileTitle: getProfileTitle(profile.direction.level?.name, 1),
      profiles: [nextProfile]
    })
  })

  return [...groupedDirections.values()]
    .map(direction => ({
      ...direction,
      profiles: direction.profiles.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ru'))
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code, 'ru'))
})

function getGeneratedTitle() {
  const directionsCount = directions.value.length
  const profilesCount = props.educationProfiles.length
  const placesCount = directions.value.reduce((total, direction) => total + direction.places, 0)

  return `${directionsCount} направлений, ${profilesCount} профилей, ${placesCount} мест`
}

function getProfilePlaces(profile) {
  return Number(profile.places || profilePlaces.value?.[profile.id] || profilePlaces.value?.[profile.name]) || defaultProfilePlaces.value
}

function getProfileName(name = '') {
  if (props.sectionData?.show_profile_codes) return name
  return name.replace(/\s*\([^)]*\)\s*$/, '')
}

function getProfileTitle(levelName, profilesCount) {
  if (levelName === 'Специалитет') return profilesCount === 1 ? 'Специализация' : 'Специализации'
  return profilesCount === 1 ? 'Профиль подготовки' : 'Профили подготовки'
}

function getProfileColumnSpan(profilesCount) {
  if (profilesCount <= 1) return 24
  if (profilesCount === 2) return 12
  return 8
}
</script>

<style scoped>
.admission-section {
  padding: 72px 0;
}

.admission-section.muted {
  background: #f5f7fb;
}

.admission-container {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
}

.section-heading {
  max-width: 760px;
  margin: 0 auto 40px;
  text-align: center;
}

.section-heading h2 {
  margin: 14px 0;
  color: #111827;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.035em;
}

.section-heading p {
  margin: 0;
  color: #64748b;
  font-size: 1.1rem;
  line-height: 1.7;
}

.direction-card {
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
}

.direction-card :deep(.el-card__body) {
  padding: 24px;
}

.direction-card :deep(.el-card__header) {
  border-bottom-color: #eef2f7;
  padding: 24px;
}

.direction-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.direction-header > div:first-child {
  min-width: 0;
}

.direction-header h3 {
  margin: 12px 0 0;
  color: #111827;
  font-size: 1.25rem;
  font-weight: 650;
  line-height: 1.35;
}

.profiles-title {
  margin: 0 0 16px;
  color: #334155;
  font-weight: 650;
}

.profile-card {
  height: calc(100% - 14px);
  min-height: 76px;
  margin-bottom: 14px;
  padding: 16px;
  border: 1px solid #e5eaf3;
  border-radius: 16px;
  background: #f8fafc;
}

.profile-main {
  width: 100%;
}

.profile-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.profile-name {
  min-width: 0;
  color: #334155;
  font-weight: 550;
  line-height: 1.45;
}

.profile-description {
  margin: 10px 0 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
}

.profile-exams {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.important-alert {
  margin-top: 10px;
  border-radius: 16px;
}

.section-kicker,
.direction-tag,
.places-tag {
  border-color: rgba(18, 61, 112, 0.18);
  background: rgba(18, 61, 112, 0.06);
  color: #123d70;
}

.places-tag {
  flex: 0 0 auto;
}

@media (max-width: 767px) {
  .direction-header,
  .profile-title-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
