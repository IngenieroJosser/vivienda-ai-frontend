import type { ReactNode } from "react";
import { PortalLayout } from "@/components/portal-shell";

export default function AsesorLayout({ children }: { children: ReactNode }) {
  return <PortalLayout role="asesor">{children}</PortalLayout>;
}
