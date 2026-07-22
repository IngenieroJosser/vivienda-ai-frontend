import type { ReactNode } from "react";
import { PortalLayout } from "@/components/portal-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <PortalLayout role="admin">{children}</PortalLayout>;
}
