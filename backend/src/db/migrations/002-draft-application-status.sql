-- Статус «Черновик» для пошаговой загрузки файлов
INSERT INTO application_statuses (id, name, description, color) VALUES
  (1, 'Черновик', 'Заявление заполняется, файлы загружаются', 'gray')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color;
