"use client";

import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { useState, useCallback } from "react"
import {
    ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, Controls, type Node,
    type Edge,
    type FitViewOptions,
    type OnConnect,
    type OnNodesChange,
    type OnEdgesChange,
    type OnNodeDrag,
    type DefaultEdgeOptions,
    MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';



interface EditorStateProps {
    message?: string;
}

export const EditorLoading = ({ message }: EditorStateProps) => {
    return <LoadingView message={message} />;
};

export const EditorError = ({ message }: EditorStateProps) => {
    return <ErrorView message={message} />;
}

const fitViewOptions: FitViewOptions = {
    padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: true,
};


export const Editor = ({ workflowId }: { workflowId: string }) => {
    const { data: workflow } = useSuspenseWorkflow(workflowId);
    const [nodes, setNodes] = useState(workflow.nodes);
    const [edges, setEdges] = useState(workflow.edges);

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes],
    );
    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges],
    );
    const onConnect: OnConnect = useCallback(
        (connection) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges],
    );

    return <div className="size-full">
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            fitViewOptions={fitViewOptions}
            defaultEdgeOptions={defaultEdgeOptions}
        >
            <Background />
            <Controls />
            <MiniMap />
        </ReactFlow>

    </div>
}