import Link from "next/link";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { topicNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { audiencePages } from "@/config/static-pages";

export const metadata = buildStaticPageMetadata(
  "Start Here",
  `A reading guide for new visitors to ${siteConfig.name}.`,
  "/start-here",
);

export default function StartHerePage() {
  return (
    <StaticPage
      title="Start Here"
      description="A quick guide to exploring NeuralHub by topic, skill level, and goal."
      path="/start-here"
    >
      <p>
        Welcome to {siteConfig.name}. If you are new here, this page will help
        you find the right articles and resources for your background and goals.
      </p>

      <h2>Choose your path</h2>
      <ul>
        {audiencePages
          .filter((page) => page.href !== "/start-here")
          .map((page) => (
            <li key={page.href}>
              <Link href={page.href}>{page.title}</Link> — {page.description}
            </li>
          ))}
      </ul>

      <h2>Browse by topic</h2>
      <p>Explore our main categories:</p>
      <ul>
        {topicNav.map((topic) => (
          <li key={topic.href}>
            <Link href={topic.href}>{topic.title}</Link> — {topic.description}
          </li>
        ))}
      </ul>

      <h2>Recommended first steps</h2>
      <ol>
        <li>
          Read the <Link href="/about">about page</Link> to understand what we
          publish
        </li>
        <li>
          Visit <Link href="/articles">all articles</Link> or use{" "}
          <Link href="/search">search</Link> for a specific subject
        </li>
        <li>
          Subscribe to the <Link href="/newsletter">newsletter</Link> or{" "}
          <a href="/feed.xml">RSS feed</a> for new posts
        </li>
        <li>
          Review our <Link href="/editorial">editorial standards</Link> and{" "}
          <Link href="/privacy">privacy policy</Link>
        </li>
      </ol>

      <h2>How to get the most from this blog</h2>
      <ul>
        <li>
          <strong>Learning a topic:</strong> start with explainers, then move to
          tutorials and projects
        </li>
        <li>
          <strong>Staying current:</strong> follow AI, ML, and research
          categories
        </li>
        <li>
          <strong>Building skills:</strong> use programming and developer-tools
          sections for hands-on work
        </li>
      </ul>

      <h2>Questions or suggestions?</h2>
      <p>
        We welcome feedback on what to cover next. Reach us through the{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    </StaticPage>
  );
}
