import { PortalShell } from "@/components/portal-shell";
import { ChatIntelligenceDashboard } from "@/features/advisor/components/chat-intelligence-dashboard";
import { AdvisorDataIntelligence } from "@/features/advisor/components/advisor-data-intelligence";

export default function IntelligencePage() {
  return (
    <PortalShell
      role="asesor"
      title="Inteligencia conversacional"
      subtitle="Evidencia procesada, desempeño del recomendador y gobierno de las conversaciones del perfilador."
    >
      <div className="space-y-4">
        <AdvisorDataIntelligence detailed />
        <ChatIntelligenceDashboard />
      </div>
    </PortalShell>
  );
}
