import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
  {
    name: "Artificial Intelligence",
    slug: "ai",
    description: "Latest advances in AI, LLMs, and intelligent systems.",
    icon: "brain",
    color: "#8B5CF6",
    sortOrder: 1,
  },
  {
    name: "Machine Learning",
    slug: "machine-learning",
    description: "Models, training, and ML engineering practices.",
    icon: "cpu",
    color: "#3B82F6",
    sortOrder: 2,
  },
  {
    name: "Data Science",
    slug: "data-science",
    description: "Analytics, statistics, and data-driven insights.",
    icon: "bar-chart",
    color: "#10B981",
    sortOrder: 3,
  },
  {
    name: "Programming",
    slug: "programming",
    description: "Software development, languages, and best practices.",
    icon: "code",
    color: "#F59E0B",
    sortOrder: 4,
  },
  {
    name: "Research",
    slug: "research",
    description: "Scientific papers, breakthroughs, and academic work.",
    icon: "flask",
    color: "#EC4899",
    sortOrder: 5,
  },
  {
    name: "Cloud Computing",
    slug: "cloud-computing",
    description: "Cloud infrastructure, DevOps, and distributed systems.",
    icon: "cloud",
    color: "#06B6D4",
    sortOrder: 6,
  },
  {
    name: "Developer Tools",
    slug: "developer-tools",
    description: "Tools, frameworks, and productivity for developers.",
    icon: "wrench",
    color: "#6366F1",
    sortOrder: 7,
  },
];

async function main() {
  console.log("Seeding NeuralHub database...");

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log(`Seeded ${categories.length} categories.`);

  const membershipTiers = [
    {
      name: "Free",
      slug: "free",
      description: "Read articles, comment, and follow authors.",
      priceCents: 0,
      features: ["Unlimited reading", "Comments & likes", "Newsletter"],
    },
    {
      name: "Pro",
      slug: "pro",
      description: "Support writers and unlock premium features.",
      priceCents: 900,
      features: ["Ad-free reading", "Early access", "Pro badge"],
    },
    {
      name: "Team",
      slug: "team",
      description: "Collaborative access for small teams.",
      priceCents: 2900,
      features: ["5 seats", "Shared bookmarks", "Team analytics"],
    },
  ];

  for (const tier of membershipTiers) {
    await prisma.membershipTier.upsert({
      where: { slug: tier.slug },
      update: tier,
      create: tier,
    });
  }

  console.log(`Seeded ${membershipTiers.length} membership tiers.`);

  await prisma.siteSettings.upsert({
    where: { key: "site.registration_enabled" },
    update: { value: false },
    create: { key: "site.registration_enabled", value: false },
  });

  console.log("Disabled public registration (personal blog mode).");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
