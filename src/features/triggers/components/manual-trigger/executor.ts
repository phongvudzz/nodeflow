import type { NodeExecutor } from "@/features/executions/types";
import { manualTriggerChannel } from "@/inngest/channel/manual-trigger";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  data,
  context,
  nodeId,
  step,
  publish,
}) => {
  await publish(manualTriggerChannel().status({ nodeId, status: "loading" }));

  const result = await step.run("manual-trigger", async () => {
    return context;
  });

  await publish(manualTriggerChannel().status({ nodeId, status: "success" }));

  return result;
};
