<template>
  <el-form label-position="top">
    <el-form-item label="Заголовок (kicker)">
      <el-input v-model="local.kicker" />
    </el-form-item>
    <el-form-item label="Основной заголовок">
      <el-input v-model="local.title" />
    </el-form-item>
    <el-form-item label="Подзаголовок">
      <el-input v-model="local.subtitle" type="textarea" :rows="2" />
    </el-form-item>
    <el-form-item label="URL карты Google (iframe src)">
      <el-input v-model="local.map_embed_url" type="textarea" :rows="3" />
    </el-form-item>
    <el-divider>Карточки контактов</el-divider>
    <el-collapse>
      <el-collapse-item v-for="(card, idx) in local.cards" :key="idx" :name="idx">
        <template #title>
          <div class="card-title-row">
            <span>{{ card.title || `Карточка ${idx + 1}` }}</span>
            <el-button type="danger" size="small" text @click.stop="removeCard(idx)">Удалить</el-button>
          </div>
        </template>
        <el-form-item label="Название карточки">
          <el-input v-model="card.title" />
        </el-form-item>
        <el-divider>Строки</el-divider>
        <div v-for="(item, iIdx) in (card.items || [])" :key="iIdx" class="item-block">
          <el-row :gutter="12">
            <el-col :span="8"><el-form-item label="Подпись"><el-input v-model="item.label" /></el-form-item></el-col>
            <el-col :span="10"><el-form-item label="Значение"><el-input v-model="item.value" /></el-form-item></el-col>
            <el-col :span="4"><el-form-item label="Ссылка"><el-input v-model="item.href" placeholder="tel:..." /></el-form-item></el-col>
            <el-col :span="2" style="display:flex;align-items:flex-end;padding-bottom:18px">
              <el-button type="danger" size="small" text @click="removeCardItem(card, iIdx)">✕</el-button>
            </el-col>
          </el-row>
        </div>
        <el-button type="primary" plain size="small" @click="addCardItem(card)">+ Строка</el-button>
      </el-collapse-item>
    </el-collapse>
    <el-button type="primary" plain size="small" style="margin-top:12px" @click="addCard">+ Добавить карточку</el-button>
  </el-form>
</template>

<script setup>
import { nextTick, reactive, ref, watch } from 'vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:modelValue'])
const isSyncingFromModel = ref(false)

const local = reactive({
  kicker: props.modelValue?.kicker || '',
  title: props.modelValue?.title || '',
  subtitle: props.modelValue?.subtitle || '',
  map_embed_url: props.modelValue?.map_embed_url || '',
  cards: (props.modelValue?.cards || []).map(c => ({ ...c, items: (c.items || []).map(i => ({ ...i })) }))
})

function addCard() { local.cards.push({ title: '', icon_type: 'phone', items: [], note: null }) }
function removeCard(idx) { local.cards.splice(idx, 1) }
function addCardItem(card) { card.items = [...(card.items || []), { label: '', value: '', href: null }] }
function removeCardItem(card, idx) { card.items.splice(idx, 1) }

watch(local, () => {
  if (isSyncingFromModel.value) return

  emit('update:modelValue', {
    ...local,
    cards: local.cards.map(c => ({ ...c, items: (c.items || []).map(i => ({ ...i })) }))
  })
}, { deep: true })

watch(() => props.modelValue, async (v) => {
  isSyncingFromModel.value = true
  local.kicker = v?.kicker || ''
  local.title = v?.title || ''
  local.subtitle = v?.subtitle || ''
  local.map_embed_url = v?.map_embed_url || ''
  local.cards = (v?.cards || []).map(c => ({ ...c, items: (c.items || []).map(i => ({ ...i })) }))
  await nextTick()
  isSyncingFromModel.value = false
}, { deep: true })
</script>

<style scoped>
.card-title-row {
  display: flex; align-items: center; justify-content: space-between; width: 100%; padding-right: 12px;
}
.item-block { padding: 10px; margin-bottom: 8px; border: 1px solid var(--el-border-color); border-radius: 8px; }
</style>
