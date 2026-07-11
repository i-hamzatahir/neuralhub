import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AdSlot } from "@/components/ads/ad-slot";
import { auth } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/auth/policies";
import { getSiteSettingsMap } from "@/lib/services/admin/admin.service";
import { isSiteSettingEnabled } from "@/lib/security/site-settings";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettingsMap();
  const maintenance = isSiteSettingEnabled(settings, "site.maintenance_mode");

  if (maintenance) {
    const session = await auth();
    if (!session?.user || !canAccessAdmin(session.user)) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <h1 className="text-display text-2xl font-semibold">Maintenance</h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            NeuralHub is undergoing scheduled maintenance. Please check back soon.
          </p>
        </div>
      );
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <AdSlot slot="header" className="mx-auto w-full max-w-7xl px-4 py-2 sm:px-6 lg:px-8" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
