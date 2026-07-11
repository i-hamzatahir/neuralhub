"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { loginAction } from "@/lib/actions/login";
import { Button } from "@/components/ui/button";
import { Input, InputGroup } from "@/components/ui/input";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { sanitizeCallbackUrl } from "@/lib/security/redirect";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeCallbackUrl(searchParams.get("callbackUrl"));
  const error = searchParams.get("error");

  const [state, formAction, pending] = useActionState(loginAction, {
    success: false,
  });

  const errorMessage =
    state.error ??
    (error === "CredentialsSignin" ? "Invalid email or password." : null) ??
    (error === "OAuthAccountNotLinked"
      ? "This email is linked to another sign-in method. Sign in with your original method."
      : null);

  return (
    <Card className="w-full max-w-md border-border/80 shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>Sign in to continue reading and writing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <OAuthButtons callbackUrl={callbackUrl} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

          {errorMessage && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <InputGroup label="Email" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </InputGroup>

          <InputGroup label="Password" htmlFor="password">
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </InputGroup>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={pending}>
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
