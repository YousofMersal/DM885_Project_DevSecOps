export type AuthServiceForm = {
  email: string;
  password: string;
};

// api auth

export type ApiSignupResponse = {
  email: string;
  id: string;
  role: "user" | "admin";
  salt: string;
  username: string;
};

export type ApiLoginResponse = {
  token: string;
};

// api solver

export type ApiJob = {
  job_id: string;
  model_id: null | number;
  data_id: null | number;
  created_at: string;
  finished_at: string;
  job_status: string;
};

export type ApiModel = {
  content: string;
  model_id: number;
  name: string;
};

export type ApiSolver = {
  image: string;
  name: string;
  solver_id: number;
};
