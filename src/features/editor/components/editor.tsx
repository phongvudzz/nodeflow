"use client";

import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";


interface EditorStateProps {
    message?: string;
}

export const EditorLoading = ({ message }: EditorStateProps) => {
    return <LoadingView message={message} />;
};

export const EditorError = ({ message }: EditorStateProps) => {
    return <ErrorView message={message} />;
}

export const Editor = ({ workflowId }: { workflowId: string }) => {
    const workflow = useSuspenseWorkflow(workflowId);

    return <div>{JSON.stringify(workflow, null, 2)}
    </div>
}