import { siteConfig } from "./site";

export const audiencePages = [
  {
    title: "Start Here",
    href: "/start-here",
    description: "New to NeuralHub? Begin with our reading guide.",
  },
  {
    title: "For Developers",
    href: "/for-developers",
    description: "Practical engineering articles and tutorials.",
  },
  {
    title: "For Researchers",
    href: "/for-researchers",
    description: "AI, ML, and data science depth for learners.",
  },
] as const;

export const legalPages = [
  { title: "Privacy Policy", href: "/privacy" },
  { title: "Terms of Service", href: "/terms" },
  { title: "Cookie Policy", href: "/cookies" },
  { title: "Disclaimer", href: "/disclaimer" },
  { title: "Accessibility", href: "/accessibility" },
] as const;

export const companyPages = [
  { title: "About", href: "/about" },
  { title: "Editorial Standards", href: "/editorial" },
  { title: "Contact", href: "/contact" },
  ...audiencePages,
] as const;

export function legalIntro() {
  return `Last updated: ${siteConfig.legal.lastUpdated}`;
}
