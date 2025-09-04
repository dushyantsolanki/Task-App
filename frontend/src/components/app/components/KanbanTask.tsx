import {
    KanbanBoard,
    KanbanCard,
    KanbanCards,
    KanbanHeader,
    KanbanProvider,
} from "@/components/ui/kibo-ui/kanban";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AxiousInstance from "@/helper/AxiousInstance";
import { AvatarStack } from "@/components/ui/kibo-ui/avatar-stack";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket";
import { useAuthStore } from "@/store/authStore";

const columns = [
    { id: "pending", name: "Pending", color: "var(--chart-1)" },
    { id: "processing", name: "Processing", color: "var(--chart-3)" },
    { id: "success", name: "Success", color: "var(--chart-2)" },
    { id: "failed", name: "Failed", color: "var(--chart-5)" },
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
});

const KanbanTask = ({ titleFilter }: { titleFilter: string }) => {
    const { on, off } = useSocket();
    const { user } = useAuthStore();
    const [features, setFeatures] = useState<any[]>([]);

    const getAllTask = async () => {
        try {
            const response = await AxiousInstance.get(`/task/kanban-view`, {
                params: { search: titleFilter },
            });
            if (response.status === 200) {
                const data = response.data;
                setFeatures(
                    data?.tasks?.map((task: any) => ({
                        id: task._id,
                        taskId: task?.id,
                        name: task.name,
                        startDate: new Date(task.startDate),
                        endDate: new Date(task.endDate),
                        column: task.column.toLowerCase(),
                        owner: task.owner,
                        createdBy: task.createdBy, // Store createdBy for permission check
                    }))
                );
            }
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to fetch tasks");
        }
    };

    // Check if the current user has edit permission for a specific task
    const hasEditPermission = (task: any) => {
        if (!user?.id) return false;

        // Check if the user is the creator
        const isCreator = task.createdBy === user.id;

        // Check if the user is in the owner array with "edit" permission
        const hasEdit = task.owner?.some(
            (owner: any) => owner.id === user.id && owner.permission === "edit"
        );

        return isCreator || hasEdit;
    };

    const handleStatusUpdate = async (event: any) => {
        const taskId = event?.active?.id;
        const newStatus = event?.over?.id;
        if (newStatus?.length === 24) {
            return
        }

        // Find the task being updated
        const task = features.find((f) => f.id === taskId);

        if (!task) {
            toast.error("Task not found");
            return;
        }

        // Check edit permission
        if (!hasEditPermission(task)) {
            getAllTask()
            toast.error("You do not have edit permission for this task");
            return;
        }

        try {
            const response = await AxiousInstance.patch(`/task/kanban-view/${taskId}`, {
                status: newStatus,
            });
            if (response.status === 200) {
                toast.success(response.data.message);
                getAllTask();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to update task status");
        }
    };

    useEffect(() => {
        getAllTask();
    }, [titleFilter]);

    useEffect(() => {
        if (!on) return;

        const handleTaskUpdate = ({ type }: any) => {
            if (type === "shareTask") {
                getAllTask();
            }
        };
        on("task_update", handleTaskUpdate);
        return () => {
            off("task_update", handleTaskUpdate);
        };
    }, [on, off]);

    return (
        <KanbanProvider
            columns={columns}
            data={features}
            onDragEnd={handleStatusUpdate}
            className="h-[calc(100vh-32vh)]"
        >
            {(column) => (
                <KanbanBoard id={column.id} key={column.id} className="bg-secondary/20">
                    <KanbanHeader>
                        <div className="flex items-center gap-2">
                            <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: column.color }}
                            />
                            <span>{column.name}</span>
                        </div>
                    </KanbanHeader>
                    <KanbanCards id={column.id}>
                        {(feature: (typeof features)[number]) => (
                            <KanbanCard
                                column={column.id}
                                id={feature.id}
                                key={feature.id}
                                name={feature.name}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex flex-col gap-1">
                                        <p className="m-0 flex-1 font-medium text-sm capitalize">{feature.name}</p>
                                        <p className="m-0 flex-1 font-medium text-sm capitalize">{feature.taskId}</p>
                                    </div>
                                    {feature.owner?.length > 0 && (
                                        <AvatarStack animate>
                                            {feature.owner.map((user: any) => (
                                                <Avatar key={user.id} className="border">
                                                    <AvatarImage
                                                        src={
                                                            user?.avatar?.startsWith("https://")
                                                                ? user?.avatar
                                                                : import.meta.env.VITE_IMAGE_BASE_URL + user?.avatar
                                                        }
                                                        alt={user.name}
                                                    />
                                                    <AvatarFallback>{user.name}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                        </AvatarStack>
                                    )}
                                </div>
                                <p className="m-0 text-muted-foreground text-xs">
                                    {shortDateFormatter.format(feature.startDate)} -{" "}
                                    {dateFormatter.format(feature.endDate)}
                                </p>
                            </KanbanCard>
                        )}
                    </KanbanCards>
                </KanbanBoard>
            )}
        </KanbanProvider>
    );
};

export default KanbanTask;