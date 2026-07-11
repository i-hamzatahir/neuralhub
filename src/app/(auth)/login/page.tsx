import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-shimmer rounded-xl" />}>
      <LoginForm />
    </Suspense>
  );
}
