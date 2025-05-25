# 🎓 Gubkin-Abitur: Обучающий материал для модели ИИ

## 📋 Описание проекта

**Gubkin-Abitur** - система онлайн подачи документов для поступления в Филиал РГУ нефти и газа (НИУ) имени И.М. Губкина в городе Ташкенте. Проект автоматизирует приёмную кампанию от регистрации абитуриентов до административной обработки заявлений.

### 🎯 Основная цель
Цифровизация процесса подачи документов в университет с обеспечением:
- Удобства для абитуриентов
- Эффективности для администрации
- Безопасности персональных данных
- Соответствия образовательным стандартам

## 🏗️ Техническая архитектура

### Frontend Stack
```json
{
  "framework": "Vue.js 3 (Composition API)",
  "routing": "Vue Router 4",
  "state_management": "Pinia + pinia-plugin-persistedstate",
  "styling": "Tailwind CSS + Flowbite",
  "build_tool": "Vite",
  "charts": "Chart.js + vue-chartjs",
  "notifications": "vue-toastification",
  "file_operations": "ExcelJS",
  "phone_input": "vue-tel-input + libphonenumber-js"
}
```

### Backend Stack
```json
{
  "database": "PostgreSQL (Supabase)",
  "authentication": "Supabase Auth",
  "storage": "Supabase Storage",
  "api": "Supabase Auto-generated REST + RPC",
  "security": "Row Level Security (RLS)",
  "real_time": "Supabase Realtime"
}
```

### Infrastructure
```json
{
  "frontend_hosting": "Netlify",
  "backend_hosting": "Supabase Cloud",
  "containerization": "Docker + Nginx",
  "ci_cd": "Git-based deployment"
}
```

## 🗄️ Структура базы данных

### Основные таблицы и их назначение

#### 1. `users` - Пользователи системы
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT,
  phone TEXT,
  birth_date DATE,
  gender TEXT,
  role_id INTEGER REFERENCES roles(id),
  region_id INTEGER REFERENCES regions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Назначение**: Хранение данных всех пользователей системы (абитуриенты, администраторы, сотрудники приёмной комиссии).

#### 2. `applications` - Заявления абитуриентов
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  direction_id INTEGER NOT NULL REFERENCES directions(id),
  status_id INTEGER NOT NULL REFERENCES application_statuses(id),
  
  -- Паспортные данные
  passport_series TEXT NOT NULL,
  passport_issue_date DATE NOT NULL,
  passport_issued_by TEXT NOT NULL,
  
  -- Образование
  education_level TEXT NOT NULL,
  education_institution TEXT NOT NULL,
  education_graduation_year INTEGER NOT NULL,
  document_number TEXT NOT NULL,
  document_date DATE NOT NULL,
  education_document_number TEXT,
  education_document_date DATE,
  
  -- Форма обучения
  study_form TEXT NOT NULL,
  funding_form TEXT NOT NULL,
  
  -- Дополнительная информация
  accommodation_needed BOOLEAN DEFAULT FALSE,
  olympiad_participant BOOLEAN DEFAULT FALSE,
  parent_phone TEXT,
  admin_comment TEXT,
  
  -- Связи с образовательными программами
  profile_id INTEGER REFERENCES profiles(id),
  specialty_id INTEGER REFERENCES specialties(id),
  
  -- Метаданные
  academic_year INTEGER DEFAULT EXTRACT(year FROM CURRENT_DATE),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Назначение**: Центральная таблица для хранения всех данных заявления абитуриента.

#### 3. `directions` - Направления обучения
```sql
CREATE TABLE directions (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  field VARCHAR NOT NULL,
  icon_type TEXT,
  program_type program_type_enum NOT NULL,
  exam_details JSONB,
  duration TEXT,
  places TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  exam_subject_ids UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);
```

**Назначение**: Справочник образовательных направлений с детальной информацией о программах.

