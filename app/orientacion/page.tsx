import { AcquisitionEntry } from "@/features/prospect/components/acquisition-entry";
import { resolveCampaignExperience, sanitizeAcquisitionContext } from "@/features/prospect/campaigns";

type SearchValues = Record<string, string | string[] | undefined>;

export default async function PaidAcquisitionPage({
  searchParams,
}: {
  searchParams: Promise<SearchValues>;
}) {
  const values = await searchParams;
  const acquisition = sanitizeAcquisitionContext({
    utm_source: first(values.utm_source),
    utm_campaign: first(values.utm_campaign),
    utm_content: first(values.utm_content),
    leadId: first(values.leadId),
  });
  const campaign = resolveCampaignExperience(acquisition.campaign);

  return <AcquisitionEntry acquisition={acquisition} campaign={campaign} />;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
