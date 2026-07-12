import Link from "next/link";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { siteConfig } from "@/config/site";

export const metadata = buildStaticPageMetadata(
  "About",
  `Learn about ${siteConfig.name} — articles on AI, data science, programming, and technology.`,
  "/about",
);

export default function AboutPage() {
  return (
    <StaticPage
      title={`About ${siteConfig.name}`}
      description="A personal blog focused on AI, data science, and software engineering."
      path="/about"
    >
      <p>
        {siteConfig.name} is a personal website and blog sharing practical
        articles, tutorials, and notes on artificial intelligence, machine
        learning, data science, programming, and technology.
      </p>
      <p>
        The goal is simple: publish useful, in-depth content that helps readers
        learn, stay current, and apply new ideas in real projects.
      </p>
      <h2>What you&apos;ll find here</h2>
      <ul>
        <li>Technical tutorials and how-to guides</li>
        <li>Explanations of AI and data science concepts</li>
        <li>Programming tips, tools, and engineering notes</li>
        <li>Curated insights on emerging technology</li>
      </ul>
      <h2>Stay updated</h2>
      <p>
        Browse the <Link href="/articles">latest articles</Link>, explore by{" "}
        <Link href="/articles">topic</Link>, or subscribe via the{" "}
        <Link href="/newsletter">newsletter</Link> and{" "}
        <a href="/feed.xml">RSS feed</a>.
      </p>
      <h2>Contact</h2>
      <p>
        Questions or collaboration ideas? Visit the{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    </StaticPage>
  );
}
