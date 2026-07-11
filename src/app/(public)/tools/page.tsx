import Link from "next/link";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { developerTools } from "@/config/curated";

export const metadata = buildStaticPageMetadata(
  "Tools",
  "A curated directory of AI, ML, and developer tools for practitioners.",
  "/tools",
);

export default function ToolsPage() {
  return (
    <StaticPage
      title="Developer Tools"
      description="A curated directory of AI, ML, and engineering tools for practitioners."
      path="/tools"
    >
      <p>
        Tools we recommend for building, deploying, and writing about modern
        software and AI systems. Explore more in our{" "}
        <Link href="/developer-tools" className="text-primary hover:underline">
          Developer Tools
        </Link>{" "}
        topic.
      </p>

      <div className="not-prose space-y-4">
        {developerTools.map((tool) => (
          <a
            key={tool.name}
            href={tool.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{tool.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tool.description}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {tool.category}
              </span>
            </div>
          </a>
        ))}
      </div>
    </StaticPage>
  );
}
