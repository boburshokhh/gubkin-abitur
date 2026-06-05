-- Функции базы данных для системы приема абитуриентов

-- 1. Получение профиля по ID
CREATE OR REPLACE FUNCTION get_profile_by_id(p_profile_id INTEGER)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', p.id,
    'name', p.name,
    'description', p.description,
    'duration_years', p.duration_years,
    'credits', p.credits,
    'tuition_fee', p.tuition_fee,
    'career_info', p.career_info,
    'internship_info', p.internship_info,
    'tags', p.tags,
    'a_day_in_life', p.a_day_in_life,
    'direction', jsonb_build_object(
      'id', d.id,
      'code', d.code,
      'name', d.name,
      'level', jsonb_build_object(
        'id', el.id,
        'name', el.name
      )
    ),
    'exams', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'priority', pe.priority,
            'subject', jsonb_build_object(
              'id', s.id,
              'name', s.name
            )
          ) ORDER BY pe.priority
        )
        FROM profile_exams pe
        JOIN subjects s ON s.id = pe.subject_id
        WHERE pe.profile_id = p.id
      ), '[]'::jsonb
    )
  ) INTO v_result
  FROM profiles p
  JOIN directions d ON d.id = p.direction_id
  JOIN education_levels el ON el.id = d.level_id
  WHERE p.id = p_profile_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 2. Получение списка профилей
CREATE OR REPLACE FUNCTION get_profiles(
  p_level_id INTEGER DEFAULT NULL,
  p_direction_id INTEGER DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  profiles JSONB,
  total_count BIGINT
) AS $$
DECLARE
  v_total_count BIGINT;
BEGIN
  -- Считаем общее количество
  SELECT COUNT(*) INTO v_total_count
  FROM profiles p
  JOIN directions d ON d.id = p.direction_id
  WHERE (p_level_id IS NULL OR d.level_id = p_level_id)
    AND (p_direction_id IS NULL OR d.id = p_direction_id)
    AND (p_search IS NULL OR p.name ILIKE '%' || p_search || '%' OR d.name ILIKE '%' || p_search || '%' OR d.code ILIKE '%' || p_search || '%');

  RETURN QUERY
  SELECT 
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'name', t.name,
          'description', t.description,
          'duration_years', t.duration_years,
          'credits', t.credits,
          'tuition_fee', t.tuition_fee,
          'tags', t.tags,
          'direction', jsonb_build_object(
            'id', t.dir_id,
            'code', t.dir_code,
            'name', t.dir_name,
            'level', jsonb_build_object(
              'id', t.lev_id,
              'name', t.lev_name
            )
          ),
          'exams', COALESCE(
            (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'priority', pe.priority,
                  'subject', jsonb_build_object(
                    'id', s.id,
                    'name', s.name
                  )
                ) ORDER BY pe.priority
              )
              FROM profile_exams pe
              JOIN subjects s ON s.id = pe.subject_id
              WHERE pe.profile_id = t.id
            ), '[]'::jsonb
          )
        )
      ), '[]'::jsonb
    ) AS profiles,
    v_total_count AS total_count
  FROM (
    SELECT 
      p.id, p.name, p.description, p.duration_years, p.credits, p.tuition_fee, p.tags,
      d.id AS dir_id, d.code AS dir_code, d.name AS dir_name,
      el.id AS lev_id, el.name AS lev_name
    FROM profiles p
    JOIN directions d ON d.id = p.direction_id
    JOIN education_levels el ON el.id = d.level_id
    WHERE (p_level_id IS NULL OR d.level_id = p_level_id)
      AND (p_direction_id IS NULL OR d.id = p_direction_id)
      AND (p_search IS NULL OR p.name ILIKE '%' || p_search || '%' OR d.name ILIKE '%' || p_search || '%' OR d.code ILIKE '%' || p_search || '%')
    ORDER BY p.name
    LIMIT p_limit
    OFFSET p_offset
  ) t;
END;
$$ LANGUAGE plpgsql;

-- 3. Совместимые профили (по набору экзаменов)
CREATE OR REPLACE FUNCTION get_compatible_profiles(
  p_application_id UUID,
  p_search TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  profiles JSONB,
  total_count BIGINT
) AS $$
DECLARE
  v_primary_profile_id INTEGER;
  v_exam_subjects_hash TEXT;
  v_total_count BIGINT;
