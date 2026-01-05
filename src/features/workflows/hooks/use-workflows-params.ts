import { useQueryStates } from "nuqs";
import { workflowsPrams } from "@/features/workflows/params";

export const useWorkflowParams = () => {
  return useQueryStates(workflowsPrams);
};
