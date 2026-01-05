"use client";
import { formatDistanceToNow } from "date-fns";
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import type { Execution } from "@/generated/prisma/client";
import { useSuspenseExecutions } from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";
import {
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import { ExecutionStatus } from "@/generated/prisma/enums";

export const ExecutionsList = () => {
  const { data: executions } = useSuspenseExecutions();

  return (
    <EntityList
      items={executions.items}
      getKey={(execution) => execution.id}
      renderItem={(execution) => <ExecutionItem execution={execution} />}
      emptyView={<ExecutionsEmpty />}
    />
  );
};

export const ExecutionsHeader = () => {
  return (
    <EntityHeader
      title="Executions"
      description="View your workflow execution history"
    />
  );
};

export const ExecutionsPagination = () => {
  const executions = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();

  return (
    <EntityPagination
      disabled={executions.isFetching}
      page={executions.data.page}
      totalPages={executions.data.totalPages}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<ExecutionsHeader />}
      pagination={<ExecutionsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const ExecutionsLoading = () => {
  return <LoadingView message="Loading executions..." />;
};

export const ExecutionsError = () => {
  return <ErrorView message="Failed to load executions." />;
};

export const ExecutionsEmpty = () => {
  return (
    <EmptyView message="You haven't created any executions yet. Get started by running your first workflow." />
  );
};

const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.COMPLETED:
      return <CheckCircle2Icon className="size-5 text-green-500" />;
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-500" />;
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-5 text-blue-500 animate-spin" />;
    default:
      return <ClockIcon className="size-5 text-muted-foreground" />;
  }
};

const formatStatus = (status: ExecutionStatus) => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

export const ExecutionItem = ({
  execution,
}: {
  execution: Execution & { workflow: { id: string; name: string } | null };
}) => {
  const duration = execution.completedAt
    ? Math.round(
        (execution.completedAt.getTime() - execution.startedAt.getTime()) / 1000
      )
    : null;

  const subtitle = (
    <>
      {execution.workflow?.name || "Unknown workflow"} &bull; Started{" "}
      {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
      {duration !== null && <> &bull; Took {duration} seconds</>}
    </>
  );

  return (
    <EntityItem
      href={`/executions/${execution.id}`}
      title={formatStatus(execution.status)}
      subtitle={subtitle}
      image={
        <div className="size-8 flex items-center justify-center">
          {getStatusIcon(execution.status)}
        </div>
      }
    />
  );
};