BEGIN
  -- Находим первый (основной) выбранный профиль
  SELECT profile_id INTO v_primary_profile_id
  FROM application_choices
  WHERE application_id = p_application_id AND priority = 1;

  -- Если выбор не найден, возвращаем пустую таблицу
  IF v_primary_profile_id IS NULL THEN
    RETURN QUERY SELECT '[]'::jsonb, 0::bigint;
    RETURN;
  END IF;

  -- Получаем отсортированный список предметов для основного профиля в виде строки для сверки
  SELECT string_agg(subject_id::text, ',' ORDER BY subject_id) INTO v_exam_subjects_hash
  FROM profile_exams
  WHERE profile_id = v_primary_profile_id;

  -- Находим все профили, у которых точно такой же набор экзаменов
  WITH compatible_ids AS (
    SELECT pe.profile_id
    FROM profile_exams pe
    GROUP BY pe.profile_id
    HAVING string_agg(pe.subject_id::text, ',' ORDER BY pe.subject_id) = v_exam_subjects_hash
  )
  SELECT COUNT(*) INTO v_total_count
  FROM profiles p
  JOIN directions d ON d.id = p.direction_id
  WHERE p.id IN (SELECT profile_id FROM compatible_ids)
    AND p.id <> v_primary_profile_id
    AND (p_search IS NULL OR p.name ILIKE '%' || p_search || '%' OR d.name ILIKE '%' || p_search || '%' OR d.code ILIKE '%' || p_search || '%');

  RETURN QUERY
  WITH compatible_ids AS (
    SELECT pe.profile_id
    FROM profile_exams pe
    GROUP BY pe.profile_id
    HAVING string_agg(pe.subject_id::text, ',' ORDER BY pe.subject_id) = v_exam_subjects_hash
  )
  SELECT 
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'name', t.name,
          'description', t.description,
          'duration_years', t.duration_years,
          'credits', t.credits,
          'tuition_fee', t.tuition_fee,
          'tags', t.tags,
          'direction', jsonb_build_object(
            'id', t.dir_id,
            'code', t.dir_code,
            'name', t.dir_name,
            'level', jsonb_build_object(
              'id', t.lev_id,
              'name', t.lev_name
            )
          )
        )
      ), '[]'::jsonb
    ) AS profiles,
    v_total_count AS total_count
  FROM (
    SELECT 
      p.id, p.name, p.description, p.duration_years, p.credits, p.tuition_fee, p.tags,
      d.id AS dir_id, d.code AS dir_code, d.name AS dir_name,
      el.id AS lev_id, el.name AS lev_name
    FROM profiles p
    JOIN directions d ON d.id = p.direction_id
    JOIN education_levels el ON el.id = d.level_id
    WHERE p.id IN (SELECT profile_id FROM compatible_ids)
      AND p.id <> v_primary_profile_id
      AND (p_search IS NULL OR p.name ILIKE '%' || p_search || '%' OR d.name ILIKE '%' || p_search || '%' OR d.code ILIKE '%' || p_search || '%')
    ORDER BY p.name
    LIMIT p_limit
    OFFSET p_offset
  ) t;
END;
$$ LANGUAGE plpgsql;

