import { z } from "zod";

export const authServicePayload = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const createProblemPayload = z.object({
  name: z.string(),
  model: z.instanceof(File),
  data: z.instanceof(File).optional(),
});
