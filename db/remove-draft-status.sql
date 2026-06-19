-- Миграция: удаление статуса «Черновик» из системы подачи заявок
-- Применять ОДИН РАЗ на production-базе.
-- Безопасно повторное выполнение (все операции идемпотентны или защищены условиями).

BEGIN;

-- 1. Перевести все существующие черновики в «Подано»
UPDATE applications
SET status_id = 2, updated_at = NOW()
WHERE status_id = 1;

-- 2. Добавить запись в историю для каждого переведённого черновика
--    (только если запись «Подано» ещё не существует)
INSERT INTO application_history (application_id, status_id, comment, created_by)
SELECT a.id, 2, 'Миграция: черновик переведён в «Подано»', a.user_id
FROM applications a
WHERE a.status_id = 2
  AND NOT EXISTS (
    SELECT 1 FROM application_history h
    WHERE h.application_id = a.id AND h.status_id = 2
  );

-- 3. Изменить DEFAULT для status_id с 1 на 2
ALTER TABLE applications ALTER COLUMN status_id SET DEFAULT 2;

-- 4. Удалить статус «Черновик» из справочника
--    (FK application_history.status_id ON DELETE RESTRICT защитит от ошибки,
--     если есть исторические записи — но мы уже перевели все черновики,
--     поэтому сначала обнуляем ссылки в истории на старый статус)
UPDATE application_history
SET status_id = 2
WHERE status_id = 1;

DELETE FROM application_statuses WHERE id = 1;

COMMIT;
