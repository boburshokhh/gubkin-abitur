<template>
  <el-form label-position="top">
    <el-form-item label="Заголовок (kicker)">
      <el-input v-model="local.kicker" />
    </el-form-item>
    <el-form-item label="Основной заголовок">
      <el-input v-model="local.title" />
    </el-form-item>
    <el-form-item label="Подзаголовок / место проведения">
      <el-input v-model="local.subtitle" type="textarea" :rows="2" />
    </el-form-item>

    <el-divider>Экзамены</el-divider>
    <el-collapse>
      <el-collapse-item v-for="(exam, idx) in local.exams" :key="idx" :name="idx">
        <template #title>
          <div class="exam-title-row">
            <span>{{ exam.subject || `Экзамен ${idx + 1}` }}</span>
            <el-button type="danger" size="small" text @click.stop="removeExam(idx)">Удалить</el-button>
          </div>
        </template>
        <el-row :gutter="12">
          <el-col :span="10"><el-form-item label="Предмет"><el-input v-model="exam.subject" /></el-form-item></el-col>
          <el-col :span="7"><el-form-item label="Дата"><el-input v-model="exam.date" placeholder="03 июля" /></el-form-item></el-col>
          <el-col :span="7"><el-form-item label="Время"><el-input v-model="exam.time" placeholder="09:00" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="8"><el-form-item label="Формат"><el-input v-model="exam.format" placeholder="Письменно" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="Продолжительность"><el-input v-model="exam.duration" /></el-form-item></el-col>
          <el-col :span="8">
            <el-form-item label="Тип">
              <el-select v-model="exam.type">
                <el-option value="primary" label="primary" />
                <el-option value="info" label="info" />
                <el-option value="warning" label="warning" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Для кого (scope)"><el-input v-model="exam.scope" /></el-form-item>
        <el-form-item label="Описание"><el-input v-model="exam.description" type="textarea" :rows="2" /></el-form-item>
      </el-collapse-item>
    </el-collapse>
    <el-button type="primary" plain size="small" style="margin-top:12px" @click="addExam">+ Добавить экзамен</el-button>

    <el-divider>Результаты (даты публикации)</el-divider>
    <div v-for="(r, idx) in local.results" :key="idx" class="item-block">
      <el-row :gutter="12">
        <el-col :span="14"><el-form-item label="Название"><el-input v-model="r.title" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="Дата"><el-input v-model="r.value" /></el-form-item></el-col>
        <el-col :span="2" style="display:flex;align-items:flex-end;padding-bottom:18px">
          <el-button type="danger" size="small" text @click="removeResult(idx)">✕</el-button>
        </el-col>
      </el-row>
    </div>
    <el-button type="primary" plain size="small" @click="addResult">+ Добавить</el-button>
  </el-form>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:modelValue'])

const local = reactive({
  kicker: props.modelValue?.kicker || '',
  title: props.modelValue?.title || '',
  subtitle: props.modelValue?.subtitle || '',
  exams: (props.modelValue?.exams || []).map(e => ({ ...e })),
  results: (props.modelValue?.results || []).map(r => ({ ...r })),
  rules: { ...(props.modelValue?.rules || {}) }
})

function addExam() { local.exams.push({ subject: '', date: '', time: '09:00', format: 'Письменно', duration: '2 часа', type: 'primary', scope: '', description: '', details: [], warning: null }) }
function removeExam(idx) { local.exams.splice(idx, 1) }
function addResult() { local.results.push({ title: '', value: '' }) }
function removeResult(idx) { local.results.splice(idx, 1) }

watch(local, () => emit('update:modelValue', {
  ...local,
  exams: local.exams.map(e => ({ ...e })),
  results: local.results.map(r => ({ ...r }))
}), { deep: true })

watch(() => props.modelValue, (v) => {
  local.kicker = v?.kicker || ''
  local.title = v?.title || ''
  local.subtitle = v?.subtitle || ''
  local.exams = (v?.exams || []).map(e => ({ ...e }))
  local.results = (v?.results || []).map(r => ({ ...r }))
  local.rules = { ...(v?.rules || {}) }
}, { deep: true })
</script>

<style scoped>
.exam-title-row {
  display: flex; align-items: center; justify-content: space-between; width: 100%; padding-right: 12px;
}
.item-block { padding: 10px; margin-bottom: 8px; border: 1px solid var(--el-border-color); border-radius: 8px; }
</style>
