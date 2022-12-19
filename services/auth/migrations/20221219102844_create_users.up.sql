-- Add migration script here
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Make sure extension is installed in DB

create table users (
  id uuid default uuid_generate_v4() primary key,
  username varchar not null unique,
  email varchar not null unique,
  password_hash varchar not null,
  salt varchar not null,
  role varchar not null
);

INSERT INTO users (username, email, password_hash, salt, role)
VALUES ('admin', 'admin@admin.com', '$argon2id$v=19$m=4096,t=3,p=1$CZT9E3MpG/ldAnCAZbGfcA$HaSjHsbndq5VOzY6eZjfGCx33MXcxEfWnlu204umbKQ', 'CZT9E3MpG/ldAnCAZbGfcA', 'admin');