-- 4. Получение фильтрованного списка заявлений
CREATE OR REPLACE FUNCTION get_filtered_applications(
  p_status_id INTEGER DEFAULT NULL,
  p_level_id INTEGER DEFAULT NULL,
  p_direction_id INTEGER DEFAULT NULL,
  p_profile_id INTEGER DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL,
  p_page_number INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  status_id INTEGER,
  status_name TEXT,
  applicant_full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  direction_id INTEGER,
  direction_code VARCHAR,
  direction_name VARCHAR,
  profile_id INTEGER,
  profile_name VARCHAR,
  choices JSONB,
  total_count BIGINT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  v_offset INTEGER;
  v_total_count BIGINT;
BEGIN
  v_offset := (p_page_number - 1) * p_page_size;

  -- Считаем общее количество с учетом фильтров
  SELECT COUNT(DISTINCT a.id) INTO v_total_count
  FROM applications a
  JOIN users u ON u.id = a.user_id
  LEFT JOIN application_choices ac ON ac.application_id = a.id AND ac.priority = 1
  LEFT JOIN profiles p ON p.id = ac.profile_id
  LEFT JOIN directions d ON d.id = p.direction_id
  WHERE (p_status_id IS NULL OR a.status_id = p_status_id)
    AND (p_level_id IS NULL OR d.level_id = p_level_id)
    AND (p_direction_id IS NULL OR d.id = p_direction_id)
    AND (p_profile_id IS NULL OR p.id = p_profile_id)
    AND (
      p_search_query IS NULL 
      OR u.first_name ILIKE '%' || p_search_query || '%' 
      OR u.last_name ILIKE '%' || p_search_query || '%' 
      OR u.middle_name ILIKE '%' || p_search_query || '%' 
      OR u.email ILIKE '%' || p_search_query || '%'
    );

  RETURN QUERY
  SELECT 
    a.id,
    a.user_id,
    a.status_id,
    as_status.name AS status_name,
    (u.last_name || ' ' || u.first_name || ' ' || COALESCE(u.middle_name, ''))::TEXT AS applicant_full_name,
    u.first_name,
    u.last_name,
    d.id AS direction_id,
    d.code AS direction_code,
    d.name AS direction_name,
    p.id AS profile_id,
    p.name AS profile_name,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', ac_sub.id,
            'profile_id', ac_sub.profile_id,
            'priority', ac_sub.priority,
            'profile', jsonb_build_object(
              'id', p_sub.id,
              'name', p_sub.name,
              'direction', jsonb_build_object(
                'id', d_sub.id,
                'code', d_sub.code,
                'name', d_sub.name
              )
            )
          ) ORDER BY ac_sub.priority
        )
        FROM application_choices ac_sub
        JOIN profiles p_sub ON p_sub.id = ac_sub.profile_id
        JOIN directions d_sub ON d_sub.id = p_sub.direction_id
        WHERE ac_sub.application_id = a.id
      ), '[]'::jsonb
    ) AS choices,
    v_total_count AS total_count,
    a.created_at,
    a.updated_at
  FROM applications a
  JOIN users u ON u.id = a.user_id
  JOIN application_statuses as_status ON as_status.id = a.status_id
  LEFT JOIN application_choices ac ON ac.application_id = a.id AND ac.priority = 1
  LEFT JOIN profiles p ON p.id = ac.profile_id
  LEFT JOIN directions d ON d.id = p.direction_id
  WHERE (p_status_id IS NULL OR a.status_id = p_status_id)
    AND (p_level_id IS NULL OR d.level_id = p_level_id)
    AND (p_direction_id IS NULL OR d.id = p_direction_id)
    AND (p_profile_id IS NULL OR p.id = p_profile_id)
    AND (
      p_search_query IS NULL 
      OR u.first_name ILIKE '%' || p_search_query || '%' 
      OR u.last_name ILIKE '%' || p_search_query || '%' 
      OR u.middle_name ILIKE '%' || p_search_query || '%' 
      OR u.email ILIKE '%' || p_search_query || '%'
    )
  ORDER BY a.created_at DESC
  LIMIT p_page_size
  OFFSET v_offset;
END;
$$ LANGUAGE plpgsql;

