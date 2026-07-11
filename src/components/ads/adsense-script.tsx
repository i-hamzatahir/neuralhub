import Script from "next/script";
import { adConfig } from "@/config/ads";

export function AdSenseScript() {
  if (!adConfig.enabled || !adConfig.publisherId) return null;

  return (
    <Script
      id="adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.publisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
