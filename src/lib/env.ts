import { z } from "zod";

const serverEnvSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    DIRECT_DATABASE_URL: z.string().optional(),
    DATABASE_URL: z.string().optional(),
    AUTH_SECRET: z.string().optional(),
    AUTH_URL: z.string().optional(),
    NEXT_PUBLIC_APP_URL: z.string().optional(),
    CRON_SECRET: z.string().optional(),
    REVALIDATION_SECRET: z.string().optional(),
    AI_ENABLED: z.string().optional(),
    AI_PROVIDER: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    SEARCH_PROVIDER: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
  })
  .refine((env) => env.DIRECT_DATABASE_URL || env.DATABASE_URL, {
    message: "DIRECT_DATABASE_URL or DATABASE_URL is required",
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === "production") {
      if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 32) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "AUTH_SECRET must be at least 32 characters in production",
          path: ["AUTH_SECRET"],
        });
      }
      if (!env.CRON_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CRON_SECRET is required in production",
          path: ["CRON_SECRET"],
        });
      }
      if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in production",
          path: ["SUPABASE_SERVICE_ROLE_KEY"],
        });
      }
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (!cached) {
    cached = serverEnvSchema.parse(process.env);
  }
  return cached;
}

export function getProductionEnvIssues(): string[] {
  if (process.env.NODE_ENV !== "production") return [];

  const issues: string[] = [];

  if (!process.env.DIRECT_DATABASE_URL && !process.env.DATABASE_URL) {
    issues.push("Missing DIRECT_DATABASE_URL or DATABASE_URL");
  }

  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    issues.push("AUTH_SECRET must be at least 32 characters");
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    issues.push("Missing NEXT_PUBLIC_APP_URL");
  }

  if (!process.env.CRON_SECRET) {
    issues.push("Missing CRON_SECRET for scheduled jobs");
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    issues.push("Supabase storage credentials required in production");
  }

  if (process.env.AI_ENABLED === "true" && process.env.AI_PROVIDER === "openai") {
    if (!process.env.OPENAI_API_KEY) {
      issues.push("OPENAI_API_KEY required when AI_PROVIDER=openai");
    }
  }

  return issues;
}
