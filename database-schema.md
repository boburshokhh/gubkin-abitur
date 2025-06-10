### Техническая документация по базе данных (схема `public`)

Здесь представлено описание каждой таблицы, её полей и связей.

---

#### Таблица: `users`
Хранит информацию о пользователях системы.

| Поле | Тип | Null? | По умолчанию | Связь | Описание |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | | **Primary Key** | Уникальный идентификатор пользователя (из `auth.users`) |
| `email` | `text` | NO | | | Email пользователя |
| `first_name` | `text` | NO | | | Имя |
| `last_name` | `text` | NO | | | Фамилия |
| `middle_name`| `text` | YES | | | Отчество |
| `phone` | `text` | YES | | | Телефон |
| `birth_date` | `date` | YES | | | Дата рождения |
| `gender` | `text` | YES | | | Пол |
| `role_id` | `integer`| YES | | `roles(id)` | Роль пользователя |
| `created_at` | `timestamptz`| NO | `now()` | | Дата создания |
| `updated_at` | `timestamptz`| NO | `now()` | | Дата обновления |
| `region_id` | `integer`| YES | | `regions(id)` | Регион пользователя |

---

#### Таблица: `applications`
Хранит заявления абитуриентов.

| Поле | Тип | Null? | По умолчанию | Связь | Описание |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `uuid_generate_v4()` | **Primary Key** | Уникальный идентификатор заявления |
| `user_id` | `uuid` | NO | | `users(id)` | Пользователь, подавший заявление |
| `status_id` | `integer`| NO | | `application_statuses(id)` | Статус заявления |
| `passport_series` | `text` | NO | | | Серия и номер паспорта |
| `passport_issue_date`| `date` | NO | | | Дата выдачи паспорта |
| `passport_issued_by`| `text` | NO | | | Кем выдан паспорт |
| `education_level` | `text` | NO | | | Уровень образования |
| `education_institution` | `text` | NO | | | Учебное заведение |
| `education_graduation_year`| `integer`| NO | | | Год окончания |
| `document_number` | `text` | NO | | | Номер документа об образовании |
| `document_date` | `date` | NO | | | Дата документа об образовании |
| `study_form` | `text` | NO | | | Форма обучения |
| `funding_form` | `text` | NO | | | Форма финансирования |
| `admin_comment`| `text` | YES | | | Комментарий администратора |
| `created_at` | `timestamptz`| NO | `now()` | | Дата создания |
| `updated_at` | `timestamptz`| NO | `now()` | | Дата обновления |
| `accommodation_needed` | `boolean`| YES | `false` | | Требуется общежитие |
| `olympiad_participant` | `boolean`| YES | `false` | | Участник олимпиад |
| `parent_phone` | `text` | YES | | | Телефон родителей |
| `academic_year`| `integer`| NO | `EXTRACT(year FROM CURRENT_DATE)` | | Учебный год |
| `education_document_number` | `text` | YES | | | Номер документа об образовании |
| `education_document_date` | `date` | YES | | | Дата документа об образовании |
| `region_id` | `integer`| YES | | `regions(id)` | Регион |

---

#### Таблица: `application_history`
История изменений статусов заявлений.

| Поле | Тип | Null? | По умолчанию | Связь | Описание |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `uuid_generate_v4()` | **Primary Key** | ID записи истории |
| `application_id`| `uuid` | NO | | `applications(id)` | Заявление |
| `status_id` | `integer`| NO | | `application_statuses(id)` | Новый статус |
| `comment` | `text` | YES | | | Комментарий |
| `created_by` | `uuid` | YES | | | Кто изменил (ID пользователя) |
| `created_at` | `timestamptz`| YES | `now()` | | Дата изменения |

---

#### Таблица: `roles`
Роли пользователей в системе.

