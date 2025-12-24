"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "@/features/executions/base-execution-node";
import { HttpRequestNodeDialog, HttpRequestFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { HTTP_REQUEST_CHANNEL_NAME } from "@/inngest/channel/http-request";
import { fetchHttpRequestRealtimeToken } from "./action";

type HttpRequestNodeData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeData = props.data;
  const description = nodeData?.endpoint
    ? `${nodeData.method || "GET"} : ${nodeData.endpoint}`
    : "Not configured";

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: HTTP_REQUEST_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchHttpRequestRealtimeToken,
  });

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (values: HttpRequestFormValues) => {
    setNodes((nodes) => {
      return nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      });
    });
    setDialogOpen(false);
  };

  return (
    <>
      <HttpRequestNodeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        name="HTTP Request"
        icon={GlobeIcon}
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

HttpRequestNode.displayName = "HttpRequestNode";
