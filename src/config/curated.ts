export const researchHighlights = [
  {
    title: "Transformer architectures in 2026",
    description: "How attention mechanisms continue to evolve for multimodal systems.",
    href: "/research",
    tag: "Research",
  },
  {
    title: "Evaluating LLM agents",
    description: "Benchmarks and safety considerations for autonomous AI workflows.",
    href: "/ai",
    tag: "AI",
  },
  {
    title: "Reproducible ML pipelines",
    description: "Best practices for experiment tracking and model deployment.",
    href: "/machine-learning",
    tag: "ML",
  },
] as const;

export const developerTools = [
  {
    name: "Cursor",
    description: "AI-native code editor for pair programming with agents.",
    href: "https://cursor.com",
    category: "IDE",
  },
  {
    name: "Neon",
    description: "Serverless PostgreSQL for modern full-stack apps.",
    href: "https://neon.tech",
    category: "Database",
  },
  {
    name: "Vercel",
    description: "Deploy Next.js with edge caching and previews.",
    href: "https://vercel.com",
    category: "Hosting",
  },
  {
    name: "Prisma",
    description: "Type-safe ORM for PostgreSQL and beyond.",
    href: "https://prisma.io",
    category: "ORM",
  },
] as const;

export const curatedProjects = [
  {
    name: "NeuralHub",
    description: "This platform — open knowledge for AI and engineering.",
    href: "/about",
    status: "Active",
  },
  {
    name: "Author toolkit",
    description: "TipTap editor with math, Mermaid, and Markdown blocks.",
    href: "/write",
    status: "Built-in",
  },
] as const;

export const curatedResources = [
  {
    title: "RSS feed",
    description: "Subscribe to all published articles.",
    href: "/feed.xml",
  },
  {
    title: "Search",
    description: "Full-text search across articles and authors.",
    href: "/search",
  },
  {
    title: "Newsletter",
    description: "Curated articles in your inbox.",
    href: "/newsletter",
  },
] as const;
