<template>
  <main>


    <!-- Навигация по разделам -->
    <section class="py-6 bg-white border-b border-gray-200 sticky top-16 z-40">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex flex-wrap justify-center gap-2 md:gap-3">
          <a href="#admission-info" class="px-3 py-1 text-sm font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded transition-colors shadow-sm hover:bg-primary-100 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-300 cursor-pointer">
            Общая информация
          </a>
          <a href="#directions" class="px-3 py-1 text-sm font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded transition-colors shadow-sm hover:bg-primary-100 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-300 cursor-pointer">
            Направления
          </a>
          <a href="#documents" class="px-3 py-1 text-sm font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded transition-colors shadow-sm hover:bg-primary-100 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-300 cursor-pointer">
            Документы
          </a>
          <a href="#process" class="px-3 py-1 text-sm font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded transition-colors shadow-sm hover:bg-primary-100 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-300 cursor-pointer">
            Процесс подачи
          </a>
          <a href="#exams" class="px-3 py-1 text-sm font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded transition-colors shadow-sm hover:bg-primary-100 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-300 cursor-pointer">
            Экзамены
          </a>
          <a href="#olympiad" class="px-3 py-1 text-sm font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded transition-colors shadow-sm hover:bg-primary-100 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-300 cursor-pointer">
            Олимпиада
          </a>
          <a href="#contacts" class="px-3 py-1 text-sm font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded transition-colors shadow-sm hover:bg-primary-100 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-300 cursor-pointer">
            Контакты
          </a>
        </nav>
      </div>
    </section>

    <!-- Общая информация о приеме -->
    <div id="admission-info">
      <AdmissionInfo2025 />
    </div>

    <!-- Направления подготовки -->
    <div id="directions">
      <Directions2025 />
    </div>

    <!-- Необходимые документы -->
    <div id="documents">
      <DocumentsList2025 />
    </div>

    <!-- Процесс подачи документов -->
    <div id="process">
      <ApplicationProcess2025 />
    </div>

    <!-- Вступительные испытания -->
    <div id="exams">
      <ExamSchedule2025 />
    </div>

    <!-- Преимущества участников олимпиады -->
    <div id="olympiad">
      <OlympiadBenefits2025 />
    </div>

    <!-- Контактная информация -->
    <div id="contacts">
      <ContactInfo2025 />
    </div>


  </main>
</template>

<script setup>
import { onMounted, nextTick } from 'vue';
import AdmissionInfo2025 from '@/components/admission2025/AdmissionInfo2025.vue';
import Directions2025 from '@/components/admission2025/Directions2025.vue';
import DocumentsList2025 from '@/components/admission2025/DocumentsList2025.vue';
import ApplicationProcess2025 from '@/components/admission2025/ApplicationProcess2025.vue';
import ExamSchedule2025 from '@/components/admission2025/ExamSchedule2025.vue';
import OlympiadBenefits2025 from '@/components/admission2025/OlympiadBenefits2025.vue';
import ContactInfo2025 from '@/components/admission2025/ContactInfo2025.vue';

// Плавная прокрутка для якорных ссылок
onMounted(async () => {
  // Ждем полного рендеринга всех компонентов
  await nextTick();
  
  // Небольшая задержка для полной загрузки контента
  setTimeout(() => {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          // Высота фиксированного заголовка + навигации
          const headerHeight = 64 + 56; // 16*4 + 14*4 = примерно 120px
          const elementPosition = targetElement.offsetTop - headerHeight;
          
          window.scrollTo({
            top: Math.max(0, elementPosition),
            behavior: 'smooth'
          });
        }
      });
    });
  }, 100);
});
</script>

<style scoped>
/* Плавное появление секций при прокрутке */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}


</style> 