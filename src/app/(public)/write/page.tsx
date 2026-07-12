import { redirect } from "next/navigation";
import { isPersonalSite } from "@/config/site-mode";
import { auth } from "@/lib/auth";
import { canAccessDashboard } from "@/lib/auth/policies";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Start Writing",
  description:
    "Publish articles on AI, data science, and technology.",
  path: "/write",
  noIndex: true,
});

export default async function WritePage() {
  if (isPersonalSite) {
    const session = await auth();
    if (session?.user && canAccessDashboard(session.user)) {
      redirect("/dashboard/articles/new");
    }
    redirect("/");
  }

  redirect("/register");
}
