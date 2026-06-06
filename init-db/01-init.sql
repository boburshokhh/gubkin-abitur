-- Инициализация базы данных для системы приема абитуриентов
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица: roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица: regions
CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица: users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT,
  phone TEXT,
  birth_date DATE,
  gender TEXT,
  role_id INTEGER REFERENCES roles(id) DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'active', 'disabled', 'locked')),
  email_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  region_id INTEGER REFERENCES regions(id)
);

-- Таблица: auth_sessions
CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  ip_address INET,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  replaced_by_session_id UUID REFERENCES auth_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица: auth_tokens
CREATE TABLE IF NOT EXISTS auth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email_verification', 'password_reset', 'email_change')),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET
);

-- Таблица: invitations
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  token_hash TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  accepted_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица: application_statuses
CREATE TABLE IF NOT EXISTS application_statuses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица: applications
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status_id INTEGER NOT NULL REFERENCES application_statuses(id) DEFAULT 1,
  passport_series TEXT NOT NULL,
  passport_issue_date DATE NOT NULL,
  passport_issued_by TEXT NOT NULL,
  education_level TEXT NOT NULL,
  education_institution TEXT NOT NULL,
  education_graduation_year INTEGER NOT NULL,
  document_number TEXT NOT NULL,
  document_date DATE NOT NULL,
  study_form TEXT NOT NULL DEFAULT 'full-time',
  funding_form TEXT NOT NULL,
  admin_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accommodation_needed BOOLEAN DEFAULT FALSE,
  olympiad_participant BOOLEAN DEFAULT FALSE,
  parent_phone TEXT,
  address TEXT,
  academic_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  education_document_number TEXT,
  education_document_date DATE,
  region_id INTEGER REFERENCES regions(id)
);

-- Таблица: application_history
CREATE TABLE IF NOT EXISTS application_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status_id INTEGER NOT NULL REFERENCES application_statuses(id),
  comment TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица: внутренние комментарии сотрудников по заявкам
