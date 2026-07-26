import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PortalLayout } from "@/components/portal-shell";
import { createPrivateMetadata } from "@/lib/seo";

export const metadata: Metadata = createPrivateMetadata(
  "Portal comercial",
  "Espacio de trabajo privado para asesores de Vivienda Colsubsidio.",
);

export default function AsesorLayout({ children }: { children: ReactNode }) {
  return <PortalLayout role="asesor">{children}</PortalLayout>;
}
