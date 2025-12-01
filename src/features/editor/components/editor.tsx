"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  type DefaultEdgeOptions,
  type FitViewOptions,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  Panel,
} from "@xyflow/react";

import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";

import "@xyflow/react/dist/style.css";
import { nodeComponents } from "@/config/node-components";
import { AddNodeButton } from "../add-node-button";
import { useSetAtom } from "jotai";
import { editorAtom } from "../store/atoms";

interface EditorStateProps {
  message?: string;
}

export const EditorLoading = ({ message }: EditorStateProps) => {
  return <LoadingView message={message} />;
};

export const EditorError = ({ message }: EditorStateProps) => {
  return <ErrorView message={message} />;
};

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);

  const setEditor = useSetAtom(editorAtom);
  const [nodes, setNodes] = useState(workflow.nodes);
  const [edges, setEdges] = useState(workflow.edges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setEditor}
        fitViewOptions={fitViewOptions}
        defaultEdgeOptions={defaultEdgeOptions}
        nodeTypes={nodeComponents}
        fitView
        snapToGrid
        panOnScroll
        selectionOnDrag
        panOnDrag={false}
        snapGrid={[10, 10]}
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right">
          <AddNodeButton />
        </Panel>
      </ReactFlow>
    </div>
  );
};
