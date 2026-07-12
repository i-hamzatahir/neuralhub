import { siteConfig } from "./site";
import { audiencePages, legalPages } from "./static-pages";

export const mainNav = [
  { title: "Articles", href: "/articles" },
  { title: "Authors", href: "/authors" },
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

export const exploreNav = [
  { title: "Projects", href: "/projects", description: "Open-source and experiments" },
  { title: "Tools", href: "/tools", description: "Curated developer utilities" },
  { title: "Resources", href: "/resources", description: "Guides, papers, and links" },
  { title: "Community", href: "/community", description: "Writers and discussions" },
] as const;

/** @deprecated Use exploreNav */
export const resourceNav = exploreNav;

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
    { title: "Start Here", href: "/start-here" },
    { title: "Editorial Standards", href: "/editorial" },
    { title: "Contact", href: "/contact" },
  ],
  audiences: audiencePages.map(({ title, href }) => ({ title, href })),
  legal: legalPages,
} as const;

export const brand = {
  name: siteConfig.name,
  tagline: "Professional articles on AI, data science, and software engineering",
} as const;
