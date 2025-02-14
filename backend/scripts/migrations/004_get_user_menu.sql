-- DROP FUNCTION login.get_user_menu(text);

CREATE OR REPLACE FUNCTION login.get_user_menu(user_name text)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE 
    menu JSON;
BEGIN
    WITH user_roles_cte AS (
        -- Get roles assigned to the given user
        SELECT ur.role_id
        FROM login.user_roles ur
        JOIN login.users u ON ur.user_id = u.id
        WHERE u.username = user_name
    ),
    
    -- Fetch Report Permissions
    reports_cte AS (
        SELECT 
            'report' AS category,
            r.category AS parent,  -- Group reports by category
            r.name AS name,
            r.route AS route,
            rp.permission_level
        FROM login.report_permissions rp
        JOIN login.reports r ON rp.report_id = r.id
        WHERE rp.role_id IN (SELECT role_id FROM user_roles_cte)
    ),
    
    -- Fetch Admin Page Permissions
    admin_cte AS (
        SELECT 
            'admin' AS category,
            apg.category AS parent,  -- Group admin pages by category
            apg.name AS name,
            apg.route AS route,
            ap.permission_level
        FROM login.admin_permissions ap
        JOIN login.admin_pages apg ON ap.page_id = apg.id
        WHERE ap.role_id IN (SELECT role_id FROM user_roles_cte)
    ),
    
    -- Combine Reports and Admin Pages
    menu_cte AS (
        SELECT * FROM reports_cte
        UNION ALL
        SELECT * FROM admin_cte
    ),
    
    -- Generate JSON structure per category
    category_json AS (
        SELECT 
            parent AS category,
            json_agg(
                json_build_object(
                    'name', name,
                    'route', route,
                    'permission_level', permission_level
                )
            ) AS items
        FROM menu_cte
        GROUP BY parent
    )
    
    -- Convert entire menu structure to JSON
    SELECT json_agg(json_build_object('category', category, 'items', items)) 
    INTO menu
    FROM category_json;

    RETURN menu;
END;
$function$
;

-- GET USER MENU by ID w/ AdminLTE ready icons
CREATE OR REPLACE FUNCTION login.get_user_menu(uid integer)
RETURNS jsonb
LANGUAGE plpgsql
AS $function$
DECLARE 
    menu JSONB;
BEGIN
    WITH user_roles AS (
        SELECT DISTINCT role_id 
        FROM login.user_roles 
        WHERE user_roles.user_id = uid
    ),
    report_menu AS (
        SELECT COALESCE(jsonb_agg(
            DISTINCT json_build_object(
                'text', r.name,
                'icon', 'fas fa-file-alt',
                'url', r.route
            )::jsonb
        ), '[]'::jsonb) AS reports
        FROM login.report_permissions rp
        JOIN login.reports r ON rp.report_id = r.id
        WHERE rp.role_id IN (SELECT role_id FROM user_roles)
    ),
    admin_menu AS (
        SELECT COALESCE(jsonb_agg(
            DISTINCT json_build_object(
                'text', a.name,
                'icon', 'fas fa-cog',
                'url', a.route
            )::jsonb
        ), '[]'::jsonb) AS admin_pages
        FROM login.admin_permissions ap
        JOIN login.admin_pages a ON ap.page_id = a.id
        WHERE ap.role_id IN (SELECT role_id FROM user_roles)
    )
    SELECT jsonb_build_object(
        'menu', jsonb_build_array(
            jsonb_build_object(
                'text', 'Reports',
                'icon', 'fas fa-chart-bar',
                'children', (SELECT reports FROM report_menu)
            ),
            jsonb_build_object(
                'text', 'Admin',
                'icon', 'fas fa-tools',
                'children', (SELECT admin_pages FROM admin_menu)
            )
        )
    ) INTO menu;

    RETURN menu;
END;
$function$;


