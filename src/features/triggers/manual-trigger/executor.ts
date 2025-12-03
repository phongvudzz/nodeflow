import type { NodeExecutor } from "@/features/executions/types";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  data,
  context,
  nodeId,
  step,
}) => {
  // TODO: Publish "loading" state for manual trigger

  const result = await step.run("manual-trigger", async () => {
    return context;
  });

  // TODO: Publish "success" state for manual trigger

  return result;
};
