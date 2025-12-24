"use client";

import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { GoogleFormTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { fetchGoogleFormTriggerRealtimeToken } from "./action";
import { GOOGLE_FORM_CHANNEL_NAME } from "@/inngest/channel/google-form-trigger";

export const GoogleFormTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GOOGLE_FORM_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGoogleFormTriggerRealtimeToken,
  });

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <GoogleFormTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon="/logos/googleform.svg"
        name="Google Form"
        description="When form is submitted"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});
