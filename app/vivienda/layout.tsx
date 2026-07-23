import type { ReactNode } from "react";
import { AnimatedHeroBackground } from "@/components/animated-hero-background";
import { PublicHeader } from "@/components/public-header";

export default function ViviendaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="internal-shell internal-shell--animated">
      <AnimatedHeroBackground variant="vivienda" className="fixed inset-0" />
      <PublicHeader />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
