import Link from "next/link";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { isPersonalSite } from "@/config/site-mode";
import { siteConfig } from "@/config/site";
import { legalIntro } from "@/config/static-pages";

export const metadata = buildStaticPageMetadata(
  "Editorial Standards",
  `How ${siteConfig.name} researches, writes, and maintains published content.`,
  "/editorial",
);

export default function EditorialPage() {
  return (
    <StaticPage
      title="Editorial Standards"
      description={legalIntro()}
      path="/editorial"
    >
      <p>
        {siteConfig.name} exists to publish trustworthy, useful writing about
        technology. These standards explain how we create content and what readers
        can expect.
      </p>

      <h2>Our principles</h2>
      <ul>
        <li>
          <strong>Accuracy first:</strong> verify claims, cite sources, and
          correct errors promptly
        </li>
        <li>
          <strong>Clarity over hype:</strong> explain concepts in plain language
          without exaggeration
        </li>
        <li>
          <strong>Practical value:</strong> favor actionable insight readers can
          apply
        </li>
        <li>
          <strong>Transparency:</strong> disclose limitations, assumptions, and
          conflicts of interest
        </li>
        <li>
          <strong>Respect for readers:</strong> no clickbait, dark patterns, or
          manipulative framing
        </li>
      </ul>

      <h2>How articles are created</h2>
      <ol>
        <li>Topic selection based on reader needs and field relevance</li>
        <li>Research using primary documentation, papers, and reputable sources</li>
        <li>Drafting with structure, examples, and tested code where applicable</li>
        <li>Review for technical accuracy, readability, and SEO quality</li>
        <li>Publication with metadata, categories, and update notes when needed</li>
      </ol>

      <h2>Corrections and updates</h2>
      <p>
        When we discover factual errors, we correct them and note significant
        revisions when appropriate. Readers can report issues through our{" "}
        <Link href="/contact">contact page</Link>.
      </p>

      <h2>AI-assisted writing</h2>
      <p>
        We may use AI tools for brainstorming, outlining, or editing, but
        published work is reviewed by a human editor. We do not publish unreviewed
        generated content and we remain responsible for what appears on the
        site.
      </p>

      <h2>Sponsored content and ads</h2>
      <p>
        {isPersonalSite
          ? "At this time, we do not publish sponsored articles or paid placements. If that changes, sponsored content will be clearly labeled."
          : "Sponsored content must be clearly labeled and must meet the same quality bar as editorial content. Advertising is separated from editorial decision-making."}
      </p>

      <h2>What we avoid</h2>
      <ul>
        <li>Unverified rumors presented as fact</li>
        <li>Plagiarism or unattributed republishing</li>
        <li>Misleading headlines that misrepresent the article</li>
        <li>Undisclosed affiliate relationships</li>
      </ul>

      <h2>Reader expectations by audience</h2>
      <ul>
        <li>
          <Link href="/for-developers">Developers</Link> — implementation detail,
          code examples, and engineering trade-offs
        </li>
        <li>
          <Link href="/for-researchers">Researchers and students</Link> —
          conceptual depth, references, and learning paths
        </li>
        <li>
          <Link href="/start-here">New readers</Link> — curated starting points
          and topic guides
        </li>
      </ul>
    </StaticPage>
  );
}
