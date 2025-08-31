import { useState, useRef, useEffect, useCallback } from "react";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Trash2, Plus, Eye } from "lucide-react";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { XBreadcrumb } from "@/components/custom/XBreadcrumb";
import { toast } from "sonner";
import AxiousInstance from "@/helper/AxiousInstance";
import { cn } from "@/lib/utils";
import TemplateModal from "@/modal/TemplateModal";
import TemplateViewModal from "@/modal/TemplateViewModal";

interface Template {
    _id?: string;
    name: string;
    subject: string;
    body: string;
    createdBy: {
        _id: string;
        avatar: string;
        name: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

interface PaginationState {
    pageIndex: number;
    pageSize: number;
}

interface ApiResponse {
    templates: Template[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

function Template() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [tableData, setTableData] = useState<Template[]>([]);
    const [initialValues, setInitialValues] = useState<Template | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [nameFilter, setNameFilter] = useState("");
    // const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [viewTemplate, setViewTemplate] = useState<Template | null>(null)
    const pageIndex = pagination.pageIndex;
    const pageCount = totalPages;

    const getAllTemplates = async (
        pageIndex: number = pagination.pageIndex,
        pageSize: number = pagination.pageSize,
        nameFilter: string = ""
    ) => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: (pageIndex + 1).toString(),
                limit: pageSize.toString(),
                ...(nameFilter && { search: nameFilter }),
            });

            const response = await AxiousInstance.get(`/template`, { params });

            if (response.status === 200) {
                const data: ApiResponse = response.data;
                setTableData(() => data.templates || []);
                setTotalCount(data.totalCount || 0);
                setTotalPages(data.totalPages || 0);
            }
        } catch (error: any) {
            console.error("Fetch error:", error);
            toast.error(error.response?.data?.message || "Failed to fetch templates");
            setTableData([]);
            setTotalCount(0);
            setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    };

