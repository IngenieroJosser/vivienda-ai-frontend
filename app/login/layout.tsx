import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPrivateMetadata } from "@/lib/seo";

export const metadata: Metadata = createPrivateMetadata(
  "Acceso para asesores",
  "Acceso al espacio de trabajo comercial de Vivienda Colsubsidio.",
);

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
