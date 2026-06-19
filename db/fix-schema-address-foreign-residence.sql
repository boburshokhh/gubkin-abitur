-- Миграция: привести схему address к NOT NULL + добавить is_foreign_residence
-- Применять ОДИН РАЗ на production-базе.
-- Безопасно повторное выполнение (все операции идемпотентны или защищены условиями).

BEGIN;

-- 1. Добавить колонку is_foreign_residence (если ещё нет)
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS is_foreign_residence BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Обновить существующие строки: если region_id IS NULL — считаем иностранным адресом
UPDATE applications
SET is_foreign_residence = TRUE
WHERE region_id IS NULL AND is_foreign_residence = FALSE;

-- 3. Заполнить пустой address заглушкой, чтобы можно было поставить NOT NULL
UPDATE applications
SET address = 'Не указан'
WHERE address IS NULL OR address = '';

-- 4. Привести address к NOT NULL (только если колонка ещё допускает NULL)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'applications'
      AND column_name = 'address'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE applications ALTER COLUMN address SET NOT NULL;
  END IF;
END $$;

COMMIT;
