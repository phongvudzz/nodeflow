import { NodeType } from "@/generated/prisma/enums";

export const executorRegistry: Record<NodeType, unknown> = {
  [NodeType.INITIAL]: () => {},
  [NodeType.MANUAL_TRIGGER]: () => {},
  [NodeType.HTTP_REQUEST]: () => {},
};

export const getExecutor = (nodeType: NodeType) => {
  const executor = executorRegistry[nodeType];

  if (!executor) {
    throw new Error(`Executor not found for node type: ${nodeType}`);
  }

  return executor;
};
