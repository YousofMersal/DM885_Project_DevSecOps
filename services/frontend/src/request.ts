const apiServiceUrl = "http://auth-service.project.127.0.0.1.sslip.io/api/v1"; // TODO: replace by production URL

export const apiLogin = (formData: FormData) => {
  return request(apiServiceUrl + "/auth", {
    body: formData,
    method: "POST",
  });
};

const request = async (path: string, requestConfig?: RequestInit) => {
  console.log("request", path);

  const response = await fetch(apiServiceUrl + path);

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

  console.error("Error");

  throw new Error("Api faced an issue");
};

// TODO: remove log statements once development over
