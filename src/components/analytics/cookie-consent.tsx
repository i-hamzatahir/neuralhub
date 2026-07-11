"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CONSENT_KEY,
  notifyConsentChange,
  useCookieConsent,
} from "@/components/analytics/use-cookie-consent";

export function CookieConsent() {
  const { hasAnswered } = useCookieConsent();

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    notifyConsentChange();
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, "declined");
    notifyConsentChange();
  }

  if (hasAnswered) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 p-4 shadow-lg backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use cookies for authentication and optional analytics. See our{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            privacy policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={decline}>
            Decline
          </Button>
          <Button size="sm" onClick={accept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
