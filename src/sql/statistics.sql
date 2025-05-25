-- Хранимые процедуры для получения статистики заявок

-- Функция для получения статистики заявок по дням за последний месяц
CREATE OR REPLACE FUNCTION get_applications_daily_stats()
RETURNS TABLE(date date, count bigint) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      current_date - interval '30 days',
      current_date,
      interval '1 day'
    )::date as day
  )
  SELECT 
    d.day::date, 
    COUNT(a.id)::bigint
  FROM 
    date_series d
  LEFT JOIN 
    applications a ON date_trunc('day', a.created_at)::date = d.day
  GROUP BY 
    d.day
  ORDER BY 
    d.day;
END;
$$;

-- Функция для получения статистики заявок по направлениям
CREATE OR REPLACE FUNCTION get_applications_by_direction()
RETURNS TABLE(direction_id uuid, direction_name text, count bigint) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id, 
    d.name, 
    COUNT(a.id)::bigint
  FROM 
    directions d
  LEFT JOIN 
    applications a ON a.direction_id = d.id
  GROUP BY 
    d.id, d.name
  ORDER BY 
    COUNT(a.id) DESC;
END;
$$;

-- Функция для получения статистики заявок по статусам
CREATE OR REPLACE FUNCTION get_applications_by_status()
RETURNS TABLE(status text, count bigint) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.status, 
    COUNT(a.id)::bigint
  FROM 
    applications a
  GROUP BY 
    a.status
  ORDER BY 
    COUNT(a.id) DESC;
END;
$$;

-- Таблица статусов заявок (если её ещё нет)
-- Предполагается, что статусы хранятся в поле status типа text в таблице applications
-- Но для удобства управления можно создать отдельную таблицу
CREATE TABLE IF NOT EXISTS application_statuses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  color TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Заполнение таблицы статусов, если она пуста
INSERT INTO application_statuses (name, display_name, color, description)
SELECT * FROM (
  VALUES 
    ('draft', 'Черновик', '#9CA3AF', 'Заявка сохранена как черновик'),
    ('submitted', 'Отправлено', '#3B82F6', 'Заявка отправлена на рассмотрение'),
    ('pending', 'На рассмотрении', '#F59E0B', 'Заявка в процессе рассмотрения'),
    ('accepted', 'Принято', '#10B981', 'Заявка принята'),
    ('rejected', 'Отклонено', '#EF4444', 'Заявка отклонена'),
    ('cancelled', 'Отменено', '#6B7280', 'Заявка отменена абитуриентом')
) AS statuses(name, display_name, color, description)
WHERE NOT EXISTS (SELECT 1 FROM application_statuses LIMIT 1);

-- Добавление полномочий для административного интерфейса
-- Разрешаем администраторам и сотрудникам приемной комиссии просматривать все заявки
CREATE POLICY IF NOT EXISTS "admin_reviewers_applications_view" 
ON applications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND (users.role_id = 2 OR users.role_id = 3)
  )
);

-- Разрешаем доступ к функциям статистики для админов и членов приемной комиссии
GRANT EXECUTE ON FUNCTION get_applications_daily_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_applications_by_direction TO authenticated;
GRANT EXECUTE ON FUNCTION get_applications_by_status TO authenticated; 