-- 5. Получение детальной информации о заявлении
CREATE OR REPLACE FUNCTION get_application_details(app_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', a.id,
    'user_id', a.user_id,
    'status_id', a.status_id,
    'passport_series', a.passport_series,
    'passport_issue_date', a.passport_issue_date,
    'passport_issued_by', a.passport_issued_by,
    'education_level', a.education_level,
    'education_institution', a.education_institution,
    'education_graduation_year', a.education_graduation_year,
    'document_number', a.document_number,
    'document_date', a.document_date,
    'study_form', a.study_form,
    'funding_form', a.funding_form,
    'admin_comment', a.admin_comment,
    'accommodation_needed', a.accommodation_needed,
    'olympiad_participant', a.olympiad_participant,
    'parent_phone', a.parent_phone,
    'address', a.address,
    'academic_year', a.academic_year,
    'education_document_number', a.education_document_number,
    'education_document_date', a.education_document_date,
    'region_id', a.region_id,
    'region', CASE
      WHEN r.id IS NULL THEN NULL
      ELSE jsonb_build_object(
        'id', r.id,
        'name', r.name,
        'code', r.code
      )
    END,
    'created_at', a.created_at,
    'updated_at', a.updated_at,
    'user', jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'first_name', u.first_name,
      'last_name', u.last_name,
      'middle_name', u.middle_name,
      'phone', u.phone,
      'birth_date', u.birth_date,
      'gender', u.gender,
      'full_name', u.last_name || ' ' || u.first_name || ' ' || COALESCE(u.middle_name, '')
    ),
    'status', jsonb_build_object(
      'id', as_status.id,
      'name', as_status.name,
      'color', as_status.color
    ),
    'choices', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', ac.id,
            'profile_id', ac.profile_id,
            'priority', ac.priority,
            'profile', jsonb_build_object(
              'id', p.id,
              'name', p.name,
              'direction', jsonb_build_object(
                'id', d.id,
                'code', d.code,
                'name', d.name
              )
            )
          ) ORDER BY ac.priority
        )
        FROM application_choices ac
        JOIN profiles p ON p.id = ac.profile_id
        JOIN directions d ON d.id = p.direction_id
        WHERE ac.application_id = a.id
      ), '[]'::jsonb
    ),
    'documents', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', doc.id,
            'document_type_id', doc.document_type_id,
            'file_name', doc.file_name,
            'file_path', doc.file_path,
            'file_size', doc.file_size,
            'file_type', doc.file_type,
            'status', doc.status,
            'comment', doc.comment,
            'created_at', doc.created_at,
            'document_type', jsonb_build_object(
              'id', dt.id,
              'name', dt.name,
              'is_required', dt.is_required
            )
          )
        )
        FROM documents doc
        JOIN document_types dt ON dt.id = doc.document_type_id
        WHERE doc.application_id = a.id
      ), '[]'::jsonb
    ),
    'application_files', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', af.id,
            'file_path', af.file_path,
            'file_name', af.file_name,
            'file_type', af.file_type,
            'file_size', af.file_size,
            'is_image', af.is_image,
            'file_category', af.file_category,
            'created_at', af.created_at
          )
        )
        FROM application_files af
        WHERE af.application_id = a.id
      ), '[]'::jsonb
    ),
    'olympiad_certificates', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', oc.id,
            'name', oc.name,
            'year', oc.year,
            'file_path', oc.file_path,
            'file_size', oc.file_size,
            'file_type', oc.file_type,
            'created_at', oc.created_at
          )
        )
        FROM olympiad_certificates oc
        WHERE oc.application_id = a.id
      ), '[]'::jsonb
    ),
    'application_history', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', h.id,
            'status_id', h.status_id,
            'comment', h.comment,
            'created_by', h.created_by,
            'created_at', h.created_at,
            'status', jsonb_build_object(
              'id', hs.id,
              'name', hs.name,
              'color', hs.color
            )
          ) ORDER BY h.created_at DESC
        )
        FROM application_history h
        JOIN application_statuses hs ON hs.id = h.status_id
        WHERE h.application_id = a.id
      ), '[]'::jsonb
    )
  ) INTO v_result
  FROM applications a
  JOIN users u ON u.id = a.user_id
  JOIN application_statuses as_status ON as_status.id = a.status_id
  LEFT JOIN regions r ON r.id = COALESCE(a.region_id, u.region_id)
  WHERE a.id = app_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 6. Загрузка/создание записи документа
