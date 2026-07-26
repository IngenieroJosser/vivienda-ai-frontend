import type { AcquisitionContext } from "@/features/prospect/domain";

export type AcquisitionPayload = {
  source: string;
  medium?: string;
  campaign: string;
  content: string;
  term?: string;
  campaign_id?: string;
  ad_set_id?: string;
  ad_set_name?: string;
  ad_id?: string;
  ad_name?: string;
  placement?: string;
  site_source?: string;
  click_id?: string;
  project_id?: string;
  lead_reference?: string;
  is_paid: boolean;
  landing_path?: string;
  referrer_origin?: string;
  locale?: string;
  timezone?: string;
  device_class?: string;
};

export function toAcquisitionPayload(
  acquisition: AcquisitionContext,
  leadReference?: string,
): AcquisitionPayload {
  return {
    source: acquisition.source,
    ...(acquisition.medium ? { medium: acquisition.medium } : {}),
    campaign: acquisition.campaign,
    content: acquisition.content,
    ...(acquisition.term ? { term: acquisition.term } : {}),
    ...(acquisition.campaignId
      ? { campaign_id: acquisition.campaignId }
      : {}),
    ...(acquisition.adSetId ? { ad_set_id: acquisition.adSetId } : {}),
    ...(acquisition.adSetName
      ? { ad_set_name: acquisition.adSetName }
      : {}),
    ...(acquisition.adId ? { ad_id: acquisition.adId } : {}),
    ...(acquisition.adName ? { ad_name: acquisition.adName } : {}),
    ...(acquisition.placement ? { placement: acquisition.placement } : {}),
    ...(acquisition.siteSource
      ? { site_source: acquisition.siteSource }
      : {}),
    ...(acquisition.clickId ? { click_id: acquisition.clickId } : {}),
    ...(acquisition.projectId ? { project_id: acquisition.projectId } : {}),
    ...(leadReference ? { lead_reference: leadReference } : {}),
    is_paid: acquisition.source.toLowerCase() === "meta",
    ...(acquisition.landingPath
      ? { landing_path: acquisition.landingPath }
      : {}),
    ...(acquisition.referrerOrigin
      ? { referrer_origin: acquisition.referrerOrigin }
      : {}),
    ...(acquisition.locale ? { locale: acquisition.locale } : {}),
    ...(acquisition.timezone ? { timezone: acquisition.timezone } : {}),
    ...(acquisition.deviceClass
      ? { device_class: acquisition.deviceClass }
      : {}),
  };
}
