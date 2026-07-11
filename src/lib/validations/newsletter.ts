import { z } from "zod";

export const subscribeNewsletterSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  name: z.string().max(100).optional().or(z.literal("")),
  source: z.enum(["footer", "newsletter-page", "dashboard"]).optional(),
});

export type SubscribeNewsletterInput = z.infer<typeof subscribeNewsletterSchema>;
