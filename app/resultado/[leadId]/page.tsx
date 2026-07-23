import { ResultClient } from "@/features/conversation/components/result-client";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  return <ResultClient leadId={leadId} />;
}
