import * as React from "react";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Trash2, Plus, DownloadIcon, Send } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { XInputField } from "@/components/custom/XInputField";
import { XTextareaField } from "@/components/custom/XTextareaField";
import { XBreadcrumb } from "@/components/custom/XBreadcrumb";
import { toast } from "sonner";
import AxiousInstance from "@/helper/AxiousInstance";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import TaskShareModal from "@/modal/TaskShareModal";
import { useAuthStore } from "@/store/authStore";
import { useSocket } from "@/hooks/useSocket";


interface User {
    _id: string;
    name: string;
    avatar: string
}

interface Share {
    shareTo: User;
    sharedBy: User;
    permission: 'view' | 'edit';
    sharedAt: string;
}
interface Todo {
    _id?: string;
    taskId: string;
    status: "pending" | "processing" | "success" | "failed";
    title?: string;
    description?: string;
    label?: string;
    priority?: "low" | "medium" | "high";
    createdBy: {
        _id: string;
        name: string;
        avatar: string
    },
    share: Share[]
}


interface PaginationState {
    pageIndex: number;
    pageSize: number;
}

interface ApiResponse {
    tasks: Todo[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

// Form validation schema
const validationSchema = Yup.object({
    title: Yup.string()
        .max(100, "Title must be 100 characters or less")
        .required("Title is required"),
    description: Yup.string().max(500, "Description must be 500 characters or less"),
    label: Yup.string().max(50, "Label must be 50 characters or less").required("Label is required"),
    status: Yup.string()
        .oneOf(["pending", "processing", "success", "failed"], "Invalid status")
        .required("Status is required"),
    priority: Yup.string()
        .oneOf(["low", "medium", "high"], "Invalid priority")
        .required("Priority is required"),
});


export function Todo() {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [tableData, setTableData] = React.useState<Todo[]>([]);
    const [initialValues, setInitialValues] = React.useState<Todo | null>(null);
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const [isEdit, setIsEdit] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [titleFilter, setTitleFilter] = React.useState("");

    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [totalCount, setTotalCount] = React.useState(0);
    const [totalPages, setTotalPages] = React.useState(0);
    const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
    const [isShareModalOpen, setIsShareModalOpen] = React.useState<boolean>(false)
    const [users, setUsers] = React.useState<User[]>([])
    const { user } = useAuthStore()
    const { on, off } = useSocket()

    const formik = useFormik({
        initialValues: {
            title: initialValues?.title || "",
            description: initialValues?.description || "",
            label: initialValues?.label || "",
            status: initialValues?.status || "pending",
            priority: initialValues?.priority || "low",
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values: any) => {
            handleAddTask(values, isEdit);
        },
    });

    const getAllTask = async (pageIndex: number = pagination.pageIndex, pageSize: number = pagination.pageSize, titleFilter: string = "") => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: (pageIndex + 1).toString(), // Convert to 1-based indexing for backend
                limit: pageSize.toString(),
                ...(titleFilter && { search: titleFilter }),
            });

            const response = await AxiousInstance.get(`/task`, { params });

