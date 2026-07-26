import { ProspectHandoff } from "@/features/prospect/components/prospect-handoff";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AgendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <ProspectHandoff sessionId={first(params.sessionId)} />;
}
