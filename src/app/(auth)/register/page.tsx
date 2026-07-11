import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { getSiteSettingsMap } from "@/lib/services/admin/admin.service";
import { isSiteSettingEnabled } from "@/lib/security/site-settings";

export const metadata = {
  title: "Create account",
};

export default async function RegisterPage() {
  const settings = await getSiteSettingsMap();
  if (!isSiteSettingEnabled(settings, "site.registration_enabled")) {
    redirect("/login?error=registration_disabled");
  }

  return <RegisterForm />;
}
