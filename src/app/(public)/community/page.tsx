import Link from "next/link";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { Button } from "@/components/ui/button";
import { isPersonalSite } from "@/config/site-mode";

export const metadata = buildStaticPageMetadata(
  "Community",
  isPersonalSite
    ? "Explore articles and topics on this personal technology blog."
    : "Connect with authors, join discussions, and collaborate on AI and engineering topics.",
  "/community",
);

export default function CommunityPage() {
  if (isPersonalSite) {
    return (
      <StaticPage
        title="Explore"
        description="Discover articles and topics on this blog."
        path="/community"
      >
        <p>
          This is a personal blog focused on sharing useful technical content.
          Browse articles by topic, subscribe to the newsletter, or reach out
          through the contact page.
        </p>
        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/articles">Browse articles</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/newsletter">Newsletter</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">Contact</Link>
          </Button>
        </div>
      </StaticPage>
    );
  }

  return (
    <StaticPage
      title="Community"
      description="Connect with authors, join discussions, and collaborate on research and engineering topics."
      path="/community"
    >
      <p>
        NeuralHub is built for people who publish and learn at the frontier of
        technology.
      </p>
      <div className="not-prose mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/register">Join the community</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/articles">Browse articles</Link>
        </Button>
      </div>
    </StaticPage>
  );
}
