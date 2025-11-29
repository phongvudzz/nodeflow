import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SaveIcon } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { useEffect, useState, useRef, KeyboardEvent } from "react"
import Link from "next/link";
import { useSuspenseWorkflow, useUpdateWorkflowName } from "@/features/workflows/hooks/use-workflows";

export const EditorSaveButton = ({ workflowId }: { workflowId: string }) => {
    return <div className="ml-auto">
        <Button size="sm" onClick={() => { }} disabled={false}>
            <SaveIcon className="size-4" />
            Save</Button>
    </div>
}


export const EditorNameInput = ({ workflowId }: { workflowId: string }) => {
    const { data: workflow } = useSuspenseWorkflow(workflowId)
    const updateWorkflow = useUpdateWorkflowName()

    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState(workflow.name)

    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (workflow.name) {
            setName(workflow.name)
        }
    }, [workflow.name])

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isEditing])

    const handleSave = async () => {
        if (name === workflow.name) {
            setIsEditing(false)
            return
        }
        try {
            await updateWorkflow.mutateAsync({ id: workflowId, name })
        } catch (error) {
            setName(workflow.name)
            console.error(error)
        } finally {
            setIsEditing(false)
        }
    }


    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSave()
        } else if (e.key === "Escape") {
            setIsEditing(false)
        }
    }

    if (isEditing) {
        return (
            <Input
                disabled={updateWorkflow.isPending}
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-7 w-auto min-w-[100px] px-2"
            />
        )
    }

    return <BreadcrumbItem onClick={() => setIsEditing(true)} className="cursor-pointer hover:text-foreground transition-colors">
        {workflow.name}
    </BreadcrumbItem>
}


export const EditorBreadcrumsbs = ({ workflowId }: { workflowId: string }) => {
    return <Breadcrumb>
        <BreadcrumbList>
            <BreadcrumbItem>
                <BreadcrumbLink asChild>
                    <Link href="/workflows" prefetch>
                        Workflows
                    </Link>
                </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
        </BreadcrumbList>
    </Breadcrumb>
}

export const EditorHeader = ({ workflowId }: { workflowId: string }) => {
    return (
        <header className="flex h-14 shrink-0 gap-2 border-b bg-background items-center px-4">
            <SidebarTrigger />
            <div className="flex flex-row items-center justify-between gap-x-4 w-full">
                <EditorBreadcrumsbs workflowId={workflowId} />
                <EditorSaveButton workflowId={workflowId} />
            </div>
        </header>
    );
};
