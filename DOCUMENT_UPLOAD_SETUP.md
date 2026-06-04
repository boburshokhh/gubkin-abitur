# Настройка шага загрузки документов (Шаг 3)

## Описание

Шаг 3 формы регистрации теперь включает обязательную загрузку документов:
- **Фотография 3х4 см** - цветное фото на белом фоне, протокольный вид
- **Документ об образовании** - аттестат или диплом

Без загрузки этих документов пользователь не может перейти к следующему шагу.

## Структура хранения файлов

### 1. Фотографии
- Таблица: `application_files`
- Storage bucket: `application_files`
- Поле `is_image`: `true`

### 2. Документы об образовании
- Таблица: `documents`
- Storage bucket: `application_documents`
- Тип документа: "education_document" (из таблицы `document_types`)

### 3. Сертификаты олимпиад (условно)
- Таблица: `olympiad_certificates`
- Загружается только если пользователь отметил участие в олимпиаде

## Проблемы и решения

### Проблема 1: "Bucket not found"
**Решение**: Создали storage buckets через SQL:
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('application_files', 'application_files', true, 10485760, ARRAY['image/jpeg', 'image/png']),
  ('application_documents', 'application_documents', true, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']);
```

### Проблема 2: "RLS policy violation"
**Решение**: Создали правильные RLS политики для storage.objects:

```sql
-- Для application_files
CREATE POLICY "Загрузка файлов заявлений" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'application_files' AND 
  EXISTS (
    SELECT 1 FROM applications 
    WHERE applications.id::text = (storage.foldername(name))[1] 
    AND applications.user_id = auth.uid()
  )
);

-- Для application_documents  
CREATE POLICY "Загрузка документов по application_id" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'application_documents' AND 
  EXISTS (
    SELECT 1 FROM applications 
    WHERE applications.id::text = (storage.foldername(name))[1] 
    AND applications.user_id = auth.uid()
  )
);
```

### Проблема 3: Неправильный поиск типа документа
**Решение**: Изменили поиск в RegisterPage.vue:
```javascript
const educationDocType = docTypes?.find(type => 
  type.name === 'education_document'
);
```

### Проблема 4: "Permission denied for table users"
**Решение**: Исправили RLS политику и создали RPC функции:

```sql
-- Создали RPC функцию для загрузки файлов заявлений
CREATE OR REPLACE FUNCTION upload_application_file(
  p_application_id UUID,
  p_file_path TEXT,
  p_file_name TEXT,
  p_file_type TEXT,
  p_file_size INTEGER,
  p_is_image BOOLEAN DEFAULT FALSE
)
RETURNS UUID
-- ... (полный код функции)
```

### Проблема 5: "Function upload_document not found"
**Решение**: Создали RPC функцию upload_document:

```sql
CREATE OR REPLACE FUNCTION upload_document(
  p_application_id UUID,
  p_document_type_id INTEGER,
  p_file_name TEXT,
  p_file_path TEXT,
  p_file_size INTEGER,
  p_file_type TEXT
)
RETURNS UUID
-- ... (полный код функции)
```

## Компоненты

### EducationInfoStep.vue
- Форма с полями для образования
- Обязательные поля загрузки файлов
- FileUploadField компоненты
- Валидация обязательных файлов

### RegisterPage.vue  
- Валидация файлов на шаге 3
- Загрузка файлов при создании заявления
- Интеграция с API functions

### API (app-api.js)
- `documents.getTypes()` - получение типов документов
- `documents.upload()` - загрузка документов
- `applicationFiles.upload()` - загрузка фотографий

## Типы документов

| ID | Name | Description | Is Required |
|----|------|-------------|-------------|
| 1 | passport | Паспорт | true |
| 2 | education_document | Документ об образовании | true |
| 3 | photo | Фотография | true |
| 4 | medical_certificate | Медицинская справка | true |
| 5 | military_id | Военный билет | false |
| 6 | additional | Дополнительные документы | false |

## Процесс загрузки

1. **Пользователь выбирает файлы** в EducationInfoStep
2. **Валидация** происходит при переходе к шагу 4
3. **Загрузка файлов** выполняется в submitForm():
   - Фотография → application_files bucket
   - Документ об образовании → application_documents bucket
   - Запись в соответствующие таблицы БД

## Безопасность

- RLS политики проверяют владение заявлением
- Файлы загружаются в папки по ID заявления
- Ограничения на типы файлов (JPEG, PNG, PDF)
- Ограничение размера файла (10MB)

## API функции

### applicationFiles (новое)
```javascript
// Загрузка файла (фотографии)
await applicationFiles.upload(applicationId, file, isImage)

// Получение файлов заявления
await applicationFiles.getByApplicationId(applicationId)

// Получение URL файла
await applicationFiles.getSignedUrl(fileId, options)
```

### documents (существующее)
```javascript
// Загрузка документа с типом
await documents.upload(applicationId, documentTypeId, file)
```

## Валидация

### Форматы файлов
- Изображения: JPG, PNG (для фотографий)
- Документы: JPG, PNG, PDF (для документов об образовании)

### Размер файлов
- Максимум: 10MB на файл

### Обязательность
- Оба файла обязательны для прохождения к шагу 4
- Проверка в функции `validateStep()` в RegisterPage.vue

## Требования к базе данных

### Инициализация типов документов
Выполнить SQL-скрипт `db/insert-document-types.sql`:

```sql
INSERT INTO document_types (name, description, is_required) VALUES
  ('Документ об образовании', 'Аттестат о среднем образовании, диплом...', true),
  ('Паспорт', 'Скан первой страницы паспорта', true),
  -- другие типы...
```

### Storage buckets
Убедиться что созданы бакеты:
- `application_files` - для фотографий
- `application_documents` - для документов

## Особенности реализации

1. **Файлы не загружаются сразу** - только при финальной отправке заявления
2. **Фотографии и документы в разных таблицах** для лучшей организации
3. **Graceful error handling** - если файл не загрузился, заявление все равно создается
4. **Preview поддержка** - пользователь видит выбранные файлы
5. **Валидация на клиенте** - мгновенная обратная связь 