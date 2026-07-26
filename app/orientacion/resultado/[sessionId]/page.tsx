import { ProspectResult } from "@/features/prospect/components/prospect-result";

export default async function PublicResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <ProspectResult sessionId={sessionId} />;
}