CREATE OR REPLACE FUNCTION upload_document(
  p_application_id UUID,
  p_document_type_id INTEGER,
  p_file_name TEXT,
  p_file_path TEXT,
  p_file_size INTEGER,
  p_file_type TEXT
)
RETURNS UUID AS $$
DECLARE
  v_doc_id UUID;
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id FROM applications WHERE id = p_application_id;

  INSERT INTO documents (
    application_id,
    document_type_id,
    file_name,
    file_path,
    file_size,
    file_type,
    status,
    user_id,
    created_at,
    updated_at
  ) VALUES (
    p_application_id,
    p_document_type_id,
    p_file_name,
    p_file_path,
    p_file_size,
    p_file_type,
    'pending',
    v_user_id,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_doc_id;

  RETURN v_doc_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Загрузка файла заявления
CREATE OR REPLACE FUNCTION upload_application_file(
  p_application_id UUID,
  p_file_path TEXT,
  p_file_name TEXT,
  p_file_type TEXT,
  p_file_size INTEGER,
  p_is_image BOOLEAN DEFAULT FALSE,
  p_file_category TEXT DEFAULT 'general'
)
RETURNS UUID AS $$
DECLARE
  v_file_id UUID;
BEGIN
  INSERT INTO application_files (
    application_id,
    file_path,
    file_name,
    file_type,
    file_size,
    is_image,
    file_category,
    created_at
  ) VALUES (
    p_application_id,
    p_file_path,
    p_file_name,
    p_file_type,
    p_file_size,
    p_is_image,
    p_file_category,
    NOW()
  )
  RETURNING id INTO v_file_id;

  RETURN v_file_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Загрузка сертификата олимпиады
CREATE OR REPLACE FUNCTION upload_olympiad_certificate(
  p_application_id UUID,
  p_file_name TEXT,
  p_file_path TEXT,
  p_file_size INTEGER,
  p_file_type TEXT,
  p_year INTEGER DEFAULT 2025
)
RETURNS INTEGER AS $$
DECLARE
  v_cert_id INTEGER;
BEGIN
  INSERT INTO olympiad_certificates (
    application_id,
    name,
    year,
    file_path,
    file_size,
    file_type,
    created_at,
    updated_at
  ) VALUES (
    p_application_id,
    p_file_name,
    p_year,
    p_file_path,
    p_file_size,
    p_file_type,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_cert_id;

  RETURN v_cert_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Получение документов заявления
CREATE OR REPLACE FUNCTION get_application_documents(p_application_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', d.id,
        'application_id', d.application_id,
        'document_type_id', d.document_type_id,
        'file_name', d.file_name,
        'file_path', d.file_path,
        'file_size', d.file_size,
        'file_type', d.file_type,
        'status', d.status,
        'comment', d.comment,
        'created_at', d.created_at,
        'updated_at', d.updated_at,
        'document_type', jsonb_build_object(
          'id', dt.id,
          'name', dt.name,
          'is_required', dt.is_required
        )
      )
    ), '[]'::jsonb
  ) INTO v_result
  FROM documents d
  JOIN document_types dt ON dt.id = d.document_type_id
  WHERE d.application_id = p_application_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 10. Добавление комментария и статуса заявления
