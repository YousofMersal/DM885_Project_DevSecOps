import { z, ZodError } from "zod";

export const authServicePayload = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const createProblemPayload = z.object({
  name: z.string(),
  model: z.instanceof(File),
  data: z.instanceof(File).optional(),
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
