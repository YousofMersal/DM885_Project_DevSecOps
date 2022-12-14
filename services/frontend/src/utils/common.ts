import { z, ZodError } from "zod";

export const authServicePayload = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const createModelData = z.object({
  name: z.string(),
  content: z.string(),
});

export const createSolverData = z.object({
  name: z.string(),
  image: z.string(),
});

export const editUserInfo = z.object({
  cpu_limit: z.string(),
  mem_limit: z.string(),
});

export const handleError = (e: unknown) => {
  if (e instanceof ZodError) {
    return e.errors?.[0].message;
  } else if (e instanceof Error) {
    return e.message;
  } else {
    return "Unknown error";
  }
};

type ApiServiceError = {
  code: number;
  message: string;
};

export const isApiServiceError = (e: unknown): e is ApiServiceError => {
  if (typeof e === "object" && e && "code" in e && "message" in e) {
    return true;
  }

  return false;
};

export const isSolverServiceError = (e: unknown): e is { message: string } => {
  if (typeof e === "object" && e && "message" in e) {
    return true;
  }
  return false;
};
