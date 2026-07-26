import {
  claimLead,
  createLeadActivity,
  getLead,
  listLeadActivities,
  updateCommercialWorkflow,
  type CommercialActivity,
  type CommercialActivityInput,
  type CommercialWorkflow,
  type CommercialWorkflowInput,
  type LeadDetailResponse,
} from "./leads";

export type CommercialLeadSnapshot = {
  workflow: CommercialWorkflow;
  lead: LeadDetailResponse;
  activities: CommercialActivity[];
};

export async function claimLeadAndRefresh(
  leadId: string,
  signal?: AbortSignal,
): Promise<CommercialLeadSnapshot> {
  const workflow = await claimLead(leadId, signal);
  return refreshCommercialLead(leadId, workflow, signal);
}

export async function updateWorkflowAndRefresh(
  leadId: string,
  input: CommercialWorkflowInput,
  signal?: AbortSignal,
): Promise<CommercialLeadSnapshot> {
  const workflow = await updateCommercialWorkflow(leadId, input, signal);
  return refreshCommercialLead(leadId, workflow, signal);
}

export async function createActivityAndRefresh(
  leadId: string,
  input: CommercialActivityInput,
  idempotencyKey: string,
  signal?: AbortSignal,
): Promise<CommercialLeadSnapshot> {
  const operation = await createLeadActivity(
    leadId,
    input,
    idempotencyKey,
    signal,
  );
  return refreshCommercialLead(leadId, operation.workflow, signal);
}

async function refreshCommercialLead(
  leadId: string,
  workflow: CommercialWorkflow,
  signal?: AbortSignal,
): Promise<CommercialLeadSnapshot> {
  const [lead, activities] = await Promise.all([
    getLead(leadId, signal),
    listLeadActivities(leadId, signal),
  ]);
  return { workflow, lead, activities };
}