CREATE OR REPLACE FUNCTION add_application_comment(
  app_id UUID,
  new_status_id INTEGER,
  comment_text TEXT,
  user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Обновляем статус и комментарий в основном заявлении
  UPDATE applications
  SET status_id = new_status_id,
      admin_comment = comment_text,
      updated_at = NOW()
  WHERE id = app_id;

  -- Записываем в историю
  INSERT INTO application_history (
    application_id,
    status_id,
    comment,
    created_by,
    created_at
  ) VALUES (
    app_id,
    new_status_id,
    comment_text,
    user_id,
    NOW()
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 11. Получение сертификата олимпиады по ID (с проверкой)
CREATE OR REPLACE FUNCTION get_olympiad_certificate_signed_url(p_certificate_id INTEGER)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', oc.id,
    'file_path', oc.file_path,
    'file_name', oc.name,
    'file_size', oc.file_size,
    'file_type', oc.file_type
  ) INTO v_result
  FROM olympiad_certificates oc
  WHERE oc.id = p_certificate_id;

  IF v_result IS NULL THEN
    RETURN jsonb_build_object('error', 'Сертификат не найден');
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 12. Аналитика и статистика
CREATE OR REPLACE FUNCTION get_public_general_stats()
RETURNS JSONB AS $$
DECLARE
  v_total_applications BIGINT;
  v_total_accepted BIGINT;
  v_total_pending BIGINT;
  v_total_applicants BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_total_applications FROM applications;
  SELECT COUNT(*) INTO v_total_accepted FROM applications WHERE status_id = 3;
  SELECT COUNT(*) INTO v_total_pending FROM applications WHERE status_id = 2;
  SELECT COUNT(DISTINCT user_id) INTO v_total_applicants FROM applications;

  RETURN jsonb_build_object(
    'total_applications', v_total_applications,
    'total_accepted', v_total_accepted,
    'total_pending', v_total_pending,
    'total_applicants', v_total_applicants
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_public_daily_stats(p_days_limit INTEGER DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'date', t.date_series::date,
        'count', COALESCE(t.cnt, 0)
      ) ORDER BY t.date_series
    ), '[]'::jsonb
  ) INTO v_result
  FROM (
    SELECT gs.date_series, COUNT(a.id) AS cnt
    FROM generate_series(CURRENT_DATE - (p_days_limit - 1) * INTERVAL '1 day', CURRENT_DATE, '1 day'::interval) gs(date_series)
    LEFT JOIN applications a ON a.created_at::date = gs.date_series::date
    GROUP BY gs.date_series
  ) t;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_public_regional_stats()
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'region_id', r.id,
        'region_name', r.name,
        'count', COUNT(a.id)
      ) ORDER BY COUNT(a.id) DESC
    ), '[]'::jsonb
  ) INTO v_result
  FROM regions r
  JOIN applications a ON a.region_id = r.id
  GROUP BY r.id, r.name;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_public_program_stats()
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'profile_id', p.id,
        'profile_name', p.name,
        'direction_code', d.code,
        'count', COUNT(ac.id)
      ) ORDER BY COUNT(ac.id) DESC
    ), '[]'::jsonb
  ) INTO v_result
  FROM profiles p
  JOIN directions d ON d.id = p.direction_id
  LEFT JOIN application_choices ac ON ac.profile_id = p.id AND ac.priority = 1
  GROUP BY p.id, p.name, d.code;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_public_status_stats()
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'status_id', s.id,
        'status_name', s.name,
        'color', s.color,
        'count', COUNT(a.id)
      ) ORDER BY s.id
    ), '[]'::jsonb
  ) INTO v_result
  FROM application_statuses s
  LEFT JOIN applications a ON a.status_id = s.id
  GROUP BY s.id, s.name, s.color;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 13. Получение данных всех абитуриентов для экспорта Excel
CREATE OR REPLACE FUNCTION get_all_applicants_data()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  middle_name TEXT,
  phone TEXT,
  address TEXT,
  birth_date DATE,
  gender TEXT,
  application_id UUID,
  direction_code VARCHAR,
  direction_name VARCHAR,
  application_status TEXT,
  passport_series TEXT,
  passport_issue_date DATE,
  passport_issued_by TEXT,
  education_level TEXT,
  education_institution TEXT,
  education_graduation_year INTEGER,
  document_number TEXT,
  document_date DATE,
  study_form TEXT,
  funding_form TEXT,
  admin_comment TEXT,
  application_created_at TIMESTAMPTZ,
  documents_count INTEGER,
  doc_passport TEXT,
  doc_education TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id AS user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.middle_name,
    u.phone,
    a.address,
    u.birth_date,
    u.gender,
    a.id AS application_id,
    d.code AS direction_code,
    d.name AS direction_name,
    as_status.name AS application_status,
    a.passport_series,
    a.passport_issue_date,
    a.passport_issued_by,
    a.education_level,
    a.education_institution,
    a.education_graduation_year,
    a.document_number,
    a.document_date,
    a.study_form,
    a.funding_form,
    a.admin_comment,
    a.created_at AS application_created_at,
    (SELECT COUNT(*)::INTEGER FROM documents WHERE application_id = a.id) AS documents_count,
    (SELECT file_path FROM documents WHERE application_id = a.id AND document_type_id = 1 LIMIT 1) AS doc_passport,
    (SELECT file_path FROM documents WHERE application_id = a.id AND document_type_id = 2 LIMIT 1) AS doc_education
  FROM applications a
  JOIN users u ON u.id = a.user_id
  JOIN application_statuses as_status ON as_status.id = a.status_id
  LEFT JOIN application_choices ac ON ac.application_id = a.id AND ac.priority = 1
  LEFT JOIN profiles p ON p.id = ac.profile_id
  LEFT JOIN directions d ON d.id = p.direction_id
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql;
