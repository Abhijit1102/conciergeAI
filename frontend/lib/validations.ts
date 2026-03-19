import { z } from "zod";

export const loginSchema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
});

export const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/i),
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});

export const querySchema = z.object({
  query: z.string()
    .min(10,  "Please describe your event in more detail (min 10 characters)")
    .max(500, "Keep it under 500 characters"),
});

export type LoginInput    = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type QueryInput    = z.infer<typeof querySchema>;