    const addTemplate = async (template: Partial<Template>, resetForm: any, onClose: any) => {
        try {
            const response = await AxiousInstance.post('/template', template);
            if (response.status === 201) {
                resetForm()
                onClose()
                toast.success(response.data.message || "Template added successfully");
                await getAllTemplates(pagination.pageIndex, pagination.pageSize, nameFilter);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add template");
        }
    };

    const updateTemplate = async (template: Template, resetForm: any, onClose: any) => {
        try {
            const response = await AxiousInstance.put(`/template/${initialValues?._id}`, template);
            if (response.status === 200) {
                resetForm()
                onClose()
                toast.success(response.data.message || "Template updated successfully");
                await getAllTemplates(pagination.pageIndex, pagination.pageSize, nameFilter);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update template");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await AxiousInstance.delete(`/template/${id}`);
            if (response.status === 200) {
                toast.success(response.data.message || "Template deleted successfully");
                const remainingItems = tableData.length - 1;
                if (remainingItems === 0 && pagination.pageIndex > 0) {
                    const newPageIndex = pagination.pageIndex - 1;
                    setPagination(prev => ({ ...prev, pageIndex: newPageIndex }));
                    await getAllTemplates(newPageIndex, pagination.pageSize, nameFilter);
                } else {
                    await getAllTemplates(pagination.pageIndex, pagination.pageSize, nameFilter);
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete template");
        }
    };

    const handlePaginationChange = useCallback((updatedPagination: PaginationState) => {
        setPagination(updatedPagination);
    }, []);

    const debouncedFilter = useRef<NodeJS.Timeout>(null);
    const handleFilterChange = (value: string) => {
        setNameFilter(value);
        if (debouncedFilter.current) {
            clearTimeout(debouncedFilter.current);
        }
        debouncedFilter.current = setTimeout(() => {
            const newPagination = { ...pagination, pageIndex: 0 };
            setPagination(newPagination);
            getAllTemplates(0, pagination.pageSize, value);
        }, 500);
    };

    // const handleSelectAll = (checked: boolean) => {
    //     const currentPageIds = tableData.map(template => template._id!);
    //     if (checked) {
    //         setSelectedRows(prev => [...new Set([...prev, ...currentPageIds])]);
    //     } else {
    //         setSelectedRows(prev => prev.filter(id => !currentPageIds.includes(id)));
    //     }
    // };

    // const handleRowSelect = (id: string, checked: boolean) => {
    //     setSelectedRows(prev =>
    //         checked ? [...prev, id] : prev.filter(rowId => rowId !== id)
    //     );
    // };

    const handleRowClick = (template: Template, columnId: string) => {
        if (columnId === "name") {
            setInitialValues(template);
            setIsModalOpen(true);
        }
    };

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

    useEffect(() => {
        getAllTemplates(pagination.pageIndex, pagination.pageSize, nameFilter);
    }, [pagination.pageIndex, pagination.pageSize]);

    useEffect(() => {
        return () => {
            if (debouncedFilter.current) {
                clearTimeout(debouncedFilter.current);
            }
        };
    }, []);

    const columns: ColumnDef<Template>[] = [
        // {
        //     id: "select",
        //     header: () => {
        //         const currentPageIds = tableData.map(template => template._id!);
        //         const allSelected = currentPageIds.every(id => selectedRows.includes(id));
        //         return (
        //             <Checkbox
        //                 checked={allSelected}
        //                 onCheckedChange={(value) => handleSelectAll(!!value)}
        //                 aria-label="Select all"
        //                 title="select all"
        //             />
        //         );
        //     },
        //     cell: ({ row }) => (
        //         <Checkbox
        //             checked={selectedRows.includes(row.original._id!)}
        //             onCheckedChange={(value) => handleRowSelect(row.original._id!, !!value)}
        //             aria-label="Select row"
        //             onClick={(e) => e.stopPropagation()}
        //         />
        //     ),
        // },
        {
            id: "index",
            header: "#",
            cell: ({ row }) => (
                <div className="text-sm">{row.index + 1}</div>
            ),
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Template Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="max-w-[200px] font-medium text-primary cursor-pointer hover:underline truncate" title={row.getValue("name")}>
                    {row.getValue("name")}
                </div>
            ),
        },
        {
            accessorKey: "subject",
            header: "Subject",
            cell: ({ row }) => (
                <div className="text-sm max-w-[250px] truncate" title={row.getValue("subject")}>
                    {row.getValue("subject")}
                </div>
            ),
        },
        {
            accessorKey: "body",
            header: "Body Preview",
            cell: ({ row }) => (
                <div className="text-sm max-w-[300px] truncate" title={row.getValue("body")}>
                    {row.getValue("body")}
                </div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Created At",
            cell: ({ row }) => (
                <div className="text-sm">
                    {new Date(row.getValue("createdAt")).toLocaleDateString()}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const template = row.original;
                return (
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(template._id!);
                            }}
                            title="Delete"
                            className="text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                setViewTemplate(template);

                            }}
                            title="View/Edit"
                            className="text-gray-500"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: tableData,
        columns,
        pageCount: totalPages,
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

    return (
        <>
            <XBreadcrumb
                items={[
                    { label: "Dashboard", link: "/dashboard" },
                    { label: "Templates", link: "/templates" },
                ]}
            />
            <div className="p-2">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-4 w-full sm:w-auto">
                        <Button
                            onClick={() => {
                                setInitialValues(null);
                                setIsModalOpen(true);
                            }}
                            className="h-11 flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden md:block">Add Template</span>
                        </Button>
                        <Input
                            placeholder="Filter by template name..."
                            value={nameFilter}
                            onChange={(event) => handleFilterChange(event.target.value)}
                            className="w-full h-11 sm:max-w-sm"
                        />
                    </div>
                </div>

                <div className="rounded-lg border max-h-[540px] overflow-y-auto scrollbar-hide">
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
                                            <span className="text-muted-foreground">Loading templates...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className="hover:bg-muted/50 transition-colors cursor-pointer"
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
                                        No templates found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Showing {Math.min((pageIndex * pagination.pageSize) + 1, totalCount)} to{" "}
                            {Math.min((pageIndex + 1) * pagination.pageSize, totalCount)} of {totalCount} results
                        </span>
                        <Select
                            value={`${pagination.pageSize}`}
                            onValueChange={(value) => {
                                const newPageSize = Number(value);
                                setPagination(prev => ({
                                    ...prev,
                                    pageSize: newPageSize,
                                    pageIndex: 0,
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
                            {pageCount > 0 &&
                                getPageNumbers().map((page) => (
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

            <TemplateModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false), setInitialValues(null) }}
                initialValues={initialValues}
                handleAdd={addTemplate}
                handleEdit={updateTemplate as any}
            />

            <TemplateViewModal
                isOpen={!!viewTemplate}
                onClose={() => setViewTemplate(null)}
                template={viewTemplate}
            />
        </>
    );
}

export default Template;