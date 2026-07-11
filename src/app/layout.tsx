import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { MicrosoftClarity } from "@/components/analytics/microsoft-clarity";
import { CookieConsent } from "@/components/analytics/cookie-consent";
import { AdSenseScript } from "@/components/ads/adsense-script";
import { ClientErrorReporter } from "@/components/monitoring/client-error-reporter";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { buildRootMetadata } from "@/lib/seo/metadata";
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo/json-ld";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = buildRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <JsonLdScript
          data={[buildWebSiteJsonLd(), buildOrganizationJsonLd()]}
        />
        <ThemeProvider>
          <AuthSessionProvider>
            {children}
            <CookieConsent />
          </AuthSessionProvider>
        </ThemeProvider>
        <GoogleAnalytics />
        <MicrosoftClarity />
        <AdSenseScript />
        <ClientErrorReporter />
      </body>
    </html>
  );
}
