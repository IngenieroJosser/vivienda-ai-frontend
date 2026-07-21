import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://viviendamatch.colsubsidio.com"),
  title: { default: "Vivienda Match AI | Colsubsidio", template: "%s | Vivienda Match AI" },
  description: "Perfilamiento inteligente y recomendación personalizada de vivienda para afiliados de Colsubsidio.",
  keywords: ["Vivienda", "Colsubsidio", "Inteligencia Artificial", "Recomendación de vivienda", "Match Inmobiliario", "Subsidio de vivienda", "Colombia"],
  authors: [{ name: "Colsubsidio", url: "https://www.colsubsidio.com/" }],
  creator: "Colsubsidio",
  publisher: "Colsubsidio",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Vivienda Match AI | Colsubsidio",
    description: "Perfilamiento inteligente y recomendación personalizada de vivienda para afiliados de Colsubsidio.",
    url: "https://viviendamatch.colsubsidio.com", // Puedes ajustar esta URL a la de producción
    siteName: "Vivienda Match AI",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vivienda Match AI | Colsubsidio",
    description: "Perfilamiento inteligente y recomendación personalizada de vivienda para afiliados de Colsubsidio.",
    creator: "@Colsubsidio",
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${manrope.className} h-full antialiased`}>
      <body className={`min-h-full flex flex-col`}>{children}</body>
    </html>
  );
}
