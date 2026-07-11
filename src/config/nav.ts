import { siteConfig } from "./site";

export const mainNav = [
  { title: "Home", href: "/" },
  { title: "Articles", href: "/articles" },
  { title: "About", href: "/about" },
] as const;

export const topicNav = [
  { title: "AI", href: "/ai", description: "Artificial Intelligence" },
  { title: "Machine Learning", href: "/machine-learning", description: "Models & training" },
  { title: "Data Science", href: "/data-science", description: "Analytics & insights" },
  { title: "Programming", href: "/programming", description: "Software development" },
  { title: "Research", href: "/research", description: "Papers & breakthroughs" },
  { title: "Cloud Computing", href: "/cloud-computing", description: "Cloud & DevOps" },
  { title: "Developer Tools", href: "/developer-tools", description: "Tools & frameworks" },
] as const;

export const resourceNav = [
  { title: "Projects", href: "/projects" },
  { title: "Tools", href: "/tools" },
  { title: "Resources", href: "/resources" },
  { title: "Community", href: "/community" },
] as const;

export const footerNav = {
  platform: [
    { title: "Articles", href: "/articles" },
    { title: "RSS Feed", href: "/feed.xml" },
    { title: "Authors", href: "/authors" },
    { title: "Search", href: "/search" },
    { title: "Newsletter", href: "/newsletter" },
  ],
  topics: [
    { title: "Artificial Intelligence", href: "/ai" },
    { title: "Machine Learning", href: "/machine-learning" },
    { title: "Data Science", href: "/data-science" },
    { title: "Programming", href: "/programming" },
    { title: "Research", href: "/research" },
  ],
  company: [
    { title: "About", href: "/about" },
    { title: "Community", href: "/community" },
    { title: "Contact", href: "/contact" },
  ],
  legal: [
    { title: "Privacy", href: "/privacy" },
    { title: "Terms", href: "/terms" },
  ],
} as const;

export const brand = {
  name: siteConfig.name,
  tagline: "Knowledge for the future of technology",
} as const;
