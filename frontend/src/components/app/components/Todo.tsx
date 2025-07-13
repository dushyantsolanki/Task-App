import * as React from "react";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Trash2, Share2, Plus, DownloadIcon } from "lucide-react";
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

// Define interfaces
interface Payment {
    _id?: string;
    status: "pending" | "processing" | "success" | "failed";
    title?: string;
    description?: string;
    label?: string;
    priority?: "low" | "medium" | "high";
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
    const [tableData, setTableData] = React.useState<Payment[]>([]);
    const [initialValues, setInitialValues] = React.useState<Payment | null>(null);
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);

    const [isEdit, setIsEdit] = React.useState(false);

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
        onSubmit: (values) => {
            handleAddTask(values, isEdit);
        },
    });


    const getAllTask = async () => {
        try {
            const response = await AxiousInstance.get('/task')
            if (response.status === 200) {
                setTableData(response.data.tasks || []);

            }
        } catch (error: any) {
            toast.error(error.response.data.message || "Failed to fetch tasks");
        }
    }

    const addTask = async (task: Partial<Payment>) => {
        try {
            const response = await AxiousInstance.post('/task', task);
            if (response.status === 201) {
                setTableData((prev) => [...prev, response.data.task]);
                toast.success(response.data.message || "Task added successfully");
            }
        } catch (error: any) {
            toast.error(error.response.data.message || "Failed to add task");
        }
    };
    const updateTask = async (task: Payment) => {
        try {
            const response = await AxiousInstance.put(`/task/${task._id}`, task);
            if (response.status === 200) {
                setTableData((prev) =>
                    prev.map((item) => (item._id === task._id ? { ...item, ...task } : item))
                );
                toast.success(response.data.message || "Task updated successfully");
            }
        } catch (error: any) {
            toast.error(error.response.data.message || "Failed to update task");
        }
    };
    const handleDelete = async (id: string) => {
        try {
            const response = await AxiousInstance.delete(`/task/${id}`);
            if (response.status === 200) {
                setTableData((prev) => prev.filter((item) => item._id !== id));
                toast.success(response.data.message || "Task deleted successfully");
            }
        } catch (error: any) {
            toast.error(error.response.data.message || "Failed to delete task");
        }
    };

    const handleDownload = async () => {
        try {
            const response = await AxiousInstance.get('/task/export/excel', {
                responseType: 'blob', // 👈 this is CRUCIAL
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

    // Define columns
    const columns: ColumnDef<Payment>[] = [
        {
            accessorKey: "_id",
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
                <div className="font-medium text-primary">Task {row.getValue("_id").slice(-5)}</div>
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
                return (
                    <div className="flex items-center space-x-2">

                        <Button
                            variant="ghost"
                            size="icon"
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


    const table = useReactTable({
        data: tableData,
        columns,
        onSortingChange: setSorting,

        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
        },
    });

    const handleAddTask = (values: Payment, isEdit = false) => {
        if (isEdit && initialValues) {

            updateTask({ ...values, "_id": initialValues._id });
        } else {
            addTask(values)
        }

        setInitialValues(null);
        setIsSheetOpen(false);
    };


    const handleRowClick = (task: Payment, columnId: string) => {
        if (columnId === "_id" || columnId === "title") {
            setInitialValues(task);
            setIsSheetOpen(true);
            setIsEdit(true);
        }
    };

    // Pagination helpers
    const pageIndex = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();

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
        getAllTask()
    }, []);

    return (
        <>   <XBreadcrumb
            items={[
                { label: "Dashboard", link: "/dashboard" },
                { label: "Todo", link: "/todo" },
            ]}
        />
            <div className="p-2">

                <div className="mb-6 ">
                    <div className="flex  items-center justify-between gap-4 w-full sm:w-auto">

                        <Sheet open={isSheetOpen} onOpenChange={() => { setIsSheetOpen(!isSheetOpen); setInitialValues(null); setIsEdit(false); formik.resetForm(); }}>
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
                                                error={formik.touched.title && formik.errors.title}
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
                                                error={formik.touched.description && formik.errors.description}
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
                                                error={formik.touched.label && formik.errors.label}
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
                                                    formik.setFieldValue("status", value as Payment["status"])
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
                                                <p className="mt-1 text-sm text-destructive">{formik.errors.status}</p>
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
                                                    formik.setFieldValue("priority", value as Payment["priority"])
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
                                                <p className="mt-1 text-sm text-destructive">{formik.errors.priority}</p>
                                            )}
                                        </div>
                                        <Button type="submit" className="w-full">
                                            {isEdit ? "Update Task" : "Create Task"}
                                        </Button>
                                    </form>
                                </div>
                            </SheetContent>
                        </Sheet>
                        <div className="flex items-center gap-2 w-full sm:w-auto">

                            <Input
                                placeholder="Filter by title..."
                                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn("title")?.setFilterValue(event.target.value)
                                }
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
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className="hover:bg-muted/50 transition-colors"
                                        onClick={(e) => {
                                            const cell = (e.target as HTMLElement).closest("td");
                                            if (cell) {
                                                const columnId = table.getAllColumns()[cell.cellIndex].id;
                                                handleRowClick(row.original, columnId);
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
                        <span className="text-sm text-muted-foreground">Rows per page:</span>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => table.setPageSize(Number(value))}
                        >
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 20, 30, 70, 100, 200].map((size) => (
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
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="h-8 w-8"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((page) => (
                                <Button
                                    key={page}
                                    variant={page === pageIndex ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => table.setPageIndex(page)}
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
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="h-8 w-8"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}