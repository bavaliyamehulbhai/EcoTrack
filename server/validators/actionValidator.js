import { z } from "zod";

export const actionSchema = z.object({
  body: z.object({
    actionId: z.string({ required_error: "Action ID is required" })
  })
});
