import { z } from "zod";

export const createGoalSchema = z.object({
  body: z.object({
    title: z.string({ required_error: "Title is required" }).min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    targetValue: z.number({ required_error: "Target value is required" }).positive("Target value must be positive"),
    targetDate: z.string({ required_error: "Target date is required" })
      .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date format" }),
    unit: z.string({ required_error: "Unit is required" }),
    category: z.string({ required_error: "Category is required" })
  })
});
