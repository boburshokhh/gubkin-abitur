# Руководство по миграции на новую структуру БД

Данное руководство описывает процесс миграции с предыдущей структуры базы данных на новую, адаптированную для работы с образовательными программами (профилями, направлениями и т.д.).

## Основные изменения в структуре

1. **Введение иерархии образовательных программ**:
   - `education_levels` - верхний уровень (бакалавриат, специалитет)
   - `directions` - направления подготовки с кодами (например, "21.03.01 Нефтегазовое дело")
   - `profiles` - конкретные профили в рамках направлений

2. **Изменение механизма выбора программ**:
   - Ранее: один профиль в заявлении
   - Теперь: до 3-х профилей с приоритетами через таблицу `application_choices`

3. **Улучшение системы статусов заявлений**:
   - Использование `status_id` вместо строкового поля `status`
   - Связь с таблицей `application_statuses`

## Миграция данных

### Шаг 1: Создание новых таблиц

```sql
-- Создаем таблицу уровней образования
CREATE TABLE education_levels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Создаем таблицу направлений
CREATE TABLE directions (
  id SERIAL PRIMARY KEY,
  level_id INTEGER REFERENCES education_levels(id) NOT NULL,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL
);

-- Создаем таблицу профилей
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  direction_id INTEGER REFERENCES directions(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_years NUMERIC(3,1),
  credits INTEGER,
  tuition_fee VARCHAR(100),
  career_info TEXT,
  internship_info TEXT,
  tags JSONB,
  a_day_in_life TEXT
);

-- Создаем таблицу предметов
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Создаем связь профилей и экзаменов
CREATE TABLE profile_exams (
  profile_id INTEGER REFERENCES profiles(id) NOT NULL,
  subject_id INTEGER REFERENCES subjects(id) NOT NULL,
  priority INTEGER NOT NULL,
  PRIMARY KEY (profile_id, subject_id)
);

-- Создаем таблицу выбора профилей в заявлении
CREATE TABLE application_choices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) NOT NULL,
  profile_id INTEGER REFERENCES profiles(id) NOT NULL,
  priority INTEGER NOT NULL
);
```

### Шаг 2: Перенос данных из старых таблиц в новые

```sql
-- Заполняем уровни образования
INSERT INTO education_levels (name) VALUES ('Бакалавриат'), ('Специалитет');

-- Заполняем направления (пример)
INSERT INTO directions (level_id, code, name)
VALUES 
  (1, '21.03.01', 'Нефтегазовое дело'),
  (2, '21.05.02', 'Прикладная геология'),
  (2, '21.05.03', 'Технология геологической разведки');

-- Перенос существующих программ в профили
INSERT INTO profiles (direction_id, name, description)
SELECT 
  (SELECT d.id FROM directions d WHERE d.code = SUBSTRING(p.code FROM 1 FOR 8)),
  p.name,
  p.description
FROM programs p;

-- Перенос данных о выбранных программах в application_choices
INSERT INTO application_choices (application_id, profile_id, priority)
SELECT 
  a.id,
  (SELECT p.id FROM profiles p WHERE p.name = pr.name LIMIT 1),
  1
FROM applications a
JOIN programs pr ON a.program_id = pr.id;
```

### Шаг 3: Создание новых функций

См. файл [database-functions.md](database-functions.md) для полного списка функций, которые необходимо создать для работы с новой структурой базы данных.

### Шаг 4: Обновление клиентского приложения

Необходимо обновить все запросы в клиентском приложении для работы с новой структурой:

- Замените прямые запросы к таблице `programs` на использование функции `get_profiles()`
- Используйте функцию `get_compatible_profiles()` для выбора 2-го и 3-го приоритетов
- Обновите формы создания заявлений для работы с множественным выбором профилей

## Проверка миграции

После миграции выполните следующие проверки:

1. Убедитесь, что все профили успешно перенесены:
   ```sql
   SELECT COUNT(*) FROM profiles;
   ```

2. Проверьте корректность связей в application_choices:
   ```sql
   SELECT COUNT(*) FROM application_choices;
   ```

3. Протестируйте основные функции:
   ```sql
   SELECT * FROM get_profiles(NULL, NULL, NULL, 10, 0);
   ```

## Откат миграции

В случае проблем можно выполнить откат миграции:

```sql
DROP TABLE IF EXISTS application_choices;
DROP TABLE IF EXISTS profile_exams;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS directions;
DROP TABLE IF EXISTS education_levels;
DROP TABLE IF EXISTS subjects;
``` 