CREATE TABLE solvers (
  solver_id SERIAL NOT NULL PRIMARY KEY,
  name VARCHAR(255),
  image VARCHAR(255)
);

CREATE INDEX solver_name_idx ON solvers(name);

CREATE TABLE mzn_models (
  model_id SERIAL NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL
);

CREATE INDEX mzn_model_name_idx ON mzn_models(name);

CREATE TABLE mzn_data (
  data_id SERIAL NOT NULL PRIMARY KEY,
  model_id INT NOT NULL REFERENCES mzn_models(model_id),
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL
);

CREATE INDEX mzn_data_name_idx ON mzn_data(name);

CREATE TABLE jobs (
  job_id VARCHAR(36) PRIMARY KEY,
  model_id INT NOT NULL REFERENCES mzn_models(model_id),
  data_id INT REFERENCES mzn_data(data_id) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP DEFAULT NULL,
  job_status VARCHAR(255) NOT NULL
);

CREATE INDEX job_status_idx ON jobs(job_status);

CREATE TABLE job_solvers (
  job_id VARCHAR(36) REFERENCES jobs(job_id),
  solver_id SERIAL REFERENCES solvers(solver_id),
  PRIMARY KEY (job_id, solver_id)
);

CREATE TABLE job_solutions (
  sol_id SERIAL NOT NULL PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL REFERENCES jobs(job_id),
  found_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sol_status VARCHAR(255) NOT NULL,
  data JSON NOT NULL
);

CREATE INDEX solution_status_idx ON job_solutions(sol_status);

-- Dummy start testing data

INSERT INTO solvers (name, image) VALUES
	('gecode', 'minizinc/minizinc'),
    ('chuffed', 'minizinc/minizinc'),
    ('osicbc', 'minizinc/minizinc'),
    ('or-tools', 'juanmarcos935/minizinc-or-tools');

INSERT INTO mzn_models (name, content) VALUES
	('australia-coloring',
'% Colouring Australia using nc colours
int: nc = 3;

var 1..nc: wa;   var 1..nc: nt;  var 1..nc: sa;   var 1..nc: q;
var 1..nc: nsw;  var 1..nc: v;   var 1..nc: t;

constraint wa != nt;
constraint wa != sa;
constraint nt != sa;
constraint nt != q;
constraint sa != q;
constraint sa != nsw;
constraint sa != v;
constraint q != nsw;
constraint nsw != v;
solve satisfy;

output ["wa=\\(wa)\\t nt=\\(nt)\\t sa=\\(sa)\\n",
        "q=\\(q)\\t nsw=\\(nsw)\\t v=\\(v)\\n",
        "t=", show(t),  "\\n"];'
);