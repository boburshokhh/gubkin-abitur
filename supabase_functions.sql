-- Функция для получения всех пользователей
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  first_name text,
  last_name text,
  role_id int,
  created_at timestamptz
) SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    users.id,
    users.email,
    users.first_name,
    users.last_name,
    users.role_id,
    users.created_at
  FROM users
  ORDER BY users.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Функция для обновления роли пользователя
CREATE OR REPLACE FUNCTION update_user_role(user_id uuid, new_role_id int)
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
  UPDATE users
  SET role_id = new_role_id
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql; 