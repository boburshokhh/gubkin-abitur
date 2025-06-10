<template>
  <div class="mt-8">
    <BaseCard>
      <div class="text-center">
        <div class="flex justify-center">
          <svg class="h-16 w-16 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="mt-4 text-2xl font-bold text-gray-900">Заявление успешно отправлено!</h2>
        <p class="mt-2 text-gray-600">
          Ваше заявление принято на рассмотрение. Номер заявления: <strong>{{ applicationNumber }}</strong>
        </p>
        <p class="mt-2 text-gray-600">
          В ближайшее время с вами свяжутся представители приемной комиссии для дальнейших инструкций.
        </p>
        
        <!-- Дополнительная информация -->
        <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <h3 class="text-lg font-medium text-blue-800 mb-3">Что дальше?</h3>
          <div class="text-sm text-blue-700 space-y-2">
            <p>• Вы получите SMS-оповещение с подтверждением регистрации</p>
            <p>• Документы будут проверены в течение 1-2 рабочих дней</p>
            <p>• При необходимости с вами свяжутся для уточнения деталей</p>
            <p>• Информация о вступительных испытаниях будет направлена дополнительно</p>
          </div>
        </div>
        
        <!-- Контактная информация -->
        <div class="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
          <h3 class="text-lg font-medium text-gray-800 mb-3">Контакты приёмной комиссии</h3>
          <div class="text-sm text-gray-700 space-y-1">
            <p><strong>Телефон:</strong> (+99871) 200-01-56</p>
            <p><strong>Режим работы:</strong> пн-пт: 09:00-18:00, сб: 09:00-17:00</p>
            <p><strong>Обеденный перерыв:</strong> 13:00-14:00</p>
            <p><strong>Ответственное лицо:</strong> Гафурова Умида Ирмухаматовна</p>
            <p><strong>Адрес:</strong> г. Ташкент, Мирзо Улугбекский район, ул. Дурмон йули, дом 34</p>
          </div>
        </div>
        
        <div class="mt-6">
          <BaseButton tag="router-link" to="/" variant="primary">
            Вернуться на главную
          </BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { BaseCard, BaseButton } from '@/components/ui';

defineProps({
  applicationNumber: {
    type: String,
    required: true
  }
});
</script> 