| Поле | Тип | Null? | По умолчанию | Связь | Описание |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer`| NO | `nextval(...)` | **Primary Key** | ID роли |
| `name` | `text` | NO | | | Название роли |
| `description`| `text` | YES | | | Описание |
| `created_at` | `timestamptz`| NO | `now()` | | Дата создания |

---

#### Таблица: `document_types`
Типы документов, которые могут быть приложены к заявлению.

| Поле | Тип | Null? | По умолчанию | Связь | Описание |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer`| NO | `nextval(...)` | **Primary Key** | ID типа документа |
| `name` | `text` | NO | | | Название типа |
| `description`| `text` | YES | | | Описание |
| `is_required`| `boolean`| YES | `false` | | Является ли обязательным |
| `created_at` | `timestamptz`| NO | `now()` | | Дата создания |

**Стандартные типы документов:**
1. "Документ об образовании" - обязательный документ (аттестат, диплом)
2. "Паспорт" - скан паспорта
3. "Фотография" - фотография 3х4 см (хранится в application_files)
4. "Сертификат олимпиады" - для участников олимпиад (хранится в olympiad_certificates)

---

#### Таблица: `application_statuses`
Возможные статусы заявлений.

| Поле | Тип | Null? | По умолчанию | Связь | Описание |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer`| NO | `nextval(...)` | **Primary Key** | ID статуса |
| `name` | `text` | NO | | | Название статуса |
| `description`| `text` | YES | | | Описание |
| `color` | `text` | YES | | | Цвет для отображения |
| `created_at` | `timestamptz`| NO | `now()` | | Дата создания |

---

#### Таблица: `olympiad_certificates`
Сертификаты олимпиад, приложенные к заявлению.

| Поле | Тип | Null? | По умолчанию | Связь | Описание |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer`| NO | `nextval(...)` | **Primary Key** | ID сертификата |
| `application_id`| `uuid` | YES | | `applications(id)` | Заявление |
| `name` | `varchar`| NO | | | Название олимпиады |
| `year` | `integer`| YES | | | Год |
| `file_path` | `text` | YES | | | Путь к файлу |
| `created_at` | `timestamptz`| NO | `now()` | | Дата создания |
| `updated_at` | `timestamptz`| NO | `now()` | | Дата обновления |

---

#### Таблица: `admin_logs`
Журнал действий администраторов.

| Поле | Тип | Null? | По умолчанию | Связь | Описание |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()`| **Primary Key** | ID записи |
| `user_id` | `uuid` | NO | | | ID администратора |
| `action` | `varchar`| NO | | | Выполненное действие |
| `resource_id`| `text` | YES | | | ID затронутого ресурса |
| `resource_type`|`varchar`| YES | | | Тип затронутого ресурса |
| `details` | `jsonb` | YES | | | Детали в формате JSON |
| `ip_address` | `varchar`| YES | | | IP-адрес |
| `created_at` | `timestamptz`| NO | `now()` | | Дата действия |

---

#### Таблица: `documents`
Документы, приложенные к заявлениям.

| Поле | Тип | Null? | По умолчанию | Связь | Описание |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `uuid_generate_v4()` | **Primary Key** | ID документа |
| `application_id`| `uuid` | NO | | `applications(id)` | Заявление |
| `document_type_id` | `integer`| NO | | `document_types(id)` | Тип документа |
| `file_name` | `text` | NO | | | Имя файла |
| `file_path` | `text` | NO | | | Путь к файлу |
| `file_size` | `integer`| NO | | | Размер файла |
| `file_type` | `text` | NO | | | Тип файла |
| `status` | `text` | NO | `'pending'` | | Статус проверки |
| `comment` | `text` | YES | | | Комментарий |
| `created_at` | `timestamptz`| NO | `now()` | | Дата создания |
| `updated_at` | `timestamptz`| NO | `now()` | | Дата обновления |
| `user_id` | `uuid` | YES | | | ID пользователя |

---

#### Таблица: `regions`
Справочник регионов.

| Поле | Тип | Null? | По умолчанию | Связь | Описание |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer`| NO | `nextval(...)` | **Primary Key** | ID региона |
| `name` | `varchar`| NO | | | Название региона |
| `code` | `varchar`| YES | | | Код региона |
| `created_at` | `timestamptz`| NO | `now()` | | Дата создания |
| `updated_at` | `timestamptz`| NO | `now()` | | Дата обновления |

---

#### Таблица: `application_choices`
Выбранные направления подготовки в заявлении.

