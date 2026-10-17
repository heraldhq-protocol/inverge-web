import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";

import "@/app/globals.css";
import "@/lib/env/server";

import { JsonLd } from "@/components/shared/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { buildOgImageUrl } from "@/lib/seo/og-url";
import {
  absoluteUrl,
  siteOrigin,
  SITE_DEFAULT_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TITLE,
  twitterSiteHandle,
} from "@/lib/seo/site";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

// Display face for headings (see D-015). Body copy stays Geist Sans.
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const homepageShareImage = buildOgImageUrl({
  description: SITE_DEFAULT_DESCRIPTION,
  eyebrow: "Crowdfunding",
  template: "default",
  title: SITE_TITLE,
});

const twitterHandle = twitterSiteHandle();

export const metadata: Metadata = {
  applicationName: SITE_NAME,
  description: SITE_DEFAULT_DESCRIPTION,
  // Canonical origin comes from the environment, never from the request, so a
  // preview deployment cannot claim production URLs.
  metadataBase: new URL(siteOrigin()),
  openGraph: {
    description: SITE_DEFAULT_DESCRIPTION,
    images: [
      {
        alt: SITE_NAME,
        height: 630,
        url: homepageShareImage,
        width: 1200,
      },
    ],
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    type: "website",
    url: absoluteUrl("/"),
  },
  robots: { follow: true, index: true },
  // `%s` is each page's bare title; the site name is appended once, here.
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  twitter: {
    card: "summary_large_image",
    description: SITE_DEFAULT_DESCRIPTION,
    images: [{ alt: SITE_NAME, url: homepageShareImage }],
    title: SITE_TITLE,
    ...(twitterHandle !== null ? { site: twitterHandle } : {}),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable}`}
    >
      <body className="min-h-dvh bg-canvas font-sans text-ink antialiased">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        {children}
      </body>
    </html>
  );
}
