"use client";

import { useEffect } from "react";

function reportClientError(payload: {
  message: string;
  digest?: string;
  path?: string;
  source: "window" | "unhandledrejection" | "global-error";
}) {
  if (process.env.NODE_ENV !== "production") return;

  fetch("/api/errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      path: payload.path ?? window.location.pathname,
    }),
    keepalive: true,
  }).catch(() => {});
}

export function ClientErrorReporter() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      reportClientError({
        message: event.message || "Unknown client error",
        source: "window",
      });
    }

    function onRejection(event: PromiseRejectionEvent) {
      const message =
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason ?? "Unhandled rejection");

      reportClientError({ message, source: "unhandledrejection" });
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
