-- Идемпотентная миграция: is_foreign_residence + address NOT NULL
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS is_foreign_residence BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE applications
SET is_foreign_residence = TRUE
WHERE region_id IS NULL AND is_foreign_residence = FALSE;

UPDATE applications
SET address = 'Не указан'
WHERE address IS NULL OR address = '';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'applications'
      AND column_name = 'address'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE applications ALTER COLUMN address SET NOT NULL;
  END IF;
END $$;
