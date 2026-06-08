<template>
  <main>
    <!-- Заголовок с информацией о приёмной кампании -->
    <section class="py-10 md:py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {{ heroTitle }}
          </h1>
          <p class="text-lg md:text-xl opacity-90 mb-8">
            {{ heroSubtitle }}
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <BaseButton 
              v-if="admissionOpen"
              tag="router-link" 
              to="/register" 
              size="lg" 
              variant="light" 
              class="font-semibold"
            >
              Подать документы
            </BaseButton>
            <BaseButton 
              v-else
              disabled
              size="lg" 
              variant="outline" 
              class="font-semibold text-gray-500 border-gray-300 cursor-not-allowed"
            >
              Прием документов на 2026 год закрыт
            </BaseButton>
            <BaseButton tag="router-link" to="/admission2025" size="lg" variant="primary" class="border border-white">
              Вся информация о приеме
            </BaseButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Преимущества университета -->
    <section class="py-12 md:py-20 bg-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl md:text-3xl font-bold text-center mb-12">
          {{ featuresTitle }}
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <BaseCard v-for="feature in features" :key="feature.title" bordered hover>
            <template #header>
              <div class="flex items-center">
                <div class="rounded-full bg-primary-100 p-3 mr-3">
                  <svg class="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900">{{ feature.title }}</h3>
              </div>
            </template>
            <p class="text-gray-600">{{ feature.description }}</p>
          </BaseCard>
        </div>
      </div>
    </section>

    <!-- Быстрая статистика приемной кампании 2026 -->
    <section class="py-12 md:py-16 bg-primary-50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900">
            {{ statsTitle }}
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div v-for="stat in statsItems" :key="stat.label" class="text-center">
              <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div :class="`text-3xl md:text-4xl font-bold mb-2 text-${stat.color}-600`">{{ stat.value }}</div>
                <div class="text-gray-600">{{ stat.label }}</div>
              </div>
            </div>
          </div>
          
          <div class="text-center mt-10">
            <BaseButton tag="router-link" to="/admission2025" size="lg" variant="primary">
              Узнать подробности
            </BaseButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Важные даты -->
    <section class="py-12 md:py-20 bg-gray-50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl md:text-3xl font-bold text-center mb-12">
          {{ timelineTitle }}
        </h2>
        
        <div class="max-w-3xl mx-auto">
          <div class="relative">
            <div class="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary-200"></div>
            <div class="space-y-12 relative">
              <div v-for="(item, index) in timelineItems" :key="item.date" class="flex items-center">
                <div v-if="index % 2 === 0" class="flex-1 pr-8 md:pr-16 text-right">
                  <h3 class="text-lg font-semibold text-primary-700">{{ item.date }}</h3>
                  <p class="text-gray-600">{{ item.label }}</p>
                </div>
                <div v-else class="flex-1 pr-8 md:pr-16"></div>
                <div class="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div v-if="index % 2 === 0" class="flex-1 pl-8 md:pl-16"></div>
                <div v-else class="flex-1 pl-8 md:pl-16 text-left">
                  <h3 class="text-lg font-semibold text-primary-700">{{ item.date }}</h3>
                  <p class="text-gray-600">{{ item.label }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Вопросы и ответы -->
      <section class="py-12 md:py-20 bg-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl md:text-3xl font-bold text-center mb-12">
          {{ faqTitle }}
        </h2>
        
        <div class="max-w-3xl mx-auto space-y-6">
          <BaseCard v-for="(faq, index) in faqs" :key="index" bordered>
            <h3 class="text-lg font-medium text-gray-900 mb-2">{{ faq.question }}</h3>
            <p class="text-gray-600">{{ faq.answer }}</p>
          </BaseCard>
          
          <div class="text-center mt-10">
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <BaseButton tag="router-link" to="/faq" variant="primary">
                Все вопросы и ответы
              </BaseButton>
              <BaseButton tag="router-link" to="/admission2025" variant="outline">
                Полная информация о приеме 2026
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue';
import { ref, computed, onMounted } from 'vue';
import { BaseCard } from '@/components/ui';
import { fetchCmsPage, getSectionByAnchor } from '@/api/cms.js';
import { useAdmissionStatus } from '@/composables/useAdmissionStatus';

const pageData = ref(null)
const { isAdmissionOpen: admissionOpen } = useAdmissionStatus()

const sections = computed(() => pageData.value?.sections || [])

function getSectionContent(anchor) {
  const section = getSectionByAnchor(sections.value, anchor)
  return section?.content || {}
}

const heroContent = computed(() => getSectionContent('hero-banner'))
const featuresContent = computed(() => getSectionContent('features'))
const statsContent = computed(() => getSectionContent('stats'))
const timelineContent = computed(() => getSectionContent('timeline'))
const faqContent = computed(() => getSectionContent('faq'))

const heroTitle = computed(() => heroContent.value.title || 'Приёмная кампания 2026')
const heroSubtitle = computed(() => heroContent.value.subtitle || '')
const features = computed(() => featuresContent.value.items || [])
const featuresTitle = computed(() => featuresContent.value.title || '')
const statsTitle = computed(() => statsContent.value.title || 'Приемная кампания 2026/2027 в цифрах')
const statsItems = computed(() => statsContent.value.items || [])
const timelineTitle = computed(() => timelineContent.value.title || 'Важные даты приемной кампании')
const timelineItems = computed(() => timelineContent.value.items || [])
const faqTitle = computed(() => faqContent.value.title || 'Частые вопросы абитуриентов')
const faqs = computed(() => (faqContent.value.items || []).filter(faq => faq.is_published !== false))

onMounted(async () => {
  try {
    const [page] = await Promise.allSettled([fetchCmsPage('home')])
    if (page.status === 'fulfilled') pageData.value = page.value
  } catch {
    // fallback to static content
  }
})
</script>