import type { ReactNode } from "react";
import { AnimatedHeroBackground } from "@/components/animated-hero-background";
import { PublicHeader } from "@/components/public-header";
import { RoutePrefetcher } from "@/components/route-prefetcher";

export default function ViviendaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="internal-shell internal-shell--animated">
      <AnimatedHeroBackground variant="vivienda" className="fixed inset-0" />
      <RoutePrefetcher />
      <PublicHeader />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
