SET search_path TO login;

-- Insert privileges
INSERT INTO privileges (name, description) VALUES
('admin', 'Full administrative privileges'),
('editor', 'Can edit and manage content'),
('viewer', 'Can only view content');

-- Insert groups
INSERT INTO groups (name, privilege_id, description) VALUES
('Admins', (SELECT id FROM privileges WHERE name = 'admin'), 'Administrators with full access'),
('Editors', (SELECT id FROM privileges WHERE name = 'editor'), 'Content editors'),
('Viewers', (SELECT id FROM privileges WHERE name = 'viewer'), 'Read-only users');

-- Insert users
--plain pwd: mySecurePassword123
INSERT INTO users (username, email, password_hash, first_name, last_name, group_id) VALUES
('admin_user', 'admin@example.com', '$2b$10$Mskx87cgk/u2Qj5rzKRzYuDigjiI5bxKhgURX2eHJxyerB5ryt4Pm', 'John', 'Doe', (SELECT id FROM groups WHERE name = 'Admins')),
('editor_user', 'editor@example.com', '$2b$10$Mskx87cgk/u2Qj5rzKRzYuDigjiI5bxKhgURX2eHJxyerB5ryt4Pm', 'Jane', 'Smith', (SELECT id FROM groups WHERE name = 'Editors')),
('viewer_user', 'viewer@example.com', '$2b$10$Mskx87cgk/u2Qj5rzKRzYuDigjiI5bxKhgURX2eHJxyerB5ryt4Pm', 'Alice', 'Johnson', (SELECT id FROM groups WHERE name = 'Viewers'));

-- Add a user to multiple groups (optional)
INSERT INTO user_groups (user_id, group_id) VALUES
((SELECT id FROM users WHERE username = 'admin_user'), (SELECT id FROM groups WHERE name = 'Editors')); -- Admin also belongs to Editors group