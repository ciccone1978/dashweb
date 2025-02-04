CREATE DATABASE dashweb_db;
CREATE USER dashweb_admin WITH PASSWORD 'mySecret01';
GRANT ALL PRIVILEGES ON DATABASE dashweb_db TO dashweb_admin;
ALTER DATABASE dashweb_db OWNER TO dashweb_admin;
