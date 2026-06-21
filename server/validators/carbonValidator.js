import { z } from "zod";

export const carbonSchema = z.object({
  body: z.object({
    transport: z.number().min(0, "Must be a positive number").optional(),
    electricity: z.number().min(0, "Must be a positive number").optional(),
    food: z.number().min(0, "Must be a positive number").optional(),
    waste: z.number().min(0, "Must be a positive number").optional(),
    water: z.number().min(0, "Must be a positive number").optional()
  })
});
