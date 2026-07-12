import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { isPersonalSite, isPublicRegistrationEnabled } from "@/config/site-mode";
import { getSiteSettingsMap } from "@/lib/services/admin/admin.service";

export const metadata = {
  title: "Create account",
};

export default async function RegisterPage() {
  if (isPersonalSite) {
    redirect("/");
  }

  const settings = await getSiteSettingsMap();
  if (!isPublicRegistrationEnabled(settings)) {
    redirect("/");
  }

  return <RegisterForm />;
}
