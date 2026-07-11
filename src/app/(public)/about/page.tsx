import Link from "next/link";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { siteConfig } from "@/config/site";

export const metadata = buildStaticPageMetadata(
  "About NeuralHub",
  "Learn about our mission to advance knowledge in AI, data science, and technology.",
  "/about",
);

export default function AboutPage() {
  return (
    <StaticPage
      title="About NeuralHub"
      description="A premium knowledge platform for researchers, engineers, and writers."
      path="/about"
    >
      <p>
        {siteConfig.name} is a publication platform built for people working at
        the frontier of artificial intelligence, data science, machine learning,
        and software engineering.
      </p>
      <p>
        We combine the writing experience of Medium, the developer focus of
        Hashnode, and the performance standards of modern SaaS products — so
        authors can publish with confidence and readers can learn without friction.
      </p>
      <h2>Our mission</h2>
      <p>
        Make high-quality technical knowledge accessible, discoverable, and
        beautifully presented. We believe great ideas deserve great tooling.
      </p>
      <h2>For authors</h2>
      <p>
        Create an account, verify your email, and{" "}
        <Link href="/write">become an author</Link> to start publishing. Your
        dashboard includes drafts, analytics, and a distraction-free editor with
        autosave.
      </p>
      <h2>For readers</h2>
      <p>
        Explore articles by topic, follow authors, and subscribe to our{" "}
        <a href="/feed.xml">RSS feed</a> for the latest publications.
      </p>
    </StaticPage>
  );
}
