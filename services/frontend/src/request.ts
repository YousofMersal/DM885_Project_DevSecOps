import {
  ApiJob,
  ApiJobResult,
  ApiLoginResponse,
  ApiModel,
  ApiModelData,
  ApiSignupResponse,
  ApiSolver,
  AuthServiceForm,
} from "./types";

const apiServiceUrl =
  import.meta.env.DEV && import.meta.env.VITE_PROJECT_DOMAIN
    ? `http://${import.meta.env.VITE_PROJECT_DOMAIN}/api/v1`
    : "/api/v1";

export const apiSignup = (
  input: AuthServiceForm
): Promise<ApiSignupResponse> => {
  return request(apiServiceUrl + "/auth/users", {
    body: JSON.stringify({
      ...input,
      username: input.email,
    }),
    method: "POST",
  });
};

export const apiLogin = (input: AuthServiceForm): Promise<ApiLoginResponse> => {
  return request(apiServiceUrl + "/auth/users/login", {
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
    solver_ids: solverIds,
  };

  if (dataId) {
    //@ts-expect-error
    payload.dataId = dataId;
  }
  return request(apiServiceUrl + "/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const apiGetUsers = () => request(apiServiceUrl + "/auth/users");

export const apiListModels = (): Promise<ApiModel[]> => {
  return request(apiServiceUrl + "/models");
};

export const apiListSolvers = (): Promise<ApiSolver[]> => {
  return request(apiServiceUrl + "/solvers");
};

export const apiSaveModel = (body: { content: string; name: string }) => {
  return request(apiServiceUrl + "/models", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const apiListJobs = (): Promise<ApiJob[]> => {
  return request(apiServiceUrl + "/jobs");
};

export const apiGetJob = (jobId: string): Promise<ApiJob> => {
  return request(`${apiServiceUrl}/jobs/${jobId}`);
};

export const apiGetJobResult = (jobId: string): Promise<ApiJobResult[]> => {
  return request(`${apiServiceUrl}/jobs/${jobId}/result`);
};

export const apiGetModel = (id: string): Promise<ApiModel> => {
  return request(`${apiServiceUrl}/models/${id}`);
};

export const apiDeleteJob = () => {
  return request(apiServiceUrl + "/jobs/1", {
    method: "DELETE",
  });
};

export const apiSaveDataOnModel = (
  modelId: number,
  name: string,
  content: string
) => {
  return request(`${apiServiceUrl}/models/${modelId}/data`, {
    method: "POST",
    body: JSON.stringify({
      name,
      content,
    }),
  });
};

export const apiUpdateDataOnModel = (
  dataId: string,
  modelId: string,
  name: string,
  content: string
) => {
  return request(`${apiServiceUrl}/models/${modelId}/data/${dataId}`, {
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
  return request(`${apiServiceUrl}/models/${modelId}/data/${dataId}`);
};

export const apiListDataForModel = (
  modelId: string
): Promise<ApiModelData[]> => {
  return request(`${apiServiceUrl}/models/${modelId}/data`);
};

export const apiRemoveModelData = (modelId: number, dataId: number) => {
  return request(`${apiServiceUrl}/models/${modelId}/data/${dataId}`, {
    method: "DELETE",
  });
};

export const apiRemoveModel = (modelId: string) =>
  request(`${apiServiceUrl}/models/${modelId}`, {
    method: "DELETE",
  });

const request = async (path: string, requestConfig?: RequestInit) => {
  console.log("request", path);

  const token = localStorage.getItem("token");

  const defaultConfig: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
    ...requestConfig,
  };

  if (token) {
    //@ts-expect-error
    defaultConfig.headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(path, defaultConfig);

  console.log("response", response);

  if (response.ok) {
    // look for json response
    if (response.headers.get("Content-Type")?.includes("json")) {
      const data = await response.json();
      console.log("json data", data);
      return data;
    }

    const txt = await response.text();

    console.log("txt data", txt);

    return txt;
  }

  // for now if we get a 401, we'll throw an error saying wrong username/password until we get better responses
  if (response.status === 401) {
    throw new Error("Wrong username/password combination");
  }

  throw new Error("Oops something wrong happened");
};

// TODO: remove log statements once development over
