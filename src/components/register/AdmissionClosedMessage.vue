<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
    <el-card class="max-w-xl w-full" shadow="always">
      <el-result
        icon="warning"
        title="Прием на 2026 год закрыт"
        sub-title="Подача новых заявлений временно недоступна. Если вы уже отправили документы, статус заявления можно проверить в личном кабинете."
      >
        <template #extra>
          <div class="space-y-5">
            <el-alert
              title="Что доступно сейчас"
              type="info"
              show-icon
              :closable="false"
            >
              <ul class="mt-2 list-disc list-inside text-left">
                <li>Просмотреть статус уже поданных заявлений</li>
                <li>Следить за результатами и уведомлениями</li>
                <li>Получить справочную информацию</li>
              </ul>
            </el-alert>

            <div class="grid grid-cols-1 gap-3">
              <el-button type="primary" size="large" @click="$router.push('/dashboard')">Перейти в личный кабинет</el-button>
              <el-button size="large" @click="$router.push('/statistics')">Посмотреть статистику</el-button>
              <el-button size="large" @click="$router.push('/')">На главную</el-button>
            </div>

            <el-divider />
            <p class="text-center text-sm text-gray-500">
              По вопросам приемной кампании обращайтесь:
              <el-link type="primary" href="mailto:admission@gubkin.uz">admission@gubkin.uz</el-link>
            </p>
          </div>
        </template>
      </el-result>
    </el-card>
  </div>
</template>
