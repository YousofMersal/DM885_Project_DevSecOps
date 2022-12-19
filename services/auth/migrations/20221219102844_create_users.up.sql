-- Add migration script here
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Make sure extension is installed in DB

CREATE TABLE IF NOT EXISTS users (
  id uuid default uuid_generate_v4() primary key,
  username varchar not null unique,
  email varchar not null unique,
  password_hash varchar not null,
  salt varchar not null,
  role varchar not null
);
