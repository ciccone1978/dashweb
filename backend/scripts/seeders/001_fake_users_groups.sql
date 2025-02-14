SET search_path TO login;

--
-- SAMPLE
--

--
--1. Roles Table (System Roles)
--
INSERT INTO login.roles (name) VALUES 
('admin'), 
('hr_manager'), 
('finance_manager'), 
('sales_analyst'), 
('inventory_manager'), 
('user');

--
-- 2. Users Table (System Users)
--
select * from login.users 
INSERT INTO login.users (username, password_hash, email) VALUES 
('admin_user', 'hashed_password_1', 'admin@example.com'),
('hr_manager1', 'hashed_password_2', 'hr_manager@example.com'),
('finance_manager1', 'hashed_password_3', 'finance@example.com'),
('sales_analyst1', 'hashed_password_4', 'sales@example.com'),
('inventory_manager1', 'hashed_password_5', 'inventory@example.com'),
('general_user1', 'hashed_password_6', 'user@example.com');

--
--3. User Roles Table (Assigning Roles to Users)
--

-- Assign 'admin' role to admin_user
INSERT INTO login.user_roles (user_id, role_id) 
SELECT u.id, r.id FROM login.users u, login.roles r 
WHERE u.username = 'admin_user' AND r.name = 'admin';

-- Assign 'hr_manager' role to hr_manager1
INSERT INTO login.user_roles (user_id, role_id) 
SELECT u.id, r.id FROM login.users u, login.roles r 
WHERE u.username = 'hr_manager1' AND r.name = 'hr_manager';

-- Assign 'finance_manager' role to finance_manager1
INSERT INTO login.user_roles (user_id, role_id) 
SELECT u.id, r.id FROM login.users u, login.roles r 
WHERE u.username = 'finance_manager1' AND r.name = 'finance_manager';

-- Assign 'sales_analyst' role to sales_analyst1
INSERT INTO login.user_roles (user_id, role_id) 
SELECT u.id, r.id FROM login.users u, login.roles r 
WHERE u.username = 'sales_analyst1' AND r.name = 'sales_analyst';

-- Assign 'inventory_manager' role to inventory_manager1
INSERT INTO login.user_roles (user_id, role_id) 
SELECT u.id, r.id FROM login.users u, login.roles r 
WHERE u.username = 'inventory_manager1' AND r.name = 'inventory_manager';

-- Assign 'user' role to general_user1
INSERT INTO login.user_roles (user_id, role_id) 
SELECT u.id, r.id FROM login.users u, login.roles r 
WHERE u.username = 'general_user1' AND r.name = 'user';

--
--4. Reports Table (Defining Reports & Drill-Downs)
--
INSERT INTO login.reports (name, route, category, parent_report_id) VALUES 
-- Sales Reports
('Sales Overview', '/reports/sales/overview', 'Sales', NULL),
('Monthly Sales Trends', '/reports/sales/monthly', 'Sales', 1),

-- Inventory Reports
('Inventory Stock Status', '/reports/inventory/status', 'Inventory', NULL),
('Stock Movement Report', '/reports/inventory/movement', 'Inventory', 3),

-- Finance Reports
('Quarterly Financial Report', '/reports/finance/quarterly', 'Finance', NULL),
('Annual Financial Statement', '/reports/finance/annual', 'Finance', 5),

-- HR Reports
('Employee Payroll Summary', '/reports/hr/payroll', 'HR', NULL),
('Leave Balance Report', '/reports/hr/leave-balance', 'HR', 7);


--
--5. Report Permissions Table (Who Can View/Export/Edit Reports?)
--

-- Admin has full access (view, export, edit) to all reports
INSERT INTO login.report_permissions (role_id, report_id, permission_level)
SELECT r.id, rep.id, unnest(ARRAY['view', 'export', 'edit'])
FROM login.roles r, login.reports rep
WHERE r.name = 'admin';

-- HR Manager can view and export HR reports
INSERT INTO login.report_permissions (role_id, report_id, permission_level)
SELECT r.id, rep.id, unnest(ARRAY['view', 'export'])
FROM login.roles r, login.reports rep
WHERE r.name = 'hr_manager' AND rep.category = 'HR';

-- Finance Manager can view and export finance reports
INSERT INTO login.report_permissions (role_id, report_id, permission_level)
SELECT r.id, rep.id, unnest(ARRAY['view', 'export'])
FROM login.roles r, login.reports rep
WHERE r.name = 'finance_manager' AND rep.category = 'Finance';

-- Sales Analyst can only view sales reports
INSERT INTO login.report_permissions (role_id, report_id, permission_level)
SELECT r.id, rep.id, 'view'
FROM login.roles r, login.reports rep
WHERE r.name = 'sales_analyst' AND rep.category = 'Sales';



--
--6. Admin Pages Table (Admin Sections)
--
INSERT INTO login.admin_pages (name, route, category) VALUES 
('Manage Users', '/admin/users', 'User Management'),
('Manage Roles', '/admin/roles', 'User Management'),
('Manage Reports', '/admin/reports', 'Reports'),
('Manage Finance Settings', '/admin/finance', 'Finance'),
('Manage HR Settings', '/admin/hr', 'HR');


--
--7. Admin Permissions Table (Who Can Manage Admin Sections?)
--
-- Admin has full access to all admin pages
INSERT INTO login.admin_permissions (role_id, page_id, permission_level)
SELECT r.id, ap.id, unnest(ARRAY['view', 'export', 'edit'])
FROM login.roles r, login.admin_pages ap
WHERE r.name = 'admin';

-- HR Manager can view and edit HR settings
INSERT INTO login.admin_permissions (role_id, page_id, permission_level)
SELECT r.id, ap.id, unnest(ARRAY['view', 'edit'])
FROM login.roles r, login.admin_pages ap
WHERE r.name = 'hr_manager' AND ap.category = 'HR';

-- Finance Manager can view and edit finance settings
INSERT INTO login.admin_permissions (role_id, page_id, permission_level)
SELECT r.id, ap.id, unnest(ARRAY['view', 'edit'])
FROM login.roles r, login.admin_pages ap
WHERE r.name = 'finance_manager' AND ap.category = 'Finance';