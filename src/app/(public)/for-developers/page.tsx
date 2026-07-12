import Link from "next/link";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { siteConfig } from "@/config/site";

export const metadata = buildStaticPageMetadata(
  "For Developers",
  `Practical engineering articles, tutorials, and tools for developers on ${siteConfig.name}.`,
  "/for-developers",
);

export default function ForDevelopersPage() {
  return (
    <StaticPage
      title="For Developers"
      description="Build better software with practical AI, data, and engineering content."
      path="/for-developers"
    >
      <p>
        {siteConfig.name} publishes articles for software engineers, data
        engineers, and builders who want practical depth—not just surface-level
        summaries.
      </p>

      <h2>What you&apos;ll find</h2>
      <ul>
        <li>Implementation guides and code-oriented tutorials</li>
        <li>Architecture notes for AI and data systems</li>
        <li>Tool comparisons, workflows, and productivity tips</li>
        <li>Engineering lessons from real project constraints</li>
      </ul>

      <h2>Start with these sections</h2>
      <ul>
        <li>
          <Link href="/programming">Programming</Link> — languages, patterns,
          and software craft
        </li>
        <li>
          <Link href="/developer-tools">Developer Tools</Link> — frameworks,
          libraries, and workflows
        </li>
        <li>
          <Link href="/machine-learning">Machine Learning</Link> — model
          development and ML engineering
        </li>
        <li>
          <Link href="/cloud-computing">Cloud Computing</Link> — deployment,
          DevOps, and infrastructure
        </li>
        <li>
          <Link href="/tools">Tools directory</Link> — curated utilities worth
          knowing
        </li>
      </ul>

      <h2>How we write for builders</h2>
      <p>
        We favor reproducible examples, explicit trade-offs, and honest
        limitations. When code is included, we aim to explain why a decision was
        made—not only what to type.
      </p>

      <h2>Stay updated</h2>
      <p>
        Subscribe via <Link href="/newsletter">newsletter</Link> or{" "}
        <a href="/feed.xml">RSS</a>, and browse the latest{" "}
        <Link href="/articles">articles</Link>.
      </p>

      <h2>New here?</h2>
      <p>
        Visit <Link href="/start-here">Start Here</Link> for a broader reading
        guide, or read <Link href="/about">about {siteConfig.name}</Link>.
      </p>
    </StaticPage>
  );
}
