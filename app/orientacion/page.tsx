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
    utm_medium: first(values.utm_medium),
    utm_campaign: first(values.utm_campaign),
    utm_content: first(values.utm_content),
    utm_term: first(values.utm_term),
    utm_id: first(values.utm_id),
    campaign_id: first(values.campaign_id),
    adset_id: first(values.adset_id),
    adset_name: first(values.adset_name),
    ad_id: first(values.ad_id),
    ad_name: first(values.ad_name),
    placement: first(values.placement),
    site_source_name: first(values.site_source_name),
    fbclid: first(values.fbclid),
    project_id: first(values.project_id),
    project: first(values.project),
    leadId: first(values.leadId),
    lead_id: first(values.lead_id),
    external_lead_id: first(values.external_lead_id),
  });
  const campaign = resolveCampaignExperience(acquisition.campaign);

  return <AcquisitionEntry acquisition={acquisition} campaign={campaign} />;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
