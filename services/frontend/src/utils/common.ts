import { z } from "zod";

export const authServicePayload = z.object({
  email: z.string().email(),
  password: z.string(),
});
