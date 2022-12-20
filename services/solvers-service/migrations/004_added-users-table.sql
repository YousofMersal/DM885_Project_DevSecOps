CREATE TABLE users (
  user_id SERIAL NOT NULL PRIMARY KEY,
  name VARCHAR(255),
  cpulimit VARCHAR(255),
  
);

CREATE INDEX solver_name_idx ON solvers(name);