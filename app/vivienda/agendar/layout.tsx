import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPrivateMetadata } from "@/lib/seo";

export const metadata: Metadata = createPrivateMetadata(
  "Siguiente paso",
  "Confirmación privada del siguiente paso de orientación de vivienda.",
);

export default function HandoffLayout({ children }: { children: ReactNode }) {
  return children;
}
