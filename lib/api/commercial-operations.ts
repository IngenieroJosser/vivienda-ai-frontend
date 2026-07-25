import {
  claimLead,
  createActivity,
  getLead,
  listActivities,
  updateWorkflow,
  type ActivityCreate,
  type CommercialActivity,
  type CommercialWorkflow,
  type LeadDetailResponse,
  type WorkflowUpdate,
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
  input: WorkflowUpdate,
  signal?: AbortSignal,
): Promise<CommercialLeadSnapshot> {
  const workflow = await updateWorkflow(leadId, input, signal);
  return refreshCommercialLead(leadId, workflow, signal);
}

export async function createActivityAndRefresh(
  leadId: string,
  input: ActivityCreate,
  idempotencyKey: string,
  signal?: AbortSignal,
): Promise<CommercialLeadSnapshot> {
  const operation = await createActivity(
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
    listActivities(leadId, signal),
  ]);
  return { workflow, lead, activities };
}
