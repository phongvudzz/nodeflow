import type { NodeExecutor } from "@/features/executions/types";
import { stripeTriggerChannel } from "@/inngest/channel/stripe-trigger";

type GoogleFormTriggerData = Record<string, unknown>;

export const stripeTriggerExecutor: NodeExecutor<
  GoogleFormTriggerData
> = async ({ context, nodeId, step, publish }) => {
  await publish(stripeTriggerChannel().status({ nodeId, status: "loading" }));

  const result = await step.run("strip-trigger", async () => {
    return context;
  });

  await publish(stripeTriggerChannel().status({ nodeId, status: "success" }));

  return result;
};
