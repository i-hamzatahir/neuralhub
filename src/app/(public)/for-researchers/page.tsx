import Link from "next/link";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { siteConfig } from "@/config/site";

export const metadata = buildStaticPageMetadata(
  "For Researchers & Students",
  `AI, machine learning, and data science learning resources on ${siteConfig.name}.`,
  "/for-researchers",
);

export default function ForResearchersPage() {
  return (
    <StaticPage
      title="For Researchers & Students"
      description="Learn AI and data science with structured explanations and curated resources."
      path="/for-researchers"
    >
      <p>
        Whether you are studying machine learning, exploring research papers, or
        building foundational intuition in data science, {siteConfig.name} is
        designed to support structured learning—not just news browsing.
      </p>

      <h2>What you&apos;ll find</h2>
      <ul>
        <li>Concept explainers that connect theory to practice</li>
        <li>Summaries of important methods, papers, and research trends</li>
        <li>Study-friendly tutorials with examples and intuition</li>
        <li>Curated resources, reading lists, and learning paths</li>
      </ul>

      <h2>Recommended sections</h2>
      <ul>
        <li>
          <Link href="/ai">Artificial Intelligence</Link> — LLMs, agents, and
          intelligent systems
        </li>
        <li>
          <Link href="/machine-learning">Machine Learning</Link> — models,
          training, and evaluation
        </li>
        <li>
          <Link href="/data-science">Data Science</Link> — analysis,
          statistics, and insight
        </li>
        <li>
          <Link href="/research">Research</Link> — papers, methods, and field
          developments
        </li>
        <li>
          <Link href="/resources">Resources</Link> — guides, references, and
          external links
        </li>
      </ul>

      <h2>How to use this site as a learner</h2>
      <ol>
        <li>Start with foundational explainers in your topic area</li>
        <li>Use search to connect related concepts across articles</li>
        <li>Follow citations and recommended resources for deeper study</li>
        <li>Revisit articles as your understanding grows</li>
      </ol>

      <h2>Academic integrity</h2>
      <p>
        Our content is meant to help you learn, not to substitute for your own
        coursework or research. Always cite primary sources and follow your
        institution&apos;s academic policies.
      </p>

      <h2>Keep learning with us</h2>
      <p>
        Subscribe to the <Link href="/newsletter">newsletter</Link>, explore{" "}
        <Link href="/start-here">Start Here</Link>, or browse all{" "}
        <Link href="/articles">articles</Link>.
      </p>
    </StaticPage>
  );
}
