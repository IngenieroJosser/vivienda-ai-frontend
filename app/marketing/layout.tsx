import type { ReactNode } from "react";
import { PortalLayout } from "@/components/portal-shell";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <PortalLayout role="marketing">{children}</PortalLayout>;
}
