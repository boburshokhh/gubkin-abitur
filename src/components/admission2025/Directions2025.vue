<template>
  <section class="admission-section muted">
    <div class="admission-container">
      <div class="section-heading">
        <el-tag type="success" effect="plain" round>Направления подготовки</el-tag>
        <h2>5 направлений, 11 специализаций, 330 мест</h2>
        <p>Выберите до трех конкурсных групп с единым набором вступительных испытаний.</p>
      </div>

      <el-row :gutter="24">
        <el-col v-for="direction in directions" :key="direction.code" :xs="24" :lg="direction.wide ? 24 : 12">
          <el-card class="direction-card" shadow="hover">
            <template #header>
              <div class="direction-header">
                <div>
                  <el-tag :type="direction.tagType" effect="dark" round>{{ direction.level }}</el-tag>
                  <h3>{{ direction.code }} «{{ direction.title }}»</h3>
                </div>
                <el-statistic :value="direction.places" suffix="мест" />
              </div>
            </template>

            <p class="profiles-title">{{ direction.profileTitle }}</p>
            <el-row :gutter="14">
              <el-col v-for="profile in direction.profiles" :key="profile.name" :xs="24" :md="direction.profiles.length > 2 ? 8 : 12">
                <div class="profile-card">
                  <span>{{ profile.name }}</span>
                  <el-tag :type="direction.tagType" round>{{ profile.places }} мест</el-tag>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>

      <el-alert
        class="important-alert"
        type="warning"
        show-icon
        :closable="false"
        title="Важная информация"
        description="Вступительные испытания одинаковые для всех направлений как для бюджетных мест, так и для мест по договорам. Абитуриенты могут указать до 3 конкурсных групп с приоритетом."
      />
    </div>
  </section>
</template>

<script setup>
const directions = [
  {
    code: '21.05.03',
    title: 'Технология геологической разведки',
    level: 'Специалитет',
    places: 30,
    tagType: 'success',
    profileTitle: 'Специализация',
    profiles: [{ name: 'Цифровой геоинжиниринг', places: 30 }]
  },
  {
    code: '21.03.01',
    title: 'Нефтегазовое дело',
    level: 'Бакалавриат',
    places: 120,
    tagType: 'primary',
    profileTitle: 'Профили подготовки',
    wide: true,
    profiles: [
      { name: 'Бурение нефтяных и газовых скважин', places: 30 },
      { name: 'Эксплуатация и обслуживание объектов добычи нефти', places: 30 },
      { name: 'Эксплуатация и обслуживание объектов добычи газа', places: 30 },
      { name: 'Транспорт и хранение нефти, газа', places: 30 }
    ]
  },
  {
    code: '21.05.06',
    title: 'Нефтегазовые техника и технологии',
    level: 'Специалитет',
    places: 90,
    tagType: 'warning',
    profileTitle: 'Специализации',
    wide: true,
    profiles: [
      { name: 'Технология бурения нефтяных и газовых скважин', places: 30 },
      { name: 'Разработка и эксплуатация нефтяных месторождений', places: 30 },
      { name: 'Разработка и эксплуатация газовых месторождений', places: 30 }
    ]
  },
  {
    code: '38.03.01',
    title: 'Экономика',
    level: 'Бакалавриат',
    places: 30,
    tagType: 'danger',
    profileTitle: 'Профиль подготовки',
    profiles: [{ name: 'Экономика и проекты устойчивого развития энергетики', places: 30 }]
  },
  {
    code: '38.03.02',
    title: 'Менеджмент',
    level: 'Бакалавриат',
    places: 60,
    tagType: 'info',
    profileTitle: 'Профили подготовки',
    profiles: [
      { name: 'Управление бизнесом в энергетике', places: 30 },
      { name: 'Международный менеджмент', places: 30 }
    ]
  }
]
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
  font-weight: 800;
}

.section-heading p {
  margin: 0;
  color: #64748b;
  font-size: 1.1rem;
  line-height: 1.7;
}

.direction-card {
  height: calc(100% - 24px);
  margin-bottom: 24px;
  border-radius: 22px;
}

.direction-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.direction-header h3 {
  margin: 12px 0 0;
  color: #111827;
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.35;
}

.profiles-title {
  margin: 0 0 16px;
  color: #334155;
  font-weight: 700;
}

.profile-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 76px;
  gap: 16px;
  margin-bottom: 14px;
  padding: 16px;
  border: 1px solid #e5eaf3;
  border-radius: 16px;
  background: #f8fafc;
}

.profile-card span {
  color: #334155;
  line-height: 1.45;
}

.important-alert {
  margin-top: 10px;
  border-radius: 16px;
}

@media (max-width: 767px) {
  .direction-header,
  .profile-card {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
