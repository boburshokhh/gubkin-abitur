<template>
  <el-result
    icon="success"
    title="Заявление успешно отправлено!"
    :sub-title="`Ваше заявление принято на рассмотрение. Номер заявления: ${applicationNumber}`"
  >
    <template #extra>
      <div class="mx-auto max-w-2xl space-y-4 text-left">
        <el-card shadow="never">
          <template #header>
            <span class="font-medium">Что дальше?</span>
          </template>
          <el-timeline>
            <el-timeline-item>Вы получите SMS-оповещение с подтверждением регистрации.</el-timeline-item>
            <el-timeline-item>Документы будут проверены в течение 1-2 рабочих дней.</el-timeline-item>
            <el-timeline-item>При необходимости с вами свяжутся для уточнения деталей.</el-timeline-item>
            <el-timeline-item>Информация о вступительных испытаниях будет направлена дополнительно.</el-timeline-item>
          </el-timeline>
        </el-card>

        <el-card shadow="never">
          <template #header>
            <span class="font-medium">Контакты приёмной комиссии</span>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="Телефон">(+99871) 200-01-56</el-descriptions-item>
            <el-descriptions-item label="Режим работы">пн-пт: 09:00-18:00, сб: 09:00-17:00</el-descriptions-item>
            <el-descriptions-item label="Обеденный перерыв">13:00-14:00</el-descriptions-item>
            <el-descriptions-item label="Ответственное лицо">Гафурова Умида Ирмухаматовна</el-descriptions-item>
            <el-descriptions-item label="Адрес">г. Ташкент, Мирзо Улугбекский район, ул. Дурмон йули, дом 34</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <div class="text-center">
          <el-button type="primary" size="large" @click="$router.push('/')">Вернуться на главную</el-button>
        </div>
      </div>
    </template>
  </el-result>
</template>

<script setup>
defineProps({
  applicationNumber: {
    type: [String, Number],
    required: true
  }
});
</script>