CREATE TABLE IF NOT EXISTS application_staff_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица: document_types
CREATE TABLE IF NOT EXISTS document_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица: documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  document_type_id INTEGER NOT NULL REFERENCES document_types(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Таблица: olympiad_certificates
CREATE TABLE IF NOT EXISTS olympiad_certificates (
  id SERIAL PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  year INTEGER,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица: application_files
CREATE TABLE IF NOT EXISTS application_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  is_image BOOLEAN DEFAULT FALSE,
  file_category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица: education_levels
CREATE TABLE IF NOT EXISTS education_levels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- Таблица: directions
CREATE TABLE IF NOT EXISTS directions (
  id SERIAL PRIMARY KEY,
  level_id INTEGER NOT NULL REFERENCES education_levels(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL
);

-- Таблица: profiles
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  direction_id INTEGER NOT NULL REFERENCES directions(id) ON DELETE CASCADE,
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

-- Таблица: subjects
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- Таблица: profile_exams
CREATE TABLE IF NOT EXISTS profile_exams (
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL,
  PRIMARY KEY (profile_id, subject_id)
);

-- Таблица: application_choices
CREATE TABLE IF NOT EXISTS application_choices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL,
  UNIQUE (application_id, priority)
);

-- Таблица: admin_logs
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  resource_id TEXT,
  resource_type VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица: auth_audit_logs
CREATE TABLE IF NOT EXISTS auth_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  email TEXT,
  session_id UUID REFERENCES auth_sessions(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- СИСТЕМА ОБРАТНОЙ СВЯЗИ
-- ==========================================

-- Таблица: conversations (обращения)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица: messages (сообщения)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT,
  image_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица: notifications (уведомления)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'feedback_message',
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'feedback_message';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES applications(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS meta JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_revoked_at ON auth_sessions (revoked_at);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_hash ON auth_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_email_type ON auth_tokens (LOWER(email), type);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens (expires_at);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_invitations_token_hash ON invitations (token_hash);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON invitations (expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id ON auth_audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_event ON auth_audit_logs (event);

-- Индексы: система обратной связи
CREATE INDEX IF NOT EXISTS idx_conversations_student_id ON conversations (student_id);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to ON conversations (assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations (status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations (last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages (is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications (user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications (type);
CREATE INDEX IF NOT EXISTS idx_notifications_application_id ON notifications (application_id);

-- Наполнение справочников базовыми данными

-- Роли
INSERT INTO roles (id, name, description) VALUES
  (1, 'applicant', 'Абитуриент'),
  (2, 'admin', 'Администратор'),
  (3, 'reviewer', 'Модератор / Ревьюер')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Уровни образования
INSERT INTO education_levels (id, name) VALUES
  (1, 'Бакалавриат'),
  (2, 'Специалитет')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Предметы
INSERT INTO subjects (id, name) VALUES
  (1, 'Математика'),
  (2, 'Русский язык'),
  (3, 'Английский язык')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Направления подготовки
INSERT INTO directions (id, level_id, code, name) VALUES
  (1, 2, '21.05.03', 'Технология геологической разведки'),
  (2, 1, '21.03.01', 'Нефтегазовое дело'),
  (3, 2, '21.05.06', 'Нефтегазовые техника и технологии'),
  (4, 1, '38.03.01', 'Экономика'),
  (5, 1, '38.03.02', 'Менеджмент')
ON CONFLICT (id) DO UPDATE SET level_id = EXCLUDED.level_id, code = EXCLUDED.code, name = EXCLUDED.name;

-- Профили подготовки
INSERT INTO profiles (id, direction_id, name, description, duration_years, tuition_fee) VALUES
  -- 21.05.03
  (1, 1, 'Цифровой геоинжиниринг (УГЦ)', 'Подготовка специалистов в области цифрового моделирования месторождений.', 5.0, 'Контракт'),
  -- 21.03.01
  (2, 2, 'Бурение нефтяных и газовых скважин (УРБ)', 'Профиль подготовки специалистов по бурению скважин на суше и море.', 4.0, 'Контракт'),
  (3, 2, 'Эксплуатация и обслуживание объектов добычи нефти (УРН)', 'Обучение методам разработки и эксплуатации нефтяных месторождений.', 4.0, 'Контракт'),
  (4, 2, 'Эксплуатация и обслуживание объектов добычи газа, газоконденсата и подземных хранилищ (УРГ)', 'Подготовка кадров для газодобывающего сектора.', 4.0, 'Контракт'),
  (5, 2, 'Эксплуатация и обслуживание объектов транспорта и хранения нефти, газа и продуктов переработки (УТП)', 'Обучение проектированию и эксплуатации трубопроводов и хранилищ.', 4.0, 'Контракт'),
  -- 21.05.06
  (6, 3, 'Технология бурения нефтяных и газовых скважин на суше и море (УРТ)', 'Глубокая подготовка инженеров-буровиков.', 5.0, 'Контракт'),
  (7, 3, 'Разработка и эксплуатация нефтяных месторождений (УРС)', 'Проектирование и управление процессом нефтедобычи.', 5.0, 'Контракт'),
  (8, 3, 'Разработка и эксплуатация газовых и газоконденсатных месторождений (УРИ)', 'Управление процессами добычи газа.', 5.0, 'Контракт'),
  -- 38.03.01
  (9, 4, 'Экономика и проекты устойчивого развития энергетики (УЭЭ)', 'Подготовка экономистов для ТЭК.', 4.0, 'Контракт'),
  -- 38.03.02
  (10, 5, 'Управление бизнесом в энергетике (УЭМ)', 'Подготовка менеджеров и аналитиков.', 4.0, 'Контракт'),
  (11, 5, 'Международный менеджмент (УБМ)', 'Подготовка управленцев для международных энергетических проектов.', 4.0, 'Контракт')
ON CONFLICT (id) DO UPDATE SET direction_id = EXCLUDED.direction_id, name = EXCLUDED.name, description = EXCLUDED.description, duration_years = EXCLUDED.duration_years;

-- Вступительные экзамены для профилей
-- Технические направления (Математика - 1, Русский язык - 2)
INSERT INTO profile_exams (profile_id, subject_id, priority) VALUES
  (1, 1, 1), (1, 2, 2), -- Цифровой геоинжиниринг
  (2, 1, 1), (2, 2, 2), -- Бурение скважин
  (3, 1, 1), (3, 2, 2), -- Эксплуатация нефть
  (4, 1, 1), (4, 2, 2), -- Эксплуатация газ
  (5, 1, 1), (5, 2, 2), -- Транспорт и хранение
  (6, 1, 1), (6, 2, 2), -- Технология бурения УРТ
  (7, 1, 1), (7, 2, 2), -- Разработка УРС
  (8, 1, 1), (8, 2, 2)  -- Разработка УРИ
ON CONFLICT (profile_id, subject_id) DO NOTHING;

-- Экономические и управленческие направления (Математика - 1, Английский - 3, Русский - 2)
INSERT INTO profile_exams (profile_id, subject_id, priority) VALUES
  (9, 1, 1), (9, 3, 2), (9, 2, 3),  -- Экономика УЭЭ
  (10, 1, 1), (10, 3, 2), (10, 2, 3), -- Менеджмент УЭМ
  (11, 1, 1), (11, 3, 2), (11, 2, 3)  -- Менеджмент УБМ
ON CONFLICT (profile_id, subject_id) DO NOTHING;

-- Статусы заявлений
INSERT INTO application_statuses (id, name, description, color) VALUES
  (1, 'Черновик', 'Заявление создано, но еще не отправлено на модерацию', 'gray'),
  (2, 'Подано', 'Заявление отправлено в приемную комиссию на проверку', 'blue'),
  (3, 'Принято', 'Документы успешно проверены и приняты', 'green'),
  (4, 'Отклонено', 'Заявление отклонено по причине ошибок в документах', 'red'),
  (5, 'Отозвано', 'Заявление отозвано абитуриентом', 'yellow')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, color = EXCLUDED.color;

-- Типы документов
INSERT INTO document_types (id, name, description, is_required) VALUES
  (1, 'passport', 'Скан-копия паспорта (или ID-карты)', true),
  (2, 'education_document', 'Документ об образовании (аттестат или диплом)', true),
  (3, 'photo', 'Фотография 3х4 см на белом фоне', true),
  (4, 'medical_certificate', 'Медицинская справка по форме 086', false),
  (5, 'military_id', 'Копия военного билета или приписного свидетельства', false),
  (6, 'additional', 'Дополнительные документы', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, is_required = EXCLUDED.is_required;

-- Регионы Узбекистана для удобства
INSERT INTO regions (id, name, code) VALUES
  (1, 'г. Ташкент', 'TAS'),
  (2, 'Ташкентская область', 'TO'),
  (3, 'Самаркандская область', 'SAM'),
  (4, 'Ферганская область', 'FER'),
  (5, 'Андижанская область', 'AND'),
  (6, 'Наманганская область', 'NAM'),
  (7, 'Бухарская область', 'BUX'),
  (8, 'Навоийская область', 'NAV'),
  (9, 'Кашкадарьинская область', 'QAS'),
  (10, 'Сурхандарьинская область', 'SUR'),
  (11, 'Джизакская область', 'JIZ'),
  (12, 'Сырдарьинская область', 'SYR'),
  (13, 'Хорезмская область', 'XOR'),
  (14, 'Республика Каракалпакстан', 'QR')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;