            if (response.status === 200) {
                const data: ApiResponse = response.data;
                setTableData(data.tasks || []);
                setTotalCount(data.totalCount || 0);
                setTotalPages(data.totalPages || 0);
            }
        } catch (error: any) {
            console.error("Fetch error:", error);
            toast.error(error.response?.data?.message || "Failed to fetch tasks");
            setTableData([]);
            setTotalCount(0);
            setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    };
    const getAllUsers = async () => {
        try {
            const response = await AxiousInstance.get(`/auth/user-lookup`);
            if (response.status === 200) {
                const data = response.data;
                setUsers(data.data?.filter((us: any) => us._id !== user?.id) || []);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to fetch tasks");
        }
    };

    const handleTaskShare = async (values: any, resetForm: any, onClose: any) => {
        try {
            const response = await AxiousInstance.patch(`/task`, { ...values, task: selectedRows, username: user?.name });
            if (response.status === 200) {
                const data = response.data;
                toast.success(data.message)
                resetForm()
                onClose()
                getAllTask(pagination.pageIndex, pagination.pageSize, titleFilter);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to fetch tasks");
        }

    }


    const addTask = async (task: Partial<Todo>) => {
        try {
            const response = await AxiousInstance.post('/task', task);
            if (response.status === 201) {
                toast.success(response.data.message || "Task added successfully");
                // Refresh the current page data
                await getAllTask(pagination.pageIndex, pagination.pageSize, titleFilter);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add task");
        }
    };

    const updateTask = async (task: Todo) => {
        try {
            const response = await AxiousInstance.put(`/task/${initialValues?._id}`, task);
            if (response.status === 200) {
                toast.success(response.data.message || "Task updated successfully");
                // Refresh the current page data
                await getAllTask(pagination.pageIndex, pagination.pageSize, titleFilter);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update task");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await AxiousInstance.delete(`/task/${id}`);
            if (response.status === 200) {
                toast.success(response.data.message || "Task deleted successfully");

                // Check if current page will be empty after deletion
                const remainingItems = tableData.length - 1;
                if (remainingItems === 0 && pagination.pageIndex > 0) {
                    // Go to previous page if current page becomes empty
                    const newPageIndex = pagination.pageIndex - 1;
                    setPagination(prev => ({ ...prev, pageIndex: newPageIndex }));
                    await getAllTask(newPageIndex, pagination.pageSize, titleFilter);
                } else {
                    // Refresh current page
                    await getAllTask(pagination.pageIndex, pagination.pageSize, titleFilter);
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete task");
        }
    };

    const handleDownload = async () => {
        try {
            const response = await AxiousInstance.get('/task/export/excel', {
                responseType: 'blob',
            });

            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tasks.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to download tasks');
        }
    };

    // Handle pagination changes
    const handlePaginationChange = React.useCallback((updatedPagination: PaginationState) => {
        setPagination(updatedPagination);
    }, []);

    // Handle filter changes with debounce
    const debouncedFilter = React.useRef<NodeJS.Timeout>(null);
    const handleFilterChange = (value: string) => {
        setTitleFilter(value);

        if (debouncedFilter.current) {
            clearTimeout(debouncedFilter.current);
        }

        debouncedFilter.current = setTimeout(() => {
            // Reset to first page when filtering
            const newPagination = { ...pagination, pageIndex: 0 };
            setPagination(newPagination);
            getAllTask(0, pagination.pageSize, value);
        }, 500);
    };
    console.log(user)
    const columns: ColumnDef<Todo>[] = [
        {
            id: "select",
            header: 'Task',
            cell: ({ row }) => {
                const task = row.original as any;
                const isDisabled = task?.share?.some(
                    (s: any) => s.shareTo?._id === user.id
                );

                return (
                    <Checkbox
                        checked={selectedRows.includes(row.original._id!)}
                        disabled={isDisabled}
                        onCheckedChange={(value) => handleRowSelect(row.original._id!, !!value)}
                        aria-label="Select row"
                        onClick={(e) => e.stopPropagation()}
                    />
                );
            },

        },
        {
            id: "index",
            header: "#",
            cell: ({ row }) => (
                <div className="text-sm">{row.index + 1}</div>
            ),
        },
        {
            accessorKey: "taskId",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Task ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }: { row: any }) => (
                <div className="font-medium text-primary"> {row.getValue("taskId")}</div>
            ),
        },

        {
            accessorKey: "label",
            header: "Label",
            cell: ({ row }) => (
                <Badge variant="outline" className="capitalize ">
                    {row.getValue("label")}
                </Badge>
            ),
        },
        {
            accessorKey: "title",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
        },

        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge
                    variant={
                        row.getValue("status") === "success"
                            ? "default"
                            : row.getValue("status") === "failed"
                                ? "destructive"
                                : "secondary"
                    }
                    className="capitalize"
                >
                    {row.getValue("status")}
                </Badge>
            ),
        },
        {
            accessorKey: "createdBy",
            header: "Maintainer",
            cell: ({ row }) => {
                const createdBy = row.original?.createdBy
                const share = row.original?.share ?? []
                const renderAvatar = (person: User) => (
                    <Avatar key={person?._id} className="h-11 w-11 border ">
                        <AvatarImage
                            src={
                                person?.avatar?.startsWith("https://")
                                    ? person?.avatar
                                    : import.meta.env.VITE_IMAGE_BASE_URL + person?.avatar
                            }
                            alt={person?.name}
                            title={person?.name}
                        />
                        <AvatarFallback className="border">
                            {person?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                )

                if (!share.length) {
                    return renderAvatar(createdBy)
                }

                return (
                    <div className="*:data-[slot=avatar]:ring-background flex -space-x-4 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]">
                        {renderAvatar(createdBy)}
                        {share.map((s) => renderAvatar(s?.shareTo))}
                    </div>
                )
            },
        },

        {
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }) => (
                <span
                    className={cn(
                        "capitalize",
                        row.getValue("priority") === "high" && "text-red-600",
                        row.getValue("priority") === "medium" && "text-yellow-600",
                        row.getValue("priority") === "low" && "text-green-600"
                    )}
                >
                    {row.getValue("priority")}
                </span>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const task = row.original as any;
                const isCreator = task?.createdBy?._id === user?.id;

                const hasEditPermission = row.original?.share?.some(
                    (item) => item?.shareTo?._id === user?.id && item?.permission === "edit"
                );

                console.log(isCreator, hasEditPermission, '::::: ', isCreator || hasEditPermission)
                return (
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={!(isCreator || hasEditPermission)}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(task._id);
                            }}
                            title="Delete"
                            className="text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    // Configure table with server-side pagination
    const table = useReactTable({
        data: tableData,
        columns,
        pageCount: totalPages, // Tell table how many pages exist
        state: {
            sorting,
            pagination,
        },
        onSortingChange: setSorting,
        onPaginationChange: handlePaginationChange as any,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
        manualFiltering: true,
    });

    const handleAddTask = (values: Todo, isEdit = false) => {
        if (isEdit && initialValues) {
            updateTask({ ...values, "taskId": initialValues.taskId });
        } else {
            addTask(values);
        }

        setInitialValues(null);
        setIsSheetOpen(false);
    };

    const handleRowClick = (task: Todo, columnId: string) => {
        if (columnId === "taskId") {
            setInitialValues(task);
            setIsSheetOpen(true);
            setIsEdit(true);
        }
    };

    // Pagination helpers for UI
    const pageIndex = pagination.pageIndex;
    const pageCount = totalPages;

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        const startPage = Math.max(0, pageIndex - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(pageCount - 1, startPage + maxPagesToShow - 1);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };


    React.useEffect(() => {
        getAllTask(pagination.pageIndex, pagination.pageSize, titleFilter);
    }, [pagination.pageIndex, pagination.pageSize]);


    React.useEffect(() => {
        getAllUsers()
        return () => {
            if (debouncedFilter.current) {
                clearTimeout(debouncedFilter.current);
            }
        };
    }, []);

    React.useEffect(() => {
        if (!on) return

        const handleTaskUpdate = ({ type }: any) => {
            if (type === "shareTask") {
                getAllTask(pagination.pageIndex, pagination.pageSize, titleFilter);
            }
        }
        on('task_update', handleTaskUpdate)
        return () => {
            off('task_update', handleTaskUpdate)
        }
    }, [on, off])

    const handleRowSelect = (id: string, checked: boolean) => {
        setSelectedRows(prev =>
            checked ? [...prev, id] : prev.filter(rowId => rowId !== id)
        );
    };

    return (
        <>
            <XBreadcrumb
                items={[
                    { label: "Dashboard", link: "/dashboard" },
                    { label: "Task", link: "/task" },
                ]}
            />
            <div className="p-2">
                <div className="mb-6 ">
                    <div className="flex  items-center justify-between gap-4 w-full sm:w-auto">
                        <div className="flex gap-4">
                            <Sheet open={isSheetOpen} onOpenChange={() => {
                                setIsSheetOpen(!isSheetOpen);
                                setInitialValues(null);
                                setIsEdit(false);
                                formik.resetForm();
                            }}>
                                <SheetTrigger asChild>
                                    <Button className="h-11 flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        <span className="hidden md:block"> New Task </span>
                                    </Button>

                                </SheetTrigger>
                                <SheetContent className="w-[90vw] sm:w-[400px] overflow-y-auto">
                                    <SheetHeader>
                                        <SheetTitle>{initialValues ? "Edit Task" : "New Task"}</SheetTitle>
                                        <SheetDescription>
                                            {initialValues
                                                ? "Update the task details below."
                                                : "Create a new task by filling out the details."}
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="mt-6">
                                        <form onSubmit={formik.handleSubmit} className="space-y-6 px-4">
                                            <div>
                                                <XInputField
                                                    id="title"
                                                    name="title"
                                                    label="Title"
                                                    type="text"
                                                    className="h-11"
                                                    placeholder="Task 123"
                                                    value={formik.values.title}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    error={formik.touched.title && formik.errors.title as string}
                                                />
                                            </div>
                                            <div>
                                                <XTextareaField
                                                    id="description"
                                                    name="description"
                                                    label="Description"
                                                    placeholder="Task description"
                                                    value={formik.values.description}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    error={formik.touched.description && formik.errors.description as string}
                                                />
                                            </div>
                                            <div>
                                                <XInputField
                                                    id="label"
                                                    name="label"
                                                    label="Label"
                                                    type="text"
                                                    className="h-11"
                                                    placeholder="Urgent"
                                                    value={formik.values.label}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    error={formik.touched.label && formik.errors.label as string}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="status" className="text-sm font-medium mb-1.5">
                                                    Status
                                                </Label>
                                                <Select
                                                    name="status"
                                                    value={formik.values.status}
                                                    onValueChange={(value) =>
                                                        formik.setFieldValue("status", value as Todo["status"])
                                                    }
                                                >
                                                    <SelectTrigger className={`${formik.touched.status && formik.errors.status ? 'border-red-500' : ''} w-full py-[21px]  `}>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="processing">Processing</SelectItem>
                                                        <SelectItem value="success">Success</SelectItem>
                                                        <SelectItem value="failed">Failed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {formik.touched.status && formik.errors.status && (
                                                    <p className="mt-1 text-sm text-destructive">{formik.errors.status as string}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="priority" className="text-sm font-medium mb-1.5">
                                                    Priority
                                                </Label>
                                                <Select
                                                    name="priority"
                                                    value={formik.values.priority}
                                                    onValueChange={(value) =>
                                                        formik.setFieldValue("priority", value as Todo["priority"])
                                                    }
                                                >
                                                    <SelectTrigger className={`${formik.touched.priority && formik.errors.priority ? 'border-red-500' : ''} w-full py-[21px]  `}>
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="low">Low</SelectItem>
                                                        <SelectItem value="medium">Medium</SelectItem>
                                                        <SelectItem value="high">High</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {formik.touched.priority && formik.errors.priority && (
                                                    <p className="mt-1 text-sm text-destructive">{formik.errors.priority as string}</p>
                                                )}
                                            </div>
                                            <Button type="submit" className="w-full">
                                                {isEdit ? "Update Task" : "Create Task"}
                                            </Button>
                                        </form>
                                    </div>
                                </SheetContent>
                            </Sheet>
                            <div className="relative inline-block">
                                <Button className="h-11 flex items-center gap-2" variant="outline" onClick={() => setIsShareModalOpen(true)} disabled={selectedRows.length === 0}>
                                    <Send className="h-4 w-4" />
                                    <span className="hidden md:block">Share Task</span>
                                </Button>

                                {selectedRows.length > 0 && (
                                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center rounded-full bg-primary text-white text-xs w-5 h-5  badge-pop">
                                        {selectedRows.length}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Input
                                placeholder="Filter by title..."
                                value={titleFilter}
                                onChange={(event) => handleFilterChange(event.target.value)}
                                className="w-full h-11 sm:max-w-sm"
                            />
                            <Button onClick={handleDownload} variant="outline" className="h-11 gap-2 ">
                                <DownloadIcon className="w-4 h-4" />
                                <span className="hidden md:block">  Export </span>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border max-h-[540px] overflow-y-auto scrollbar-hide ">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="px-4 py-3">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24">
                                        <div className="flex items-center justify-center h-full space-x-2">
                                            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                            <span className="text-muted-foreground">Loading tasks...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>

                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className="hover:bg-muted/50 transition-colors"
                                        onClick={(e) => {
                                            const cell = (e.target as HTMLElement).closest("td");
                                            if (cell) {
                                                const columnId = table.getAllColumns()[cell.cellIndex].id;
                                                const isCreator = row.original?.createdBy?._id === user?.id;

                                                const hasEditPermission = row.original?.share?.some(
                                                    (item) => item?.shareTo?._id === user?.id && item?.permission === "edit"
                                                );

                                                if (isCreator || hasEditPermission) {
                                                    handleRowClick(row.original, columnId);
                                                }
                                            }
                                        }}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="px-4 py-3">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                        No tasks found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Showing {Math.min((pageIndex * pagination.pageSize) + 1, totalCount)} to {Math.min((pageIndex + 1) * pagination.pageSize, totalCount)} of {totalCount} results
                        </span>
                        <Select
                            value={`${pagination.pageSize}`}
                            onValueChange={(value) => {
                                const newPageSize = Number(value);
                                setPagination(prev => ({
                                    ...prev,
                                    pageSize: newPageSize,
                                    pageIndex: 0 // Reset to first page
                                }));
                            }}
                        >
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 20, 30, 50, 100].map((size) => (
                                    <SelectItem key={size} value={`${size}`}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>



                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
                            disabled={pageIndex === 0 || isLoading}
                            className="h-8 w-8"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                            {pageCount > 0 && getPageNumbers().map((page) => (
                                <Button
                                    key={page}
                                    variant={page === pageIndex ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setPagination(prev => ({ ...prev, pageIndex: page }))}
                                    disabled={isLoading}
                                    className={cn(
                                        "h-8 w-8",
                                        page === pageIndex && "bg-primary text-primary-foreground"
                                    )}
                                >
                                    {page + 1}
                                </Button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
                            disabled={pageIndex >= pageCount - 1 || isLoading}
                            className="h-8 w-8"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
            <TaskShareModal
                isOpen={isShareModalOpen} onClose={() => { setIsShareModalOpen(false) }} users={users} handleShare={handleTaskShare}
            />
        </>
    );
}