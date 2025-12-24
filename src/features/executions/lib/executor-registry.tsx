import { NodeExecutor } from "../types";
import { NodeType } from "@/generated/prisma/enums";
import { httpRequestExecutor } from "../components/http-request/executor";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { stripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";
import { geminiExecutor } from "../components/gemini/executor";
import { openAIExecutor } from "../components/openai/executor";
import { anthropicExecutor } from "../components/anthropic/executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.GEMINI]: geminiExecutor,
  [NodeType.ANTHROPIC]: anthropicExecutor,
  [NodeType.OPENAI]: openAIExecutor,
};

export const getExecutor = (nodeType: NodeType): NodeExecutor => {
  const executor = executorRegistry[nodeType];

  if (!executor) {
    throw new Error(`Executor not found for node type: ${nodeType}`);
  }

  return executor;
};
