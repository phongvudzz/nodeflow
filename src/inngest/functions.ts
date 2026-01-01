import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { httpRequestChannel } from "./channel/http-request";
import { manualTriggerChannel } from "./channel/manual-trigger";
import { stripeTriggerChannel } from "./channel/stripe-trigger";
import { googleFormTriggerChannel } from "./channel/google-form-trigger";
import { geminiChannel } from "./channel/gemini";
import { openAIChannel } from "./channel/openai";
import { anthropicChannel } from "./channel/anthropic";
import { discordChannel } from "./channel/discord";
import { slackChannel } from "./channel/slack";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 0, // TODO: REMOVE IN PRODUCTION
  },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      openAIChannel(),
      anthropicChannel(),
      discordChannel(),
      slackChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const workflowId = event.data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError("Workflow ID is missing");
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true,
        },
      });

      return topologicalSort(workflow.nodes, workflow.connections);
    });

    const userId = await step.run("find-user-id", async () => {
      const workflow = await prisma.workflow.findFirstOrThrow({
        where: { id: workflowId },
        select: {
          userId: true,
        },
      });
      return workflow.userId;
    });

    // Initialize the context with any initial data from the trigger
    let context = event.data.initialData || {};

    // Execute each node in order
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type);
      context = await executor({
        data: node.data as Record<string, unknown>,
        context,
        nodeId: node.id,
        step,
        publish,
        userId,
      });
    }

    return { workflowId, result: context };
  }
);
