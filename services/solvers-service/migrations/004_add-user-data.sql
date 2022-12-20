-- Add user table
-- Modify `jobs` to contain user_id

DELETE FROM jobs; -- delete all old jobs without a user associated with it

CREATE TABLE user_data (
  user_id VARCHAR(36) NOT NULL PRIMARY KEY,
  cpu_limit INT NOT NULL DEFAULT 4,
  mem_limit INT NOT NULL DEFAULT 100 -- 100 MB
);

ALTER TABLE jobs ADD COLUMN user_id VARCHAR(36) NOT NULL REFERENCES user_data(user_id) ON DELETE CASCADE;
