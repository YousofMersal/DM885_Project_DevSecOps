import {
  ApiJob,
  ApiLoginResponse,
  ApiSignupResponse,
  AuthServiceForm,
} from "./types";

const apiServiceUrl = "http://auth.project.127.0.0.1.sslip.io/api/v1/auth"; // TODO: replace by production URL
const solversServiceUrl =
  "http://solvers-service.project.127.0.0.1.sslip.io/api/v1";

export const apiSignup = (
  input: AuthServiceForm
): Promise<ApiSignupResponse> => {
  return request(apiServiceUrl + "/users", {
    body: JSON.stringify({
      ...input,
      username: input.email,
    }),
    method: "POST",
  });
};

export const apiLogin = (input: AuthServiceForm): Promise<ApiLoginResponse> => {
  return request(apiServiceUrl + "/users/login", {
    body: JSON.stringify({
      username: input.email,
      password: input.password,
    }),
    method: "POST",
  });
};

export const apiStartJob = () => {
  return request(solversServiceUrl + "/jobs", {
    method: "POST",
    body: JSON.stringify({
      model_id: "1",
      solver_ids: ["1", "2"],
      data_id: "",
    }),
  });
};

export const apiListJobs = (): Promise<ApiJob[]> => {
  return request(solversServiceUrl + "/jobs");
};

export const apiGetJob = (): Promise<ApiJob> => {
  return request(solversServiceUrl + "/jobs/1");
};

export const apiDeleteJob = () => {
  return request(solversServiceUrl + "/jobs/1", {
    method: "DELETE",
  });
};

const request = async (path: string, requestConfig?: RequestInit) => {
  console.log("request", path);

  const defaultConfig: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
    ...requestConfig,
  };

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
