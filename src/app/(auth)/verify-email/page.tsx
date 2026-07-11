import { VerifyEmailContent } from "@/components/auth/verify-email-content";
import { verifyEmailAction } from "@/lib/actions/auth";

export const metadata = {
  title: "Verify email",
};

interface PageProps {
  searchParams: Promise<{
    token?: string;
    email?: string;
    pending?: string;
  }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;

  if (params.token) {
    const result = await verifyEmailAction(params.token);
    return (
      <VerifyEmailContent
        verified={result.success}
        error={result.error}
        email={params.email}
      />
    );
  }

  return (
    <VerifyEmailContent
      email={params.email}
      pending={params.pending === "true"}
    />
  );
}
