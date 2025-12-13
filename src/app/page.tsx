"use client";
import { useTRPC } from "@/trpc/client";
import { LogoutButton } from "./logout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function Page() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());

  const create = useMutation(
    trpc.createWorkflow.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.getWorkflows.queryOptions());
      },
    })
  );

  const testAI = useMutation(
    trpc.testAi.mutationOptions({
      onSuccess: () => {
        toast.success("Test AI success");
      },
    })
  );

  return (
    <div className="flex flex-col gap-4 size-full bg-black text-red-500 items-center justify-center h-screen">
      protected server component
      <LogoutButton />
      <Button onClick={() => create.mutate()} disabled={create.isPending}>
        Create Workflow
      </Button>
      <Button onClick={() => testAI.mutate()} disabled={testAI.isPending}>
        Test AI
      </Button>
      <div>{JSON.stringify(data, null, 2)}</div>
    </div>
  );
}

export default Page;
