-- ==========================================
-- CMS - Content Management System
-- ==========================================

CREATE TABLE IF NOT EXISTS cms_pages (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_sections (
  id SERIAL PRIMARY KEY,
  page_id INTEGER NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  anchor VARCHAR(100),
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (page_id, anchor)
);

CREATE TABLE IF NOT EXISTS cms_section_items (
  id SERIAL PRIMARY KEY,
  section_id INTEGER NOT NULL REFERENCES cms_sections(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL DEFAULT 'item',
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bucket TEXT NOT NULL DEFAULT 'site-assets',
  object_key TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  mime_type TEXT,
  original_name TEXT,
  file_size_bytes INTEGER,
  alt_text TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  cover_asset_id UUID REFERENCES cms_assets(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_contacts (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'general',
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  href TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_social_links (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  label TEXT,
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cms_sections_page ON cms_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_cms_sections_published ON cms_sections(page_id, is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_cms_section_items_section ON cms_section_items(section_id, is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_news_posts_status ON news_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_posts_slug ON news_posts(slug);
CREATE INDEX IF NOT EXISTS idx_site_contacts_published ON site_contacts(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_site_social_links_published ON site_social_links(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);
CREATE INDEX IF NOT EXISTS idx_cms_assets_created ON cms_assets(created_at DESC);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Pages
INSERT INTO cms_pages (id, slug, title, status) VALUES
  (1, 'home', 'Главная страница', 'published'),
  (2, 'admission2025', 'Информация о приеме 2025/2026', 'published'),
  (3, 'faq', 'Часто задаваемые вопросы', 'published')
ON CONFLICT (slug) DO NOTHING;

SELECT setval('cms_pages_id_seq', GREATEST((SELECT MAX(id) FROM cms_pages), 3));

-- ==========================================
-- HOME PAGE SECTIONS
-- ==========================================

INSERT INTO cms_sections (page_id, type, anchor, title, content, sort_order) VALUES
(1, 'hero', 'hero-banner', 'Главный баннер', '{
  "title": "Приёмная кампания 2026",
  "subtitle": "Подай документы онлайн для поступления в Филиал РГУ нефти и газа (НИУ) имени И.М. Губкина в городе Ташкенте",
  "button_primary_text": "Подать документы",
  "button_primary_href": "/register",
  "button_secondary_text": "Вся информация о приеме",
  "button_secondary_href": "/admission2025"
}'::jsonb, 10)
ON CONFLICT (page_id, anchor) DO NOTHING;

INSERT INTO cms_sections (page_id, type, anchor, title, content, sort_order) VALUES
(1, 'features', 'features', 'Преимущества', '{
  "title": "Почему Филиал РГУ нефти и газа (НИУ) имени И.М. Губкина в городе Ташкенте?",
  "items": [
    {
      "icon_type": "building",
      "title": "Современный кампус",
      "description": "Наш Филиал оснащен современными учебными аудиториями, лабораториями и уникальными тренажерами для практического обучения."
    },
    {
      "icon_type": "shield",
      "title": "Высокое качество образования",
      "description": "Студенты получают образование по российским образовательным стандартам с привлечением ведущих профессоров и экспертов нефтегазовой отрасли."
    },
    {
      "icon_type": "briefcase",
      "title": "Гарантированное трудоустройство",
      "description": "Тесное сотрудничество с ведущими нефтегазовыми компаниями обеспечивает студентам стажировки и перспективное трудоустройство после окончания обучения."
    }
  ]
}'::jsonb, 20)
ON CONFLICT (page_id, anchor) DO NOTHING;

INSERT INTO cms_sections (page_id, type, anchor, title, content, sort_order) VALUES
(1, 'stats', 'stats', 'Приемная кампания в цифрах', '{
  "title": "Приемная кампания 2026/2027 в цифрах",
  "items": [
    {"value": "330", "label": "Всего мест", "color": "primary"},
    {"value": "5", "label": "Направлений обучения", "color": "green"},
    {"value": "11", "label": "Специализаций", "color": "blue"},
    {"value": "16", "label": "дней для подачи", "color": "orange"}
  ]
}'::jsonb, 30)
ON CONFLICT (page_id, anchor) DO NOTHING;

INSERT INTO cms_sections (page_id, type, anchor, title, content, sort_order) VALUES
(1, 'timeline', 'timeline', 'Важные даты', '{
  "title": "Важные даты приемной кампании",
  "items": [
    {"date": "16 июня - 1 июля", "label": "Прием документов для поступления"},
    {"date": "3 - 12 июля", "label": "Вступительные испытания"},
    {"date": "15 июля", "label": "Публикация рейтинговых списков"},
    {"date": "20 - 25 июля", "label": "Зачисление по результатам конкурса"}
  ]
}'::jsonb, 40)
ON CONFLICT (page_id, anchor) DO NOTHING;

INSERT INTO cms_sections (page_id, type, anchor, title, content, sort_order) VALUES
(1, 'faq', 'faq', 'Частые вопросы', '{
  "title": "Частые вопросы абитуриентов",
  "items": [
    {
      "question": "С какого числа начинается прием документов?",
      "answer": "Прием документов на 1-й курс в 2026 году проходит с 16 июня по 1 июля (включительно) в очном и дистанционном формате."
    },
    {
      "question": "В какой форме проходят вступительные экзамены?",
      "answer": "Экзамены проводятся письменно (математика, русский язык) и устно (английский язык). Образцы билетов доступны на сайте Филиала."
    },
    {
      "question": "Какие документы нужны для поступления?",
      "answer": "Оригинал и копия документа об образовании, паспорт, нотариально заверенный перевод, фото 3x4, при подаче онлайн — сканы в pdf или jpg."
    }
  ]
}'::jsonb, 50)
ON CONFLICT (page_id, anchor) DO NOTHING;

-- ==========================================
-- ADMISSION2025 PAGE SECTIONS
-- ==========================================

INSERT INTO cms_sections (page_id, type, anchor, title, content, sort_order) VALUES
(2, 'admission_info', 'admission-info', 'Общая информация', '{
  "kicker": "Общая информация",
  "title": "О филиале Губкина в Ташкенте",
  "subtitle": "Краткая информация об учебном заведении и формате обучения.",
  "cards": [
    {
      "title": "Учебное заведение",
      "icon_type": "office-building",
      "items": [
        {"label": "Название", "value": "Филиал Российского государственного университета нефти и газа (НИУ) имени И.М. Губкина в г. Ташкенте"},
        {"label": "Программы", "value": "Бакалавриат и специалитет"},
        {"label": "Форма обучения", "value": "Очная (дневная)"},
        {"label": "Язык обучения", "value": "Русский"}
      ],
      "note": null
    }
  ]
}'::jsonb, 10)
ON CONFLICT (page_id, anchor) DO NOTHING;

INSERT INTO cms_sections (page_id, type, anchor, title, content, sort_order) VALUES
(2, 'directions', 'directions', 'Направления подготовки', '{
  "kicker": "Направления",
  "title": "Направления подготовки",
  "subtitle": "Пять направлений и одиннадцать специализаций для развития карьеры в нефтегазовой отрасли."
}'::jsonb, 20)
ON CONFLICT (page_id, anchor) DO NOTHING;

INSERT INTO cms_sections (page_id, type, anchor, title, content, sort_order) VALUES
(2, 'documents', 'documents', 'Необходимые документы', '{
  "kicker": "Документы",
  "title": "Необходимые документы",
  "subtitle": "Документы предоставляются в электронном виде для очной off-line и дистанционной on-line подачи.",
  "items": [
    {
      "number": "01",
      "title": "Документ об образовании",
      "icon_type": "document",
      "description": "Оригинал или копия документа государственного образца об образовании: аттестат о среднем образовании, диплом о среднем и профессиональном образовании.",
      "notes": [
        {"title": "Для участников Губкинской олимпиады", "description": "Победители, призеры и участники 1-Губкинской предметной Олимпиады прилагают цветную копию диплома/сертификата.", "type": "info"},
        {"title": "Для второго высшего образования", "description": "Лица, желающие получить второе высшее образование, представляют копию диплома о высшем образовании.", "type": "info"}
      ]
    },
    {
      "number": "02",
      "title": "Документы, удостоверяющие личность",
      "icon_type": "files",
      "description": "Отсканированная цветная копия первой страницы паспорта или ID-карты в формате PDF и копия нотариально заверенного перевода первой страницы паспорта/ID-карты или копия свидетельства о рождении на кириллице.",
      "notes": [
        {"title": "Важно", "description": "Абитуриенты, которым исполнилось 16 лет и не имеющие паспорт или ID-карту, не будут допущены до экзаменов.", "type": "warning"}
      ]
    },
    {
      "number": "03",
      "title": "Фотография",
      "icon_type": "picture",
      "description": "Фотография 3х4 см: цветное фото, белый фон, протокольный вид.",
      "notes": []
    },
    {
      "number": "04",
      "title": "Подача документов",
      "icon_type": "edit",
      "description": "Абитуриент заполняет на официальном сайте Филиала gubkin.uz форму во вкладке «Абитуриенту / Онлайн подача документов» и отправляет необходимые документы в приемную комиссию.",
      "notes": [
        {"title": "SMS-подтверждение", "description": "После проверки документов абитуриент получает SMS с регистрационным номером личного дела.", "type": "info"},
        {"title": "Выбор направлений", "description": "В заявлении можно указать до 3 конкурсных групп с их приоритетом.", "type": "info"}
      ]
    }
  ],
  "summary": {
    "title": "Сроки и режим работы",
    "date_info": "с 16 июня по 1 июля включительно 2026 года. Документы принимаются online 24 часа в сутки.",
    "address": "город Ташкент, Мирзо Улугбекский район, улица Дурмон йули, дом 34",
    "phone": "+998712000156",
    "phone_label": "(+99871) 200-01-56",
    "contact_person": "Копаненко Кристина Александровна"
  }
}'::jsonb, 30)
ON CONFLICT (page_id, anchor) DO NOTHING;

INSERT INTO cms_sections (page_id, type, anchor, title, content, sort_order) VALUES
(2, 'process', 'process', 'Процесс подачи документов', '{
  "kicker": "Подача заявления",
  "title": "Процесс подачи документов",
  "subtitle": "Пошаговая инструкция для абитуриентов 2026 года.",
  "steps": [
    {
      "step_label": "Шаг 1",
      "title": "Выберите направления",
      "icon_type": "circle-check",
      "description": "Определитесь с конкурсными группами, на которые хотите поступить.",
      "note": {"title": "Важно", "description": "Можно выбрать максимум до 3 конкурсных групп, указав приоритет направлений.", "type": "info"},
      "groups": []
    },
    {
      "step_label": "Шаг 2",
      "title": "Подготовьте документы",
      "icon_type": "document",
      "description": "Соберите необходимые документы в электронном виде: PDF или JPG.",
      "note": null,
      "groups": [
        {"title": "Обязательные документы", "items": ["Документ об образовании", "Паспорт/ID и нотариальный перевод", "Фотография 3x4 см"]},
        {"title": "Для участников олимпиады", "items": ["Диплом или сертификат олимпиады", "Цветная копия подтверждающего документа"]}
      ]
    },
    {
      "step_label": "Шаг 3",
      "title": "Заполните форму на сайте",
      "icon_type": "edit-pen",
      "description": "Перейдите на gubkin.uz и заполните форму во вкладке «Абитуриенту / Онлайн подача документов».",
      "note": {"title": "Режим online-приема", "description": "24 часа в сутки в период с 16 июня по 01 июля 2026 года.", "type": "info"},
      "groups": []
    },
    {
      "step_label": "Шаг 4",
      "title": "Получите подтверждение",
      "icon_type": "finished",
      "description": "После проверки документов получите SMS-подтверждение о регистрации.",
      "note": {"title": "SMS-уведомление", "description": "Сообщение придет на номер телефона из заявления с регистрационным номером личного дела.", "type": "info"},
      "groups": []
    }
  ],
  "notices": [
    {"title": "Прием документов", "description": "16 июня - 01 июля 2026 включительно.", "type": "info"},
    {"title": "Для участников олимпиад", "description": "Подтверждающие документы принимаются до 01 июля 2026.", "type": "warning"}
  ],
  "final_alert": "Лица, забравшие документы после завершения приема, выбывают из конкурса. Абитуриенты старше 16 лет без паспорта или ID-карты не допускаются до экзаменов."
}'::jsonb, 40)
ON CONFLICT (page_id, anchor) DO NOTHING;

INSERT INTO cms_sections (page_id, type, anchor, title, content, sort_order) VALUES
(2, 'exams', 'exams', 'Расписание вступительных испытаний', '{
  "kicker": "Экзамены",
  "title": "Расписание вступительных испытаний",
  "subtitle": "Экзамены проводятся в помещениях Филиала по адресу: ул. Дурмон йули, дом 34.",
  "exams": [
    {
      "subject": "Математика",
      "date": "03 июля",
      "time": "09:00",
      "format": "Письменно",
      "duration": "2 часа",
      "type": "primary",
      "scope": "Для всех направлений",
      "description": "Обязательный экзамен для всех специальностей. Результат оценивается по 100-балльной шкале.",
      "details": [
        {"label": "Просмотр работ", "value": "04-05 июля, 10:00-13:00"},
        {"label": "Апелляция", "value": "04-05 июля, 13:00-15:00"}
      ],
      "warning": null
    },
    {
      "subject": "Русский язык",
      "date": "08 июля",
      "time": "09:00",
      "format": "Письменно",
      "duration": "2 часа",
      "type": "primary",
      "scope": "Для всех направлений",
      "description": "Обязательный экзамен для всех специальностей. Результат оценивается по 100-балльной шкале.",
      "details": [
        {"label": "Просмотр работ", "value": "09 июля, 10:00-13:00"},
        {"label": "Апелляция", "value": "09 июля, 13:00-15:00"}
      ],
      "warning": null
    },
    {
      "subject": "Английский язык",
      "date": "11-12 июля",
      "time": "09:00",
      "format": "Устно",
      "duration": "30-40 минут подготовки",
      "type": "info",
      "scope": "Только для направлений «Экономика» и «Менеджмент»",
      "description": "Специальный экзамен для экономических направлений. Результат оценивается по 100-балльной шкале.",
      "details": [
        {"label": "Содержание", "value": "Чтение, перевод, понимание текста, беседа по темам и профориентация"},
        {"label": "Апелляция", "value": "Результаты устного экзамена не подлежат апелляции"}
      ],
      "warning": "Результаты устного экзамена не подлежат апелляции"
    }
  ],
  "results": [
    {"title": "Публикация рейтинговых списков", "value": "15 июля 2026"},
    {"title": "Зачисление по конкурсу", "value": "20-25 июля 2026"}
  ],
  "rules": {
    "admission_docs": "Экзаменационный лист и паспорт/ID-карта.",
    "admission_time": "В день экзамена с 07:00 до 08:45.",
    "forbidden": [
      "Проносить мобильные телефоны, микрокалькуляторы, компьютеры и средства связи.",
      "Покидать аудиторию во время экзамена, кроме случаев плохого самочувствия.",
      "Опаздывать к началу экзамена."
    ],
    "penalty": "За нарушение правил - удаление с экзамена и отстранение от конкурса",
    "ege_text": "Поступающие, сдавшие ЕГЭ, могут заявить результаты ЕГЭ по одному или нескольким предметам. Баллы ЕГЭ включаются в общую сумму баллов."
  }
}'::jsonb, 50)
ON CONFLICT (page_id, anchor) DO NOTHING;

INSERT INTO cms_sections (page_id, type, anchor, title, content, sort_order) VALUES
(2, 'olympiad', 'olympiad', 'Льготы для участников олимпиад', '{
  "kicker": "Олимпиады",
  "title": "Льготы для участников олимпиад",
  "subtitle": "Особые условия поступления для победителей, призеров и участников олимпиад 2026 года.",
  "olympiads": [
    {
      "title": "Республиканская олимпиада РУз 2026",
      "subtitle": "По математике для учащихся школ, лицеев и колледжей",
      "icon_type": "trophy",
      "benefits": [
        {"title": "Технические направления", "description": "Победители заключительного этапа принимаются без вступительных испытаний.", "type": "info"},
        {"title": "Экономика и Менеджмент", "description": "Результат по математике засчитывается с наивысшим баллом 100. Русский и английский сдаются в обычном порядке.", "type": "info"}
      ],
      "list_title": "Для технических направлений",
      "list": ["Технология геологической разведки", "Нефтегазовые техника и технологии", "Нефтегазовое дело (конкурсные группы 1-8)"]
    },
    {
      "title": "Губкинская предметная олимпиада 2026",
      "subtitle": "По русскому языку и математике",
      "icon_type": "medal",
      "benefits": [
        {"title": "Победители и призеры технических направлений", "description": "Принимаются без вступительных испытаний.", "type": "info"},
        {"title": "Экономика и Менеджмент", "description": "Победители поступают без вступительных испытаний, призерам русский язык и математика засчитываются по 100 баллов.", "type": "info"},
        {"title": "Участники", "description": "При результате не менее 40 баллов по предмету эти результаты могут быть зачтены как вступительные испытания.", "type": "warning"}
      ],
      "list_title": "Технические направления",
      "list": ["Технология геологической разведки", "Нефтегазовые техника и технологии", "Нефтегазовое дело (конкурсные группы 1-8)"]
    }
  ],
  "conditions": [
    {"title": "Сроки подачи документов", "description": "Победители и призеры олимпиад должны представить подтверждающие документы до 01 июля 2026 года.", "type": "warning"},
    {"title": "Для республиканской олимпиады", "description": "Нужны подтверждающие документы и нотариально заверенный перевод на русский язык.", "type": "warning"}
  ]
}'::jsonb, 60)
ON CONFLICT (page_id, anchor) DO NOTHING;

INSERT INTO cms_sections (page_id, type, anchor, title, content, sort_order) VALUES
(2, 'contacts', 'contacts', 'Контакты приемной комиссии', '{
  "kicker": "Контакты",
  "title": "Контакты приемной комиссии",
  "subtitle": "Свяжитесь с нами для получения дополнительной информации и технической поддержки.",
  "cards": [
    {
      "title": "Адрес и местоположение",
      "icon_type": "location",
      "items": [
        {"label": "Адрес", "value": "Город Ташкент, Мирзо Улугбекский район, улица Дурмон йули, дом 34"},
        {"label": "Метро", "value": "станция Буюк ипак йули"},
        {"label": "Транспорт", "value": "Остановка Институт механики, автобус №25, 151, маршрутка №31м"},
        {"label": "Ориентир", "value": "рядом с Институтом микробиологии Академии наук Республики Узбекистан"}
      ],
      "note": null
    },
    {
      "title": "Call-центр",
      "icon_type": "phone",
      "items": [
        {"label": "Телефон", "value": "(+99871) 200-01-56", "href": "tel:+998712000156"},
        {"label": "Ответственное лицо", "value": "Гафурова Умида Ирмухаматовна"},
        {"label": "Понедельник - пятница", "value": "09:00 - 18:00"},
        {"label": "Суббота", "value": "09:00 - 17:00"},
        {"label": "Технический перерыв", "value": "13:00 - 14:00"}
      ],
      "note": {"title": "Воскресенье", "description": "Выходной день.", "type": "info"}
    },
    {
      "title": "Онлайн-ресурсы",
      "icon_type": "link",
      "items": [
        {"label": "Официальный сайт", "value": "https://gubkin.uz", "href": "https://gubkin.uz"},
        {"label": "Telegram-канал", "value": "t.me/gubkin_uz", "href": "https://t.me/gubkin_uz"}
      ],
      "note": {"title": "Следите за обновлениями", "description": "На официальных ресурсах публикуются расписание консультаций, экзаменов и важные объявления.", "type": "info"}
    },
    {
      "title": "Техническая поддержка",
      "icon_type": "service",
      "items": [
        {"label": "Телефон поддержки", "value": "(+99871) 200-01-56", "href": "tel:+998712000156"},
        {"label": "Telegram", "value": "@gubkin_uz", "href": "https://t.me/gubkin_uz"}
      ],
      "note": {"title": "Рекомендации", "description": "Используйте актуальную версию браузера, проверьте интернет-соединение и подготовьте PDF-документы до 5 МБ.", "type": "info"}
    }
  ],
  "map_embed_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2995.764941041147!2d69.3396315746695!3d41.335724471306484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38aef45c4a6715f1%3A0x1539ad8e2d2b776e!2z0KTQuNC70LjQsNC7INCg0JPQoyDQvdC10YTRgtC4INC4INCz0LDQt9CwINCyINCz0L7RgNC-0L3QtNC1INCi0LDRiNC60LXQvdGC0LUsINC40LzQtdC90LggQNCz0YPQsdC60LjQvdCw!5e0!3m2!1sru!2s!4v1749582147213!5m2!1sru!2s"
}'::jsonb, 70)
ON CONFLICT (page_id, anchor) DO NOTHING;

-- ==========================================
-- SITE SETTINGS
-- ==========================================

INSERT INTO site_settings (category, key, value, label, sort_order) VALUES
  ('contact', 'address_full', 'г. Ташкент, Мирзо Улугбекский район, ул. Дурмон йули, дом 34', 'Полный адрес', 1),
  ('contact', 'phone_main', '+998712000156', 'Телефон приемной комиссии', 2),
  ('contact', 'phone_main_label', '(+99871) 200-01-56', 'Телефон (формат для отображения)', 3),
  ('contact', 'email_main', 'admission@gubkin.uz', 'Email приемной комиссии', 4),
  ('contact', 'contact_person', 'Гафурова Умида Ирмухаматовна', 'Ответственное лицо', 5),
  ('contact', 'working_hours_weekday', '09:00 - 18:00', 'Часы работы (пн-пт)', 6),
  ('contact', 'working_hours_saturday', '09:00 - 17:00', 'Часы работы (суббота)', 7),
  ('contact', 'metro', 'ст. Буюк ипак йули', 'Станция метро', 8),
  ('social', 'telegram_url', 'https://t.me/gubkin_uz', 'Telegram канал', 1),
  ('social', 'telegram_handle', '@gubkin_uz', 'Telegram handle', 2),
  ('social', 'website_url', 'https://gubkin.uz', 'Официальный сайт', 3),
  ('general', 'site_name', 'Филиал РГУ нефти и газа им. И.М. Губкина в г. Ташкенте', 'Название сайта', 1),
  ('general', 'admission_year', '2026', 'Год приемной кампании', 2),
  ('general', 'admission_open', 'false', 'Прием документов открыт', 3),
  ('general', 'registration_open', 'false', 'Регистрация новых пользователей открыта', 4)
ON CONFLICT (category, key) DO NOTHING;

INSERT INTO site_contacts (type, label, value, href, sort_order, is_published) VALUES
  ('address', 'Адрес', 'г. Ташкент, Мирзо Улугбекский район, ул. Дурмон йули, дом 34', NULL, 10, true),
  ('phone', 'Call-центр', '(+99871) 200-01-56', 'tel:+998712000156', 20, true),
  ('email', 'Email приемной комиссии', 'admission@gubkin.uz', 'mailto:admission@gubkin.uz', 30, true),
  ('person', 'Ответственное лицо', 'Гафурова Умида Ирмухаматовна', NULL, 40, true),
  ('hours', 'Понедельник - пятница', '09:00 - 18:00', NULL, 50, true),
  ('hours', 'Суббота', '09:00 - 17:00', NULL, 60, true)
ON CONFLICT DO NOTHING;

INSERT INTO site_social_links (platform, label, url, sort_order, is_published) VALUES
  ('telegram', 'Telegram канал', 'https://t.me/gubkin_uz', 10, true),
  ('website', 'Официальный сайт', 'https://gubkin.uz', 20, true)
ON CONFLICT (platform) DO NOTHING;

INSERT INTO news_posts (slug, title, summary, body, status, published_at) VALUES
  (
    'admission-2026-start',
    'Приёмная кампания 2026/2027',
    'Опубликована основная информация для абитуриентов о сроках приема документов, направлениях подготовки и вступительных испытаниях.',
    'В разделе Admission 2025 доступна подробная информация о поступлении: сроки, документы, направления, экзамены, льготы олимпиад и контакты приемной комиссии.',
    'published',
    NOW()
  )
ON CONFLICT (slug) DO NOTHING;