#### 4. `documents` - Документы заявлений
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id),
  document_type_id INTEGER NOT NULL REFERENCES document_types(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  comment TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Назначение**: Хранение метаданных загруженных документов с привязкой к заявлениям.

### Справочные таблицы

#### Роли пользователей (`roles`)
```sql
id | name      | description
---|-----------|----------------------------------
1  | applicant | Абитуриент
2  | admin     | Администратор
3  | reviewer  | Сотрудник приёмной комиссии
```

#### Статусы заявлений (`application_statuses`)
```sql
id | name      | description                    | color
---|-----------|--------------------------------|-------
10 | Подана    | Заявка подана и ожидает        | blue
11 | Принята   | Заявка принята                 | green
12 | Отклонена | Заявка отклонена               | red
```

#### Типы документов (`document_types`)
```sql
id | name               | description              | is_required
---|--------------------|--------------------------|-----------
1  | passport           | Паспорт                  | true
2  | education_document | Документ об образовании  | true
3  | photo              | Фотография               | true
4  | medical_certificate| Медицинская справка      | true
5  | military_id        | Военный билет            | false
6  | additional         | Дополнительные документы | false
```

## 👥 Система ролей и доступа

### Роль: Абитуриент (role_id: 1)
**Возможности:**
- Регистрация и аутентификация
- Создание и редактирование заявления
- Загрузка необходимых документов
- Просмотр статуса заявления
- Редактирование личного профиля

**Ограничения:**
- Доступ только к собственным данным
- Невозможность изменения статуса заявления
- Отсутствие доступа к административным функциям

### Роль: Администратор (role_id: 2)
**Возможности:**
- Полный доступ ко всем заявлениям
- Управление пользователями и их ролями
- Изменение статусов заявлений
- Экспорт данных в Excel
- Управление образовательными программами
- Просмотр статистики и аналитики

**Особенности:**
- Доступ к панели администратора
- Возможность назначения ролей другим пользователям
- Доступ к системным настройкам

### Роль: Сотрудник приёмной комиссии (role_id: 3)
**Возможности:**
- Просмотр всех заявлений
- Изменение статусов заявлений
- Добавление комментариев к заявлениям
- Работа с документами абитуриентов

**Ограничения:**
- Отсутствие доступа к управлению пользователями
- Невозможность изменения системных настроек

## 🔄 Бизнес-процессы

### Процесс подачи заявления

#### Шаг 1: Регистрация
```mermaid
graph TD
    A[Заполнение формы регистрации] --> B[Отправка email подтверждения]
    B --> C[Подтверждение email]
    C --> D[Активация аккаунта]
    D --> E[Вход в систему]
```

#### Шаг 2: Пошаговое заполнение заявления

**Шаг 2.1: Личные данные**
- ФИО (first_name, last_name, middle_name)
- Дата рождения (birth_date)
- Пол (gender)
- Регион проживания (region_id)
- Контактные данные (phone, email)
- Телефон родителей (parent_phone)

**Шаг 2.2: Паспортные данные**
- Серия и номер паспорта (passport_series)
- Дата выдачи (passport_issue_date)
- Орган выдачи (passport_issued_by)
- Загрузка скана паспорта

**Шаг 2.3: Образование**
- Уровень образования (education_level)
- Название учебного заведения (education_institution)
- Год окончания (education_graduation_year)
- Номер документа (document_number, education_document_number)
- Дата документа (document_date, education_document_date)
- Загрузка скана документа об образовании

**Шаг 2.4: Выбор направления**
- Направление обучения (direction_id)
- Профиль подготовки (profile_id)
- Специальность (specialty_id)
- Форма финансирования (funding_form: 'budget'/'paid')
- Форма обучения (study_form: 'full-time'/'part-time')
- Необходимость общежития (accommodation_needed)

**Шаг 2.5: Подтверждение**
- Участие в олимпиадах (olympiad_participant)
- Загрузка сертификата олимпиады (если применимо)
- Финальная проверка данных
- Отправка заявления

### Жизненный цикл заявления

```mermaid
stateDiagram-v2
    [*] --> Draft: Создание заявления
    Draft --> Submitted: Отправка
    Submitted --> UnderReview: Начало рассмотрения
    UnderReview --> Accepted: Одобрение
    UnderReview --> Rejected: Отклонение
    Accepted --> [*]
    Rejected --> [*]
    
    note right of Draft: Черновик - можно редактировать
    note right of Submitted: Подана - ожидает рассмотрения
    note right of UnderReview: На рассмотрении
    note right of Accepted: Принята
    note right of Rejected: Отклонена
```

## 📁 Структура Frontend кода

### Организация файлов
```
src/
├── main.js                 # Точка входа приложения
├── App.vue                 # Корневой компонент
├── assets/                 # Статические ресурсы
├── components/             # Переиспользуемые компоненты
│   ├── admin/             # Административные компоненты
│   ├── application/       # Компоненты заявлений
│   ├── base/              # Базовые UI компоненты
│   ├── dashboard/         # Компоненты дашборда
│   ├── forms/             # Формы
│   ├── layout/            # Компоненты макета
│   ├── profile/           # Компоненты профиля
│   ├── register/          # Компоненты регистрации
│   └── ui/                # UI библиотека
├── composables/           # Композиционные функции
├── stores/                # Pinia хранилища
│   ├── auth.js           # Аутентификация
│   └── application.js    # Управление заявлениями
├── router/                # Настройки маршрутизации
│   ├── index.js          # Основные маршруты
│   └── auth-guard.js     # Защита маршрутов
├── views/                 # Страницы приложения
│   ├── admin/            # Административные страницы
│   └── dashboard/        # Страницы дашборда
├── api/                   # API слой
│   ├── supabase.js       # Конфигурация Supabase
│   ├── applications.js   # API заявлений
│   ├── documents.js      # API документов
│   └── directions.js     # API направлений
└── lib/                   # Утилиты и библиотеки
```

### Ключевые компоненты

#### 1. Система аутентификации (`stores/auth.js`)
```javascript
// Основные методы аутентификации
const authStore = useAuthStore()

// Регистрация
await authStore.register({
  email: 'user@example.com',
  password: 'password',
  firstName: 'Имя',
  lastName: 'Фамилия'
})

// Вход
await authStore.login({
  email: 'user@example.com',
  password: 'password'
})

// Выход
await authStore.logout()

// Проверка роли
authStore.isAdmin      // Администратор
authStore.isReviewer   // Сотрудник приёмной комиссии
authStore.isApplicant  // Абитуриент
```

#### 2. Управление заявлениями (`stores/application.js`)
```javascript
const appStore = useApplicationStore()

// Создание заявления
await appStore.createApplication({
  direction_id: 22,
  study_form: 'full-time',
  funding_form: 'budget',
  // ... другие данные
})

// Загрузка документа
await appStore.uploadDocument(
  applicationId,
  documentTypeId,
  file
)

// Получение статистики
await appStore.getApplicationsStatistics()
```

#### 3. Пошаговая форма регистрации (`views/RegisterPage.vue`)
```javascript
// Управление шагами
const currentStep = ref(1)
const totalSteps = 5

// Валидация шага
const validateStep = (step) => {
  // Проверка обязательных полей для каждого шага
}

// Навигация между шагами
const nextStep = () => {
  if (validateStep(currentStep.value)) {
    currentStep.value++
  }
}
```

### Компоненты UI системы

#### Базовые компоненты (`components/base/`)
```javascript
// BaseButton.vue - Универсальная кнопка
<BaseButton 
  variant="primary|secondary|outline|danger"
  size="sm|md|lg"
  :loading="isLoading"
  :disabled="isDisabled"
>
  Текст кнопки
</BaseButton>

// BaseCard.vue - Карточка контента
<BaseCard 
  :bordered="true"
  :hover="true"
  :padding="'lg'"
>
  <template #header>Заголовок</template>
  Содержимое карточки
</BaseCard>

// BaseInput.vue - Поле ввода
<BaseInput
  v-model="value"
  type="text|email|password|number"
  :error="errorMessage"
  :required="true"
  placeholder="Placeholder"
/>
```

#### Компоненты форм (`components/forms/`)
```javascript
// PersonalInfoForm.vue - Форма личных данных
// PassportInfoForm.vue - Форма паспортных данных
// EducationInfoForm.vue - Форма образования
// DirectionSelectionForm.vue - Выбор направления
```

## 🔒 Система безопасности

### Row Level Security (RLS) политики

#### Таблица `users`
```sql
-- Пользователи видят только свой профиль
CREATE POLICY "users_select" ON users 
FOR SELECT USING (auth.uid() = id);

-- Пользователи могут создавать свой профиль
CREATE POLICY "users_insert" ON users 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Пользователи могут обновлять свой профиль
CREATE POLICY "users_update" ON users 
FOR UPDATE USING (auth.uid() = id);

-- Администраторы видят всех пользователей
CREATE POLICY "admins_all" ON users 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role_id = 2
  )
);
```

#### Таблица `applications`
```sql
-- Пользователи видят только свои заявления
CREATE POLICY "applications_user_select" ON applications
FOR SELECT USING (user_id = auth.uid());

-- Администраторы и сотрудники приёмной комиссии видят все заявления
CREATE POLICY "applications_admin_select" ON applications
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role_id IN (2, 3)
  )
);
```

### Валидация файлов
```javascript
// Проверка типов файлов
const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
const maxSize = 10 * 1024 * 1024 // 10MB

if (!validTypes.includes(file.type)) {
  throw new Error('Неподдерживаемый тип файла')
}

if (file.size > maxSize) {
  throw new Error('Размер файла превышает допустимый максимум')
}
```

## 📊 API эндпоинты и методы

### Аутентификация
```javascript
// Регистрация
POST /auth/signup
{
  "email": "user@example.com",
  "password": "password",
  "options": {
    "data": {
      "first_name": "Имя",
      "last_name": "Фамилия"
    }
  }
}

// Вход
POST /auth/signin
{
  "email": "user@example.com",
  "password": "password"
}

// Выход
POST /auth/signout

// Подтверждение email
POST /auth/verify
{
  "email": "user@example.com",
  "token": "123456",
  "type": "email"
}
```

### Заявления
```javascript
// Получение заявлений пользователя
GET /applications?user_id=eq.{user_id}

// Создание заявления
POST /applications
{
  "user_id": "uuid",
  "direction_id": 22,
  "passport_series": "AB1234567",
  "education_level": "Среднее общее",
  // ... остальные поля
}

// Обновление заявления
PATCH /applications?id=eq.{application_id}
{
  "status_id": 11,
  "admin_comment": "Документы приняты"
}
```

### Документы
```javascript
// Загрузка документа в Supabase Storage
POST /storage/v1/object/documents/{application_id}/{file_name}

// Создание записи о документе
POST /documents
{
  "application_id": "uuid",
  "document_type_id": 1,
  "file_name": "passport.pdf",
  "file_path": "documents/uuid/passport.pdf",
  "file_size": 1024000,
  "file_type": "application/pdf"
}

// Получение подписанной ссылки
POST /storage/v1/object/sign/documents/{path}
{
  "expiresIn": 3600
}
```

### RPC функции
```javascript
// Получение всех пользователей (только для админов)
POST /rpc/get_all_users

// Обновление роли пользователя
POST /rpc/update_user_role
{
  "user_id": "uuid",
  "new_role_id": 2
}

// Создание профиля пользователя
POST /rpc/create_user_profile
{
  "user_id": "uuid",
  "user_email": "user@example.com",
  "first_name": "Имя",
  "last_name": "Фамилия",
  "role_id": 1
}
```

## 📈 Аналитика и отчёты

### Экспорт данных в Excel
```javascript
// Экспорт всех абитуриентов
const exportAllApplicants = async () => {
  const result = await excelExport.getAllApplicantsData()
  if (result.success) {
    await excelExport.downloadExcel(result.data, 'all-applicants.xlsx')
  }
}

// Структура экспортируемых данных
const applicantData = {
  personalInfo: {
    lastName: 'Фамилия',
    firstName: 'Имя',
    middleName: 'Отчество',
    birthDate: '1990-01-01',
    gender: 'male',
    phone: '+998901234567',
    email: 'user@example.com'
  },
  passportInfo: {
    series: 'AB1234567',
    issueDate: '2020-01-01',
    issuedBy: 'МВД РУз'
  },
  educationInfo: {
    level: 'Среднее общее',
    institution: 'Школа №1',
    graduationYear: 2023,
    documentNumber: 'А123456'
  },
  applicationInfo: {
    direction: 'Бурение нефтяных и газовых скважин',
    status: 'Подана',
    submissionDate: '2023-06-15'
  }
}
```

### Статистические данные
```javascript
// Получение статистики заявлений
const getStatistics = async () => {
  const { data } = await supabase
    .from('applications')
    .select(`
      status_id,
      application_statuses(name, color),
      direction_id,
      directions(name)
    `)
  
  // Группировка по статусам
  const statusStats = data.reduce((acc, app) => {
    const status = app.application_statuses.name
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})
  
  return statusStats
}
```

## 🎨 UI/UX паттерны

### Адаптивный дизайн
```css
/* Мобильные устройства */
@media (max-width: 640px) {
  .container {
    @apply px-4 py-2;
  }
  
  .grid-cols-desktop {
    @apply grid-cols-1;
  }
}

/* Планшеты */
@media (min-width: 768px) {
  .grid-cols-desktop {
    @apply grid-cols-2;
  }
}

/* Десктоп */
@media (min-width: 1024px) {
  .grid-cols-desktop {
    @apply grid-cols-3;
  }
}
```

### Система уведомлений
```javascript
import { useToast } from 'vue-toastification'

const toast = useToast()

// Успешное действие
toast.success('Заявление успешно отправлено!')

// Ошибка
toast.error('Не удалось загрузить документ')

// Предупреждение
toast.warning('Проверьте правильность введённых данных')

// Информация
toast.info('Заявление находится на рассмотрении')
```

### Индикаторы загрузки
```vue
<template>
  <!-- Полноэкранный лоадер -->
  <SubmissionLoader 
    v-if="isSubmitting" 
    :progress="submissionProgress" 
    :status="submissionStatus" 
  />
  
  <!-- Лоадер кнопки -->
  <BaseButton :loading="isLoading">
    Отправить заявление
  </BaseButton>
  
  <!-- Скелетон загрузки -->
  <div v-if="loading" class="animate-pulse">
    <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div class="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
  </div>
</template>
```

## 🔧 Утилиты и хелперы

### Валидация данных
```javascript
// Валидация email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Валидация телефона
export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone)
}

// Валидация паспорта
export const validatePassport = (passport) => {
  const passportRegex = /^[A-Z]{2}\d{7}$/
  return passportRegex.test(passport)
}
```

### Форматирование данных
```javascript
// Форматирование даты
export const formatDate = (date, locale = 'ru-RU') => {
  return new Intl.DateTimeFormat(locale).format(new Date(date))
}

// Форматирование размера файла
export const formatFileSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}
```

### Работа с файлами
```javascript
// Создание превью изображения
export const createImagePreview = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })
}

// Проверка типа файла
export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type)
}
```

## 🚀 Deployment и DevOps

### Переменные окружения
```env
# Frontend (.env)
VITE_SUPABASE_URL=https://project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=https://gubkin-abiturient.netlify.app

# Supabase (Environment Variables)
DATABASE_URL=postgresql://user:pass@host:port/dbname
JWT_SECRET=your-jwt-secret
ANON_KEY=your-anon-key
SERVICE_ROLE_KEY=your-service-role-key
```

### Docker конфигурация
```dockerfile
# Multi-stage build
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx конфигурация
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

## 📝 Часто используемые паттерны

### Композиционные функции
```javascript
// useApplication.js - Работа с заявлениями
export function useApplication() {
  const loading = ref(false)
  const error = ref(null)
  const application = ref(null)
  
  const loadApplication = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: loadError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .single()
      
      if (loadError) throw loadError
      application.value = data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  return {
    loading: readonly(loading),
    error: readonly(error),
    application: readonly(application),
    loadApplication
  }
}
```

### Защищённые маршруты
```javascript
// router/auth-guard.js
export const requireAuth = (to, from, next) => {
  const authStore = useAuthStore()
  
  if (!authStore.isAuthenticated) {
    next('/auth')
  } else {
    next()
  }
}

export const requireAdmin = (to, from, next) => {
  const authStore = useAuthStore()
  
  if (!authStore.isAdmin) {
    next('/')
  } else {
    next()
  }
}

// Использование в маршрутах
{
  path: '/admin',
  component: AdminPage,
  beforeEnter: [requireAuth, requireAdmin]
}
```

### Оптимистичные обновления
```javascript
// Обновление статуса заявления с оптимистичным UI
const updateApplicationStatus = async (applicationId, newStatusId) => {
  // Сохраняем текущее состояние
  const originalStatus = application.value.status_id
  
  // Обновляем UI немедленно
  application.value.status_id = newStatusId
  
  try {
    // Отправляем запрос на сервер
    const { error } = await supabase
      .from('applications')
      .update({ status_id: newStatusId })
      .eq('id', applicationId)
    
    if (error) throw error
  } catch (err) {
    // В случае ошибки возвращаем предыдущее состояние
    application.value.status_id = originalStatus
    throw err
  }
}
```

## 💡 Рекомендации по использованию

### Для разработчиков
1. **Следуйте принципам Vue.js 3**: Используйте Composition API, реактивность Vue 3
2. **Типизация**: Рассмотрите добавление TypeScript для больших проектов
3. **Тестирование**: Добавьте unit-тесты для критических компонентов
4. **Производительность**: Используйте lazy loading для больших компонентов

### Для администраторов
1. **Мониторинг**: Следите за логами Supabase и Netlify
2. **Бэкапы**: Регулярно создавайте бэкапы базы данных
3. **Безопасность**: Регулярно обновляйте зависимости
4. **Масштабирование**: Мониторьте использование ресурсов

### Для пользователей
1. **Поддерживаемые браузеры**: Chrome 90+, Firefox 88+, Safari 14+
2. **Размеры файлов**: Максимум 10MB на документ
3. **Форматы файлов**: JPG, PNG, PDF
4. **Сохранение прогресса**: Данные автоматически сохраняются при переходе между шагами

---

*Этот документ содержит полную техническую документацию системы Gubkin-Abitur для обучения модели ИИ. Используйте его как справочник при работе с проектом.* 