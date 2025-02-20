-- Create the schema
CREATE SCHEMA IF NOT EXISTS login;

-- Set the search path to use the new schema
SET search_path TO login;

CREATE TABLE login.roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE login.users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL, -- Store hashed passwords
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token TEXT NULL,
	reset_token_expires_at TIMESTAMP NULL
);

-- ADD
ALTER TABLE login.users ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disabled'));

CREATE TABLE login.user_roles (
    user_id INTEGER REFERENCES login.users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES login.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE login.reports (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    parent_report_id INTEGER REFERENCES login.reports(id) ON DELETE CASCADE,
    route TEXT NOT NULL UNIQUE
);

CREATE TABLE login.report_permissions (
    role_id INTEGER REFERENCES login.roles(id) ON DELETE CASCADE,
    report_id INTEGER REFERENCES login.reports(id) ON DELETE CASCADE,
    permission_level TEXT CHECK (permission_level IN ('view', 'export', 'edit')),
    PRIMARY KEY (role_id, report_id, permission_level)
);

CREATE TABLE login.admin_pages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    route TEXT NOT NULL unique,
    category TEXT NOT NULL
);

CREATE TABLE login.admin_permissions (
    role_id INTEGER REFERENCES login.roles(id) ON DELETE CASCADE,
    page_id INTEGER REFERENCES login.admin_pages(id) ON DELETE CASCADE,
    permission_level TEXT CHECK (permission_level IN ('view', 'export', 'edit')),
    PRIMARY KEY (role_id, page_id, permission_level)
);

-- Favorite reports 
CREATE TABLE login.user_favorite_reports (
    user_id INTEGER REFERENCES login.users(id) ON DELETE CASCADE,
    report_id INTEGER REFERENCES login.reports(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, report_id)
);

--Access Log
CREATE TABLE login.user_access_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES login.users(id) ON DELETE CASCADE,
    report_id INTEGER REFERENCES login.reports(id) ON DELETE CASCADE,
    accessed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE login.user_recent_reports (
    user_id INTEGER REFERENCES login.users(id) ON DELETE CASCADE,
    report_id INTEGER REFERENCES login.reports(id) ON DELETE CASCADE,
    last_accessed TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, report_id)
);

--Registration requests
CREATE TABLE login.registration_requests (
	id serial4 NOT NULL,
	first_name text NOT NULL,
	last_name text NOT NULL,
	username text NOT NULL,
	email text NOT NULL,
	request_date timestamptz NOT NULL,
	status text DEFAULT 'pending'::text NOT NULL,
	approved_by int4 NULL,
	approval_date timestamptz NULL,
	CONSTRAINT registration_requests_email_key UNIQUE (email),
	CONSTRAINT registration_requests_pkey PRIMARY KEY (id),
	CONSTRAINT registration_requests_username_key UNIQUE (username),
	CONSTRAINT request_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))),
	CONSTRAINT registration_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES login.users(id)
);


-- Indexes for performance


-- Permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA login TO dashweb_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA login TO dashweb_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA login TO dashweb_admin;