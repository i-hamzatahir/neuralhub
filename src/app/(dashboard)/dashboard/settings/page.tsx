import { getCurrentUser } from "@/lib/auth/session";
import { getUserSettings } from "@/lib/services/settings/settings.service";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const metadata = { title: "Settings" };

export default async function DashboardSettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const settings = await getUserSettings(user.id);

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-display text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account preferences
        </p>
      </header>
      <SettingsForm settings={settings} />
    </div>
  );
}
