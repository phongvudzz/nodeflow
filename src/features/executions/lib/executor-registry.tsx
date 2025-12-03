import { NodeExecutor } from "../types";
import { NodeType } from "@/generated/prisma/enums";
import { manualTriggerExecutor } from "@/features/triggers/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";

export const executorRegistry: Record<NodeType, NodeExecutor<any>> = {
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
};

export const getExecutor = (nodeType: NodeType): NodeExecutor<any> => {
  const executor = executorRegistry[nodeType];

  if (!executor) {
    throw new Error(`Executor not found for node type: ${nodeType}`);
  }

  return executor;
};
