import Link from "next/link";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { isPersonalSite } from "@/config/site-mode";
import { siteConfig } from "@/config/site";
import { audiencePages } from "@/config/static-pages";

export const metadata = buildStaticPageMetadata(
  "About",
  `Learn about ${siteConfig.name} — a professional blog on AI, data science, programming, and technology.`,
  "/about",
);

export default function AboutPage() {
  return (
    <StaticPage
      title={`About ${siteConfig.name}`}
      description="Independent writing on AI, data science, and software engineering."
      path="/about"
    >
      <p>
        {siteConfig.name} is an independent technology blog focused on
        artificial intelligence, machine learning, data science, programming,
        and the tools shaping modern software. We publish clear, practical
        articles for readers who want to learn deeply and apply ideas in real
        work.
      </p>

      <h2>Our mission</h2>
      <p>
        Technology moves fast. Our goal is to slow down the noise and publish
        useful explanations, tutorials, and analysis that respect your time. We
        prioritize accuracy, clarity, and practical value over hype.
      </p>

      <h2>Who this blog is for</h2>
      <ul>
        <li>
          <strong>Developers and engineers</strong> building with AI, data, and
          modern stacks
        </li>
        <li>
          <strong>Students and researchers</strong> learning foundations and
          staying current with the field
        </li>
        <li>
          <strong>Technology professionals</strong> who want thoughtful,
          long-form writing instead of shallow summaries
        </li>
        <li>
          <strong>Curious readers</strong> exploring how software, data, and
          intelligence are changing
        </li>
      </ul>

      <h2>What we publish</h2>
      <ul>
        <li>In-depth tutorials and how-to guides</li>
        <li>Concept explainers for AI and data science topics</li>
        <li>Programming notes, patterns, and tool reviews</li>
        <li>Research summaries and technology commentary</li>
        <li>Curated resources and practical recommendations</li>
      </ul>

      <h2>How we work</h2>
      <p>
        {isPersonalSite
          ? `${siteConfig.name} is operated as a personal publication. Articles are written and edited by the site owner. We do not accept guest posts or sponsored content that compromises editorial independence.`
          : `${siteConfig.name} is a community publication. We welcome authors who share practical expertise and maintain high editorial standards.`}{" "}
        Read our{" "}
        <Link href="/editorial">editorial standards</Link> for more detail.
      </p>

      <h2>Explore by audience</h2>
      <ul>
        {audiencePages.map((page) => (
          <li key={page.href}>
            <Link href={page.href}>{page.title}</Link> — {page.description}
          </li>
        ))}
      </ul>

      <h2>Stay connected</h2>
      <p>
        Browse the <Link href="/articles">latest articles</Link>, explore{" "}
        <Link href="/ai">topics</Link>, subscribe to the{" "}
        <Link href="/newsletter">newsletter</Link>, or follow the{" "}
        <a href="/feed.xml">RSS feed</a> for updates.
      </p>

      <h2>Contact</h2>
      <p>
        Questions, corrections, or feedback? Visit our{" "}
        <Link href="/contact">contact page</Link> or email{" "}
        <a href={`mailto:${siteConfig.contactEmail}`}>
          {siteConfig.contactEmail}
        </a>
        .
      </p>
    </StaticPage>
  );
}
