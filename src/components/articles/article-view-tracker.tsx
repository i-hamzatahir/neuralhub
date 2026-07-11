"use client";

import { useEffect, useRef } from "react";

export function ArticleViewTracker({
  articleId,
}: {
  articleId: string;
}) {
  const startRef = useRef(0);
  const viewIdRef = useRef<string | null>(null);
  const viewTokenRef = useRef<string | null>(null);

  useEffect(() => {
    startRef.current = Date.now();
    const referrer = document.referrer || undefined;

    fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, referrer }),
    })
      .then((res) => res.json())
      .then((data: { viewId?: string; viewToken?: string }) => {
        if (data.viewId) viewIdRef.current = data.viewId;
        if (data.viewToken) viewTokenRef.current = data.viewToken;
      })
      .catch(() => {});

    function sendReadTime() {
      const viewId = viewIdRef.current;
      const viewToken = viewTokenRef.current;
      if (!viewId || !viewToken) return;
      const readTime = Math.floor((Date.now() - startRef.current) / 1000);
      if (readTime < 1) return;

      fetch("/api/analytics/view", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ viewId, viewToken, readTime }),
        keepalive: true,
      }).catch(() => {});
    }

    const interval = setInterval(sendReadTime, 30000);

    window.addEventListener("beforeunload", sendReadTime);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", sendReadTime);
      sendReadTime();
    };
  }, [articleId]);

  return null;
}
