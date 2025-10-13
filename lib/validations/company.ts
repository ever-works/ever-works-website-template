import { z } from "zod";

export const companyStatus = ["active", "inactive"] as const;

export const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required").max(255),
  website: z.string().url("Invalid URL format").optional().or(z.literal("")),
  domain: z
    .string()
    .max(255)
    .optional()
    .transform((val) => val?.toLowerCase().trim() || undefined),
  slug: z
    .string()
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional()
    .transform((val) => val?.toLowerCase().trim() || undefined),
  status: z.enum(companyStatus).default("active"),
});

export const updateCompanySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Company name is required").max(255).optional(),
  website: z.string().url("Invalid URL format").optional().or(z.literal("")),
  domain: z
    .string()
    .max(255)
    .optional()
    .transform((val) => val?.toLowerCase().trim() || undefined),
  slug: z
    .string()
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional()
    .transform((val) => val?.toLowerCase().trim() || undefined),
  status: z.enum(companyStatus).optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
