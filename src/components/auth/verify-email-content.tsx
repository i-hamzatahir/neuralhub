"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { resendVerificationEmail } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VerifyEmailContentProps {
  email?: string;
  pending?: boolean;
  verified?: boolean;
  error?: string;
}

export function VerifyEmailContent({
  email,
  pending,
  verified,
  error,
}: VerifyEmailContentProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleResend() {
    if (!email) return;
    startTransition(async () => {
      const result = await resendVerificationEmail(email);
      setMessage(result.message ?? result.error ?? null);
    });
  }

  if (verified) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-display text-2xl">Email verified</CardTitle>
          <CardDescription>
            Your email has been verified. You can now sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-display text-2xl">Verification failed</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {email && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              loading={isPending}
            >
              Resend verification email
            </Button>
          )}
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/login">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (pending) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-display text-2xl">Check your email</CardTitle>
          <CardDescription>
            We sent a verification link to{" "}
            <strong className="text-foreground">{email}</strong>. Click the link
            to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {message && (
            <p className="text-center text-sm text-muted-foreground">{message}</p>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            loading={isPending}
          >
            Resend verification email
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/login">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-display text-2xl">Verify your email</CardTitle>
        <CardDescription>
          Click the link in your email to verify your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="ghost" className="w-full" asChild>
          <Link href="/login">Back to login</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
