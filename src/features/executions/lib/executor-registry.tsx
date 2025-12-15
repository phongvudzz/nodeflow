import { NodeExecutor } from "../types";
import { NodeType } from "@/generated/prisma/enums";
import { httpRequestExecutor } from "../components/http-request/executor";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";

export const executorRegistry: Record<NodeType, NodeExecutor<any>> = {
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
};

export const getExecutor = (nodeType: NodeType): NodeExecutor<any> => {
  const executor = executorRegistry[nodeType];

  if (!executor) {
    throw new Error(`Executor not found for node type: ${nodeType}`);
  }

  return executor;
};
