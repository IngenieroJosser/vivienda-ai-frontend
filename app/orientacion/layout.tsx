import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPrivateMetadata } from "@/lib/seo";

export const metadata: Metadata = createPrivateMetadata(
  "Orientación personalizada",
  "Conversación privada para comprender tu búsqueda de vivienda.",
);

export default function OrientationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
