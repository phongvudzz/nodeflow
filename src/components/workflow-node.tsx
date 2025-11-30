"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import { SettingsIcon, TrashIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./ui/button";

interface WorkflowNodeProps {
  children: ReactNode;
  showToolbar?: boolean;
  onDelete?: () => void;
  onSettings?: () => void;
  name?: string;
  description?: string;
}

export function WorkflowNode({
  children,
  showToolbar,
  onDelete,
  onSettings,
  name,
  description,
}: WorkflowNodeProps) {
  return (
    <>
      {showToolbar && (
        <NodeToolbar>
          <Button onClick={onSettings}>
            <SettingsIcon />
          </Button>
          <Button onClick={onDelete}>
            <TrashIcon />
          </Button>
        </NodeToolbar>
      )}
      {children}
      {name && (
        <NodeToolbar
          isVisible
          className="max-w-[200px] text-center"
          position={Position.Bottom}
        >
          <p className="font-medium">{name}</p>
          {description && (
            <p className="text-sm truncate text-muted-foreground">
              {description}
            </p>
          )}
        </NodeToolbar>
      )}
    </>
  );
}
