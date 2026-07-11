import Link from "next/link";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { curatedResources } from "@/config/curated";

export const metadata = buildStaticPageMetadata(
  "Resources",
  "Hand-picked learning resources, feeds, and guides for technical professionals.",
  "/resources",
);

export default function ResourcesPage() {
  return (
    <StaticPage
      title="Resources"
      description="Hand-picked courses, feeds, and learning paths for technical professionals."
      path="/resources"
    >
      <p>
        Quick links to the best ways to stay current on NeuralHub — subscribe,
        search, and discover new writing across AI, data science, and engineering.
      </p>

      <div className="not-prose space-y-4">
        {curatedResources.map((resource) => (
          <Link
            key={resource.title}
            href={resource.href}
            className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <h2 className="text-lg font-semibold">{resource.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {resource.description}
            </p>
          </Link>
        ))}
      </div>
    </StaticPage>
  );
}
