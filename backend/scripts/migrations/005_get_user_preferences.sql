CREATE OR REPLACE FUNCTION login.get_user_preferences(user_name TEXT)
RETURNS JSON AS $$
DECLARE 
    preferences JSON;
BEGIN
    WITH user_cte AS (
        SELECT id FROM login.users WHERE username = user_name
    ),

    favorites AS (
        SELECT json_agg(
            json_build_object(
                'name', r.name,
                'route', r.route
            )
        ) AS favorite_reports
        FROM login.user_favorite_reports uf
        JOIN login.reports r ON uf.report_id = r.id
        WHERE uf.user_id = (SELECT id FROM user_cte)
    ),

    recent AS (
        SELECT json_agg(
            json_build_object(
                'name', r.name,
                'route', r.route,
                'last_accessed', ur.last_accessed
            )
        ) AS recent_reports
        FROM login.user_recent_reports ur
        JOIN login.reports r ON ur.report_id = r.id
        WHERE ur.user_id = (SELECT id FROM user_cte)
    )

    SELECT json_build_object(
        'favorites', (SELECT favorite_reports FROM favorites),
        'recent', (SELECT recent_reports FROM recent)
    ) INTO preferences;

    RETURN preferences;
END;
$$ LANGUAGE plpgsql;

