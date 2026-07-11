import Link from "next/link";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { curatedProjects } from "@/config/curated";

export const metadata = buildStaticPageMetadata(
  "Projects",
  "Explore open-source projects, research implementations, and community builds.",
  "/projects",
);

export default function ProjectsPage() {
  return (
    <StaticPage
      title="Projects"
      description="Curated projects from the NeuralHub ecosystem and community."
      path="/projects"
    >
      <p>
        A hand-picked selection of projects worth exploring — from the platform
        itself to tools that help authors publish technical knowledge.
      </p>

      <div className="not-prose space-y-4">
        {curatedProjects.map((project) => (
          <Link
            key={project.name}
            href={project.href}
            className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{project.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {project.description}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {project.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </StaticPage>
  );
}
