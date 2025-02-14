CREATE OR REPLACE FUNCTION login.get_user_permissions(user_name TEXT)
RETURNS TABLE (
    permission_type TEXT,
    resource_name TEXT,
    resource_route TEXT,
    permission_level TEXT
) AS $$
BEGIN
    RETURN QUERY 
    WITH user_roles_cte AS (
        -- Get roles assigned to the given user
        SELECT ur.role_id
        FROM login.user_roles ur
        JOIN login.users u ON ur.user_id = u.id
        WHERE u.username = user_name
    )
    
    -- Fetch Report Permissions
    SELECT 
        'report' AS permission_type,
        r.name AS resource_name,
        r.route AS resource_route,
        rp.permission_level
    FROM login.report_permissions rp
    JOIN login.reports r ON rp.report_id = r.id
    WHERE rp.role_id IN (SELECT role_id FROM user_roles_cte)

    UNION ALL

    -- Fetch Admin Page Permissions
    SELECT 
        'admin_page' AS permission_type,
        apg.name AS resource_name,
        apg.route AS resource_route,
        ap.permission_level
    FROM login.admin_permissions ap
    JOIN login.admin_pages apg ON ap.page_id = apg.id
    WHERE ap.role_id IN (SELECT role_id FROM user_roles_cte)
    
    ORDER BY permission_type, resource_name;
END;
$$ LANGUAGE plpgsql;
