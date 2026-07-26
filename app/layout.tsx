import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import {
  absoluteUrl,
  getGoogleSiteVerification,
  getSiteOrigin,
  siteConfig,
} from "@/lib/seo";

import "./globals.css";

const manrope = localFont({
  src: "./fonts/Manrope-Variable.woff2",
  display: "swap",
  variable: "--font-manrope",
  weight: "200 800",
  fallback: ["Segoe UI", "Arial"],
  adjustFontFallback: "Arial",
});

const googleSiteVerification = getGoogleSiteVerification();

export const metadata: Metadata = {
  metadataBase: getSiteOrigin() ?? undefined,
  applicationName: siteConfig.name,
  title: {
    default: "Vivienda Colsubsidio | Encuentra un camino para tu vivienda",
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "vivienda Colsubsidio",
    "proyectos de vivienda",
    "subsidio de vivienda",
    "compra de vivienda en Colombia",
    "orientación de vivienda",
  ],
  authors: [
    {
      name: "Colsubsidio",
      url: "https://www.colsubsidio.com/",
    },
  ],

  creator: "Colsubsidio",
  publisher: "Colsubsidio",
  category: "Vivienda",
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Vivienda Colsubsidio",
    description: siteConfig.description,
    ...(getSiteOrigin() ? { url: absoluteUrl("/") } : {}),
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vivienda Colsubsidio",
    description: siteConfig.description,
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/icon.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/apple-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },

  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="es-CO"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-[color:var(--vm-color-canvas)] font-sans text-[color:var(--vm-color-ink)]">
        {children}
      </body>
    </html>
  );
}

