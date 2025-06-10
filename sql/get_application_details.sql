CREATE OR REPLACE FUNCTION get_application_details(p_application_id UUID)
RETURNS TABLE(
    -- top-level application info
    id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    status_id INT,
    status_name TEXT,
    -- applicant info
    user_id UUID,
    applicant_full_name TEXT,
    applicant_email TEXT,
    -- choices and exams
    choices JSON,
    required_exams JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.created_at,
        a.updated_at,
        a.status_id,
        aps.name as status_name,
        a.user_id,
        u.raw_user_meta_data->>'full_name' as applicant_full_name,
        u.email as applicant_email,
        -- Aggregate chosen profiles into a JSON array
        (
            SELECT json_agg(
                json_build_object(
                    'priority', ac.priority,
                    'profile_id', p.id,
                    'profile_name', p.name,
                    'profile_description', p.description,
                    'duration_years', p.duration_years,
                    'credits', p.credits,
                    'tuition_fee', p.tuition_fee,
                    'career_info', p.career_info,
                    'internship_info', p.internship_info,
                    'direction_id', d.id,
                    'direction_code', d.code,
                    'direction_name', d.name,
                    'level_id', el.id,
                    'level_name', el.name
                ) ORDER BY ac.priority
            )
            FROM application_choices ac
            JOIN profiles p ON ac.profile_id = p.id
            JOIN directions d ON p.direction_id = d.id
            JOIN education_levels el ON d.level_id = el.id
            WHERE ac.application_id = a.id
        ) as choices,
        -- Aggregate required exams for the first-priority choice
        (
            SELECT json_agg(
                json_build_object(
                    'subject_name', s.name,
                    'priority', pe.priority
                ) ORDER BY pe.priority
            )
            FROM application_choices ac
            JOIN profile_exams pe ON ac.profile_id = pe.profile_id
            JOIN subjects s ON pe.subject_id = s.id
            WHERE ac.application_id = a.id AND ac.priority = 1
        ) as required_exams
    FROM
        applications a
    JOIN
        application_statuses aps ON a.status_id = aps.id
    JOIN
        auth.users u ON a.user_id = u.id
    WHERE
        a.id = p_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;