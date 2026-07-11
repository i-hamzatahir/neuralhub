"use client";

import { useSyncExternalStore } from "react";

export const CONSENT_KEY = "neuralhub-cookie-consent";
const CONSENT_EVENT = "neuralhub-consent-change";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;

  window.addEventListener("storage", callback);
  window.addEventListener(CONSENT_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CONSENT_EVENT, callback);
  };
}

function getConsentValue(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CONSENT_KEY);
}

export function notifyConsentChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function useCookieConsent() {
  const value = useSyncExternalStore(
    subscribe,
    getConsentValue,
    () => null,
  );

  return {
    hasAnswered: value !== null,
    accepted: value === "accepted",
  };
}

export function useAnalyticsConsent() {
  return useSyncExternalStore(
    subscribe,
    () => getConsentValue() === "accepted",
    () => false,
  );
}
