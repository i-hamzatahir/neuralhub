import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { isPersonalSite } from "@/config/site-mode";

export const metadata = {
  title: isPersonalSite ? "Admin sign in" : "Sign in",
  robots: isPersonalSite ? { index: false, follow: false } : undefined,
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-shimmer rounded-xl" />}>
      <LoginForm />
    </Suspense>
  );
}
