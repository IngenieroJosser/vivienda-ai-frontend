import { ProspectConversation } from "@/features/prospect/components/prospect-conversation";

export default async function PublicConversationPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <ProspectConversation sessionId={sessionId} />;
}
