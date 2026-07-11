"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerUser } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, InputGroup } from "@/components/ui/input";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerUser, {
    success: false,
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-display text-2xl">Create account</CardTitle>
        <CardDescription>Join the NeuralHub community</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <OAuthButtons callbackUrl="/" />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or register with email
            </span>
          </div>
        </div>

        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <InputGroup label="Full name" htmlFor="name">
            <Input
              id="name"
              name="name"
              placeholder="Jane Doe"
              autoComplete="name"
              required
            />
          </InputGroup>

          <InputGroup
            label="Username"
            htmlFor="username"
            description="Letters, numbers, underscores, and hyphens only."
          >
            <Input
              id="username"
              name="username"
              placeholder="janedoe"
              autoComplete="username"
              required
            />
          </InputGroup>

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

          <InputGroup
            label="Password"
            htmlFor="password"
            description="Min 8 chars with uppercase, lowercase, and a number."
          >
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </InputGroup>

          <Button type="submit" className="w-full" size="lg" loading={pending}>
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
