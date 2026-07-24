import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://viviendamatch.colsubsidio.com"),

  applicationName: "Vivienda Match AI",

  title: {
    default: "Vivienda Match AI | Colsubsidio",
    template: "%s | Vivienda Match AI",
  },

  description:
    "Orientación personalizada y recomendación de vivienda para afiliados y no afiliados.",

  keywords: [
    "Vivienda",
    "Colsubsidio",
    "Vivienda Match AI",
    "Inteligencia Artificial",
    "Recomendación de vivienda",
    "Match inmobiliario",
    "Subsidio de vivienda",
    "Proyectos de vivienda",
    "Compra de vivienda",
    "Vivienda en Colombia",
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

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    title: "Vivienda Match AI | Colsubsidio",
    description:
      "Encuentra proyectos de vivienda ajustados a tu perfil, capacidad de compra y preferencias.",
    url: "https://viviendamatch.colsubsidio.com",
    siteName: "Vivienda Match AI",
    locale: "es_CO",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Vivienda Match AI | Colsubsidio",
    description:
      "Orientación personalizada de vivienda para afiliados y no afiliados.",
    creator: "@Colsubsidio",
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

  verification: {
    google: "Etegc4-TiHhORohNC4oQPrHvqWeKuBLgyseoRgRCuJg",
  },

  other: {
    "theme-color": "#0067b1",
    "color-scheme": "light",
  },
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
      <body className="flex min-h-full flex-col bg-[#fafafa] font-sans text-slate-950">
        {children}
      </body>
    </html>
  );
}

