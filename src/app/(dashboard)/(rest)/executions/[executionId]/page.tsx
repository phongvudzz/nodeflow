
import { Suspense } from "react";
import { HydrateClient } from "@/trpc/server";
import { requireAuth } from "@/lib/auth-utils";
import { ErrorBoundary } from "react-error-boundary";
import {
  ExecutionsError,
  ExecutionsLoading,
} from "@/features/executions/components/executions";
import { ExecutionView } from "@/features/executions/components/execution";

interface PageProps {
  params: {
    executionId: string;
  };
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();

  const { executionId } = params;

  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-3xl w-full flex flex-col gap-y-8 h-full">
        <HydrateClient>
          <ErrorBoundary fallback={<ExecutionsError />}>
            <Suspense fallback={<ExecutionsLoading />}>
              <ExecutionView executionId={executionId} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default Page;
