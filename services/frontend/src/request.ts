import {
  ApiJob,
  ApiJobResult,
  ApiLoginResponse,
  ApiModel,
  ApiModelData,
  ApiSignupResponse,
  ApiSolver,
  ApiUser,
  ApiUserInfo,
  AuthServiceForm,
} from "./types";
import { isApiServiceError, isSolverServiceError } from "./utils/common";

const apiServiceUrl =
  import.meta.env.DEV && import.meta.env.VITE_PROJECT_DOMAIN
    ? `http://${import.meta.env.VITE_PROJECT_DOMAIN}/api/v1`
    : "/api/v1";

export const apiSignup = (
  input: AuthServiceForm
): Promise<ApiSignupResponse> => {
  return request("/auth/users", {
    body: JSON.stringify({
      ...input,
      username: input.email,
    }),
    method: "POST",
  });
};

export const apiLogin = (input: AuthServiceForm): Promise<ApiLoginResponse> => {
  return request("/auth/users/login", {
    body: JSON.stringify({
      username: input.email,
      password: input.password,
    }),
    method: "POST",
  });
};

export const apiStartJob = (
  modelId: number,
  solverIds: number[],
  dataId?: number
): Promise<{ job_id: string; status: string }> => {
  const payload = {
    model_id: modelId,
    solvers: solverIds.map(id => ({solver_id: id})),
  };

  if (dataId) {
    //@ts-expect-error
    payload.dataId = dataId;
  }
  return request("/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const apiGetUsers = (): Promise<ApiUser[]> => request("/auth/users");

export const apiGetUser = (id: string): Promise<ApiUser[]> =>
  request(`/auth/users/${id}`);

export const apiListModels = (): Promise<ApiModel[]> => {
  return request("/models");
};

export const apiListSolvers = (): Promise<ApiSolver[]> => {
  return request("/solvers");
};

export const apiDeleteSolver = (id: number) =>
  request(`/solvers/${id}`, {
    method: "DELETE",
  });

export const apiGetSolver = (id: string): Promise<ApiSolver> =>
  request(`/solvers/${id}`);

export const apiEditSolver = (name: string, image: string) =>
  request(`/solvers/${name}`, {
    method: "PUT",
    body: JSON.stringify({
      name,
      image,
    }),
  });

export const apiCreateSolver = (name: string, image: string) =>
  request(`/solvers`, {
    method: "POST",
    body: JSON.stringify({ name, image }),
  });

export const apiSaveModel = (body: { content: string; name: string }) => {
  return request("/models", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const apiEditModel = (body: {
  content: string;
  name: string;
  id: string;
}) => {
  return request(`/models/${body.id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

export const apiListJobs = (): Promise<ApiJob[]> => {
  return request("/jobs");
};

export const apiGetJob = (jobId: string): Promise<ApiJob> => {
  return request(`/jobs/${jobId}`);
};

export const apiGetJobResult = (jobId: string): Promise<ApiJobResult[]> => {
  return request(`/jobs/${jobId}/result`);
};

export const apiGetModel = (id: string): Promise<ApiModel> => {
  return request(`/models/${id}`);
};

export const apiDeleteJob = () => {
  return request("/jobs/1", {
    method: "DELETE",
  });
};

export const apiSaveDataOnModel = (
  modelId: number,
  name: string,
  content: string
) => {
  return request(`/models/${modelId}/data`, {
    method: "POST",
    body: JSON.stringify({
      name,
      content,
    }),
  });
};

export const apiUpdateUserInfo = (
  userId: string,
  cpuLimit: string,
  memLimit: string
) => {
  return request(`/job-users/${userId}`, {
    method: "PUT",
    body: JSON.stringify({
      cpu_limit: cpuLimit,
      mem_limit: memLimit,
    }),
  });
};

export const apiUpdateDataOnModel = (
  dataId: string,
  modelId: string,
  name: string,
  content: string
) => {
  return request(`/models/${modelId}/data/${dataId}`, {
    method: "PUT",
    body: JSON.stringify({
      name,
      content,
    }),
  });
};

export const apiGetModelData = (
  modelId: string,
  dataId: string
): Promise<ApiModelData> => {
  return request(`/models/${modelId}/data/${dataId}`);
};

export const apiListDataForModel = (
  modelId: string
): Promise<ApiModelData[]> => {
  return request(`/models/${modelId}/data`);
};

export const apiRemoveModelData = (modelId: number, dataId: number) => {
  return request(`/models/${modelId}/data/${dataId}`, {
    method: "DELETE",
  });
};

export const apiRemoveModel = (modelId: string) =>
  request(`/models/${modelId}`, {
    method: "DELETE",
  });

export const apiRemoveUser = (userName: string) =>
  request(`/auth/users/${userName}`, {
    method: "DELETE",
  });

export const apiCancelJob = (
  jobId: string,
  solverId?: number
): Promise<ApiJob> => {
  let url = `/jobs/${jobId}/cancel`;

  if (solverId) {
    url += `?solver_id=${solverId}`;
  }
  return request(url, {
    method: "POST",
  });
};

export const apiGetJobUsers = (): Promise<ApiUserInfo[]> =>
  request("/job-users");

const request = async (path: string, requestConfig?: RequestInit) => {
  const token = localStorage.getItem("token");

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const defaultConfig: RequestInit = {
    headers,
    ...requestConfig,
  };

  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiServiceUrl}${path}`, defaultConfig);

  if (response.ok) {
    // look for json response
    if (response.headers.get("Content-Type")?.includes("json")) {
      const data = await response.json();

      return data;
    }

    const txt = await response.text();

    return txt;
  }

  try {
    const errorJsonResponse = await response.json();

    if (isApiServiceError(errorJsonResponse)) {
      throw new Error(errorJsonResponse.message);
    }
    if (isSolverServiceError(errorJsonResponse)) {
      throw new Error(errorJsonResponse.message);
    }
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error("Unknown error. Backend returned invalid json");
    }
    throw e;
  }

  throw new Error("Oops something wrong happened");
};
