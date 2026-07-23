import { ConversationClient } from "@/features/conversation/components/conversation-client";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <ConversationClient sessionId={sessionId} />;
}
