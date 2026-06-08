<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Заголовок страницы -->
    <section class="py-10 md:py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl md:text-4xl font-bold mb-4">
            {{ pageTitle }}
          </h1>
          <p class="text-lg opacity-90">
            {{ pageSubtitle }}
          </p>
        </div>
      </div>
    </section>

    <!-- Содержимое страницы -->
    <section class="py-12 md:py-16">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
          <!-- Категории вопросов -->
          <div class="mb-12">
            <div class="flex flex-wrap gap-4">
              <button 
                v-for="category in categories" 
                :key="category.id"
                :class="[
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors', 
                  selectedCategory === category.id 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                ]"
                @click="selectedCategory = category.id"
              >
                {{ category.name }}
              </button>
            </div>
          </div>
          
          <!-- Вопросы и ответы -->
          <div v-if="isLoading" class="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-600">
            Загрузка вопросов...
          </div>

          <div v-else-if="!filteredFaqs.length" class="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-600">
            В выбранной категории пока нет опубликованных вопросов.
          </div>

          <div v-else class="space-y-6">
            <BaseCard 
              v-for="faq in filteredFaqs" 
              :key="faq.id"
              class="overflow-hidden transition-all duration-300 cursor-pointer"
              :class="{ 'shadow-md': openFaqId === faq.id }"
              bordered
              hover
              @click="toggleFaq(faq.id)"
            >
              <div class="flex justify-between items-start">
                <h3 class="text-lg font-medium text-gray-900 pr-8">
                  {{ faq.question }}
                </h3>
                <div class="flex-shrink-0 mt-1">
                  <svg 
                    class="h-5 w-5 text-primary-600 transition-transform duration-300" 
                    :class="{ 'rotate-180': openFaqId === faq.id }"
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fill-rule="evenodd" 
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                      clip-rule="evenodd" 
                    />
                  </svg>
                </div>
              </div>
              <div 
                v-show="openFaqId === faq.id" 
                class="mt-4 text-gray-600"
              >
                <p v-if="!faq.hasLists && getFaqAnswer(faq)" class="whitespace-pre-line">{{ getFaqAnswer(faq) }}</p>
                <div v-else-if="faq.answerIntro && !faq.hasLists">
                  <p class="mb-2">{{ faq.answerIntro }}</p>
                  <p v-if="faq.answerOutro">{{ faq.answerOutro }}</p>
                </div>
                <div v-else-if="faq.hasLists">
                  <p class="mb-2">{{ faq.answerIntro }}</p>
                  <ul class="list-disc list-inside space-y-1 mb-2 ml-4">
                    <li v-for="(item, index) in faq.answerList" :key="index">
                      {{ item }}
                    </li>
                  </ul>
                  <p v-if="faq.answerOutro">{{ faq.answerOutro }}</p>
                </div>
              </div>
            </BaseCard>
          </div>
          
          <!-- Не нашли ответ? -->
          <div class="mt-16 bg-white p-8 rounded-lg border border-gray-200 text-center">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">
              Не нашли ответ на свой вопрос?
            </h2>
            <p class="text-gray-600 mb-6">
              Свяжитесь с приемной комиссией Филиала РГУ нефти и газа (НИУ) имени И.М. Губкина в городе Ташкенте
            </p>
            <div class="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="tel:+998712000156" 
                class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100"
              >
                <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +998 71 200-01-56
              </a>
              <a 
                href="mailto:info@gubkin.uz" 
                class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100"
              >
                <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@gubkin.uz
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { BaseCard } from '@/components/ui'
import { fetchCmsPage, getSectionByAnchor } from '@/api/cms.js'
import { allFaqCategory, defaultFaqCategories, defaultFaqContent, defaultFaqs } from '@/content/default-faq.js'

const pageData = ref(null)
const isLoading = ref(false)
const selectedCategory = ref('all')
const openFaqId = ref(null)

const faqContent = computed(() => {
  const section = getSectionByAnchor(pageData.value?.sections || [], 'faq')
  const content = section?.content || {}
  const hasManagedItems = Array.isArray(content.items) && content.items.length > 0

  if (hasManagedItems) return content
  return defaultFaqContent
})

const pageTitle = computed(() => faqContent.value.title || defaultFaqContent.title)
const pageSubtitle = computed(() => faqContent.value.subtitle || defaultFaqContent.subtitle)

const categories = computed(() => {
  const managedCategories = Array.isArray(faqContent.value.categories)
    ? faqContent.value.categories.filter(category => category.id && category.name)
    : []

  return [allFaqCategory, ...(managedCategories.length ? managedCategories : defaultFaqCategories)]
})

const faqs = computed(() => {
  const items = Array.isArray(faqContent.value.items) && faqContent.value.items.length
    ? faqContent.value.items
    : defaultFaqs

  return items.filter(faq => faq.is_published !== false)
})

const filteredFaqs = computed(() => {
  if (selectedCategory.value === 'all') return faqs.value
  return faqs.value.filter(faq => faq.category === selectedCategory.value)
})

function getFaqAnswer(faq) {
  if (faq.answer) return faq.answer
  if (faq.answerIntro && faq.answerOutro) return `${faq.answerIntro}\n\n${faq.answerOutro}`
  return faq.answerIntro || ''
}

function toggleFaq(id) {
  openFaqId.value = openFaqId.value === id ? null : id
}

onMounted(async () => {
  isLoading.value = true
  try {
    pageData.value = await fetchCmsPage('faq')
  } catch {
    pageData.value = null
  } finally {
    isLoading.value = false
  }
})
</script>