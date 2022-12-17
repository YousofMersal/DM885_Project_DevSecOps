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

export type ApiJobResult = {
  data: Record<string, number>;
  found_at: string;
  job_id: string;
  sol_id: number;
  sol_status: string;
  solver_id: number;
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

export type ApiModelData = {
  data_id: number;
  model_id: number;
  name: string;
  content: string;
};
