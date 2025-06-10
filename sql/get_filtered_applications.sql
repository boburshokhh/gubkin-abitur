CREATE OR REPLACE FUNCTION get_filtered_applications(
    p_status_id INT,
    p_level_id INT,
    p_direction_id INT,
    p_profile_id INT,
    p_search_query TEXT,
    p_page_number INT,
    p_page_size INT
)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    status_id INT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    total_count BIGINT,
    applicant_full_name TEXT,
    status_name TEXT,
    choices JSON
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_application_ids AS (
        SELECT DISTINCT a.id
        FROM applications a
        LEFT JOIN application_choices ac ON a.id = ac.application_id
        LEFT JOIN profiles p ON ac.profile_id = p.id
        LEFT JOIN directions d ON p.direction_id = d.id
        LEFT JOIN auth.users u ON a.user_id = u.id
        WHERE
            (p_status_id IS NULL OR a.status_id = p_status_id) AND
            (p_profile_id IS NULL OR ac.profile_id = p_profile_id) AND
            (p_direction_id IS NULL OR p.direction_id = p_direction_id) AND
            (p_level_id IS NULL OR d.level_id = p_level_id) AND
            (p_search_query IS NULL OR u.raw_user_meta_data->>'full_name' ILIKE '%' || p_search_query || '%')
    ),
    paginated_applications AS (
        SELECT id
        FROM filtered_application_ids
        ORDER BY (SELECT created_at FROM applications WHERE id = filtered_application_ids.id) DESC
        LIMIT p_page_size
        OFFSET (p_page_number - 1) * p_page_size
    )
    SELECT
        a.id,
        a.user_id,
        a.status_id,
        a.created_at,
        a.updated_at,
        (SELECT COUNT(*) FROM filtered_application_ids) AS total_count,
        u.raw_user_meta_data->>'full_name' as applicant_full_name,
        aps.name as status_name,
        (
            SELECT json_agg(
                json_build_object(
                    'priority', ac.priority,
                    'profile_name', p.name,
                    'direction_name', d.name
                ) ORDER BY ac.priority
            )
            FROM application_choices ac
            JOIN profiles p ON ac.profile_id = p.id
            JOIN directions d ON p.direction_id = d.id
            WHERE ac.application_id = a.id
        ) as choices
    FROM applications a
    JOIN application_statuses aps ON a.status_id = aps.id
    JOIN auth.users u ON a.user_id = u.id
    WHERE a.id IN (SELECT id FROM paginated_applications)
    ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 