| Поле | Тип | Null? | По умолчанию | Связь | Описание |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `uuid_generate_v4()` | **Primary Key** | ID выбора |
| `application_id`| `uuid` | NO | | `applications(id)` | Заявление |
| `profile_id` | `integer`| NO | | `profiles(id)` | Профиль/направление |
| `priority` | `integer`| NO | | | Приоритет выбора |

---

#### Таблица: `application_files`
Файлы, связанные с заявлением (например, фото).

| Поле | Тип | Null? | По умолчанию | Связь | Описание |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `uuid_generate_v4()` | **Primary Key** | ID файла |
| `application_id`| `uuid` | NO | | `applications(id)` | Заявление |
| `file_path` | `text` | NO | | | Путь к файлу |
| `file_name` | `text` | NO | | | Имя файла |
| `file_type` | `text` | NO | | | Тип файла |
| `file_size` | `integer`| NO | | | Размер файла |
| `is_image` | `boolean`| NO | `false` | | Является ли изображением |
| `created_at` | `timestamptz`| NO | `now()` | | Дата создания |

---

#### Таблица: `logs`
Общий журнал событий в системе.

| Поле | Тип | Null? | По умолчанию | Связь | Описание |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `uuid_generate_v4()` | **Primary Key** | ID лога |
| `user_id` | `uuid` | YES | | `users(id)` | Пользователь |
| `entity_type`| `text` | NO | | | Тип сущности |
| `entity_id` | `text` | NO | | | ID сущности |
| `action` | `text` | NO | | | Действие |
| `details` | `jsonb` | YES | | | Детали |
| `ip_address` | `text` | YES | | | IP-адрес |
| `created_at` | `timestamptz`| NO | `now()` | | Дата создания |

---

#### Таблица: `directions`
Направления подготовки.

| Поле | Тип | Null? | По умолчанию | Связь | Описание |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer`| NO | `nextval(...)` | **Primary Key** | ID направления |
| `level_id` | `integer`| NO | | `education_levels(id)`| Уровень образования |
| `code` | `varchar`| NO | | | Код направления |
| `name` | `varchar`| NO | | | Название направления |

---

#### Таблица: `profiles`
Профили (специализации) в рамках направлений.

| Поле | Тип | Null? | По умолчанию | Связь | Описание |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer`| NO | `nextval(...)` | **Primary Key** | ID профиля |
| `direction_id`| `integer`| NO | | `directions(id)` | Направление |
| `name` | `varchar`| NO | | | Название профиля |
| `description`| `text` | YES | | | Описание |
| `duration_years`|`numeric`| YES | | | Срок обучения |
| `credits` | `integer`| YES | | | Кредиты/ЗЕТ |
| `tuition_fee`| `varchar`| YES | | | Стоимость обучения |
| `career_info`| `text` | YES | | | Информация о карьере |
| `internship_info`|`text` | YES | | | Информация о стажировках |
| `tags` | `jsonb` | YES | | | Теги |
| `a_day_in_life`|`text` | YES | | | "Один день из жизни" |

---

#### Таблица: `subjects`
Справочник учебных предметов (для экзаменов).

| Поле | Тип | Null? | По умолчанию | Связь | Описание |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer`| NO | `nextval(...)` | **Primary Key** | ID предмета |
| `name` | `varchar`| NO | | | Название предмета |

---

#### Таблица: `education_levels`
Справочник уровней образования (бакалавриат, магистратура и т.д.).

| Поле | Тип | Null? | По умолчанию | Связь | Описание |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer`| NO | `nextval(...)` | **Primary Key** | ID уровня |
| `name` | `varchar`| NO | | | Название уровня |

---

#### Таблица: `profile_exams`
Связь между профилями и необходимыми для поступления экзаменами.

| Поле | Тип | Null? | По умолчанию | Связь | Описание |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `profile_id` | `integer`| NO | | `profiles(id)` | **Primary Key, Foreign Key** |
| `subject_id` | `integer`| NO | | `subjects(id)` | **Primary Key, Foreign Key** |
| `priority` | `integer`| NO | | | Приоритет экзамена |

--- 