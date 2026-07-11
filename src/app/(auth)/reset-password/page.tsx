import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = {
  title: "Reset password",
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="w-full max-w-md rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
        Invalid or missing reset token. Please request a new password reset link.
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
