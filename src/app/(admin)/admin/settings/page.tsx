import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canManageUsers } from "@/lib/auth/policies";
import { getSiteSettingsMap } from "@/lib/services/admin/admin.service";
import { saveSiteSettingFormAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata = { title: "Admin — Settings" };

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user || !canManageUsers(session.user)) {
    redirect("/admin?error=unauthorized");
  }

  const settings = await getSiteSettingsMap();

  const fields = [
    {
      key: "site.maintenance_mode",
      label: "Maintenance mode",
      description: "Set to true to show maintenance message (future use)",
      type: "text",
    },
    {
      key: "site.registration_enabled",
      label: "Registration enabled",
      description: "Set to false to disable new signups (future use)",
      type: "text",
    },
    {
      key: "site.announcement",
      label: "Site announcement",
      description: "Banner text shown site-wide (future use)",
      type: "text",
    },
  ];

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-display text-2xl font-semibold">Site settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform configuration stored in the database
        </p>
      </header>

      <div className="max-w-xl space-y-6">
        {fields.map((field) => (
          <form
            key={field.key}
            action={saveSiteSettingFormAction}
            className="rounded-xl border border-border bg-card p-5"
          >
            <input type="hidden" name="key" value={field.key} />
            <label className="text-sm font-medium">{field.label}</label>
            <p className="mt-1 text-xs text-muted-foreground">{field.description}</p>
            <div className="mt-3 flex gap-2">
              <Input
                name="value"
                defaultValue={settings[field.key] ?? ""}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                Save
              </Button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
