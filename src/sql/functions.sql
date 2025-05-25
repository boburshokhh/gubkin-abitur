-- Функция для обновления статуса заявки с добавлением в историю
CREATE OR REPLACE FUNCTION update_application_status(
  p_application_id UUID,
  p_status_id INTEGER,
  p_comment TEXT DEFAULT NULL
)
RETURNS SETOF applications
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Получаем ID текущего пользователя
  v_user_id := auth.uid();
  
  -- Проверяем, что пользователь авторизован
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Пользователь не авторизован';
  END IF;
  
  -- Проверяем, что пользователь имеет права на обновление заявки
  -- (администратор или член приемной комиссии)
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = v_user_id AND (role_id = 2 OR role_id = 3) -- 2 = admin, 3 = reviewer
  ) THEN
    RAISE EXCEPTION 'У вас нет прав на изменение статуса заявки';
  END IF;
  
  -- Проверяем, что заявка существует
  IF NOT EXISTS (SELECT 1 FROM applications WHERE id = p_application_id) THEN
    RAISE EXCEPTION 'Заявка с ID % не найдена', p_application_id;
  END IF;
  
  -- Проверяем, что статус существует
  IF NOT EXISTS (SELECT 1 FROM application_statuses WHERE id = p_status_id) THEN
    RAISE EXCEPTION 'Статус с ID % не найден', p_status_id;
  END IF;
  
  -- Обновляем статус заявки
  UPDATE applications 
  SET 
    status_id = p_status_id,
    updated_at = NOW(),
    admin_comment = p_comment
  WHERE id = p_application_id;
  
  -- Добавляем запись в историю изменений
  INSERT INTO application_history (
    application_id,
    status_id,
    comment,
    created_by,
    created_at
  ) VALUES (
    p_application_id,
    p_status_id,
    p_comment,
    v_user_id,
    NOW()
  );
  
  -- Возвращаем обновленную заявку
  RETURN QUERY
  SELECT * FROM applications WHERE id = p_application_id;
END;
$$; 