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
import { ArrowUpDown, ChevronLeft, ChevronRight, Trash2, Plus, DownloadIcon, ExternalLink, MapPin, Eye, Send } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { XBreadcrumb } from "@/components/custom/XBreadcrumb";
import { toast } from "sonner";
import AxiousInstance from "@/helper/AxiousInstance";
import LeadModal from "@/modal/LeadModal";
import LeadViewModal from "@/modal/LeadViewModal";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


interface Lead {
    _id?: string;
    title: string;
    address?: string;
    city: string;
    postalCode?: string;
    state: string;
    countryCode: string;
    website?: string;
    phone?: string;
    categories: string[];
    domain?: string;
    emails: string[];
    phones: string[];
    status: string;
    createdBy: {
        _id: string;
        name: string;
        avatar: string
    }
}

interface PaginationState {
    pageIndex: number;
    pageSize: number;
}

interface ApiResponse {
    leads: Lead[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

function Lead() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [tableData, setTableData] = useState<Lead[]>([]);
    const [initialValues, setInitialValues] = useState<Lead | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [titleFilter, setTitleFilter] = useState("");
    const [viewLead, setViewLead] = useState(null)
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageIndex = pagination.pageIndex;
    const pageCount = totalPages;


    const getAllLeads = async (pageIndex: number = pagination.pageIndex, pageSize: number = pagination.pageSize, titleFilter: string = "") => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: (pageIndex + 1).toString(),
                limit: pageSize.toString(),
                ...(titleFilter && { search: titleFilter }),
            });

            const response = await AxiousInstance.get(`/lead`, { params });

            if (response.status === 200) {
                const data: ApiResponse = response.data;
                console.log(data)
                setTableData(() => data.leads || []);
                setTotalCount(data.totalCount || 0);
                setTotalPages(data.totalPages || 0);
            }
        } catch (error: any) {
            console.error("Fetch error:", error);
            toast.error(error.response?.data?.message || "Failed to fetch leads");
            setTableData([]);
            setTotalCount(0);
            setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    };

    const addLead = async (lead: Partial<Lead>, resetForm: any, onClose: any) => {
        try {
            const response = await AxiousInstance.post('/lead', lead);
            if (response.status === 201) {
                resetForm()
                onClose()
                toast.success(response.data.message || "Lead added successfully");
                await getAllLeads(pagination.pageIndex, pagination.pageSize, titleFilter);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add lead");
        }
    };

    const updateLead = async (lead: Lead, resetForm: any, onClose: any) => {
        try {
            const response = await AxiousInstance.put(`/lead/${initialValues?._id}`, lead);
            if (response.status === 200) {
                resetForm()
                onClose()
                toast.success(response.data.message || "Lead updated successfully");
                await getAllLeads(pagination.pageIndex, pagination.pageSize, titleFilter);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update lead");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await AxiousInstance.delete(`/lead/${id}`);
            if (response.status === 200) {
                toast.success(response.data.message || "Lead deleted successfully");

                const remainingItems = tableData.length - 1;
                if (remainingItems === 0 && pagination.pageIndex > 0) {
                    const newPageIndex = pagination.pageIndex - 1;
                    setPagination(prev => ({ ...prev, pageIndex: newPageIndex }));
                    await getAllLeads(newPageIndex, pagination.pageSize, titleFilter);
                } else {
                    await getAllLeads(pagination.pageIndex, pagination.pageSize, titleFilter);
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete lead");
        }
    };

    const handleDownload = async () => {
        try {
            const response = await AxiousInstance.get('/lead/export/excel', {
                responseType: 'blob',
            });

            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'leads.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to download leads');
        }
    };

    const handlePaginationChange = useCallback((updatedPagination: PaginationState) => {
        setPagination(updatedPagination);
    }, []);

    const debouncedFilter = useRef<NodeJS.Timeout>(null);
    const handleFilterChange = (value: string) => {
        setTitleFilter(value);

        if (debouncedFilter.current) {
            clearTimeout(debouncedFilter.current);
        }

        debouncedFilter.current = setTimeout(() => {
            const newPagination = { ...pagination, pageIndex: 0 };
            setPagination(newPagination);
            getAllLeads(0, pagination.pageSize, value);
        }, 500);
    };

    const handleSelectAll = (checked: boolean) => {
        const currentPageIds = tableData.map(lead => lead._id!);

        if (checked) {
            // Add only rows from this page that are not already selected
            setSelectedRows(prev => [...new Set([...prev, ...currentPageIds])]);
        } else {
            // Remove only current page rows from selection
            setSelectedRows(prev => prev.filter(id => !currentPageIds.includes(id)));
        }
    };

    const handleRowSelect = (id: string, checked: boolean) => {
        setSelectedRows(prev =>
            checked ? [...prev, id] : prev.filter(rowId => rowId !== id)
        );
    };

    const handleRowClick = (lead: Lead, columnId: string) => {
        if (columnId === "title") {
            setInitialValues(lead);
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
        getAllLeads(pagination.pageIndex, pagination.pageSize, titleFilter);
    }, [pagination.pageIndex, pagination.pageSize]);

    useEffect(() => {
        return () => {
            if (debouncedFilter.current) {
                clearTimeout(debouncedFilter.current);
            }
        };
    }, []);

    const columns: ColumnDef<Lead>[] = [
        {
            id: "select",
            header: () => {
                const currentPageIds = tableData.map(lead => lead._id!);
                const allSelected = currentPageIds.every(id => selectedRows.includes(id));

                return (
                    <Checkbox
                        checked={allSelected}
                        onCheckedChange={(value) => handleSelectAll(!!value)}
                        aria-label="Select all"
                        title={'select all'}
                    />
                );
            },
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedRows.includes(row.original._id!)}
                    onCheckedChange={(value) => handleRowSelect(row.original._id!, !!value)}
                    aria-label="Select row"
                    onClick={(e) => e.stopPropagation()}
                />
            ),
        },
        {
            id: "index",
            header: "#",
            cell: ({ row }) => (
                <div className="text-sm">{row.index + 1}</div>
            ),
        },
        {
            accessorKey: "createdBy",
            header: "Creator",
            cell: ({ row }) => {
                return (<Avatar className="border h-11 w-11" >
                    <AvatarImage src={
                        row.original?.createdBy?.avatar?.startsWith('https://') ? row.original?.createdBy?.avatar : import.meta.env.VITE_IMAGE_BASE_URL + row.original?.createdBy?.avatar
                    } alt={row.original?.createdBy?.name} title={row.original?.createdBy?.name} />
                    <AvatarFallback className="border">

                        {row.original?.createdBy?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                </Avatar >)

            }
        },
        {
            accessorKey: "title",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Company Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">

                    <div>
                        <div
                            className=" max-w-[200px] font-medium text-primary cursor-pointer hover:underline truncate"
                            title={row.getValue("title")}
                        >
                            {row.getValue("title")}
                        </div>
                        {row.original.domain && (
                            <div className="text-xs text-muted-foreground">{row.original.domain}</div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                return (
                    <Badge variant='outline' className={`text-xs px-4 py-1.5 ${row.original.status === "sent" ? "text-green-500" : "text-yellow-500"} rounded-sm capitalize`}>
                        {row.original.status}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "location",
            header: "Location",
            cell: ({ row }) => (
                <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{row.original.city}, {row.original.state}</span>
                </div>
            ),
        },
        {
            accessorKey: "categories",
            header: "Categories",
            cell: ({ row }) => (
                <div className="max-w-[250px] flex flex-wrap gap-1">
                    {row.original.categories?.slice(0, 2).map((category, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                            {category}
                        </Badge>
                    ))}
                    {row.original.categories?.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                            +{row.original.categories.length - 2}
                        </Badge>
                    )}
                </div>
            ),
        },

        {
            accessorKey: "contact",
            header: "Contact",
            cell: ({ row }) => (
                <div className="space-y-1">
                    {row.original.phone && (
                        <div className="text-xs">{row.original.phone}</div>
                    )}
                    {row.original.emails?.length > 0 && (
                        <div className="text-xs text-muted-foreground">{row.original.emails[0]}</div>
                    )}
                    {row.original.website && (
                        <a
                            href={row.original.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-primary hover:underline"
                        >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Website
                        </a>
                    )}
                </div>
            ),
        },

        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const lead = row.original;
                return (
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(lead._id!);
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
                                setViewLead(lead as any)
                            }}
                            title="View"
                            className="text-gray-500"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        {/* setViewLead */}
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

    const handleSendMail = async () => {
        console.log(selectedRows)
    }

    return (
        <>
            <XBreadcrumb
                items={[
                    { label: "Dashboard", link: "/dashboard" },
                    { label: "Lead Automation", link: "/lead" },
                ]}
            />
            <div className="p-2">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-4 w-full sm:w-auto">
                        <div className="flex gap-4">
                            <Button onClick={() => setIsModalOpen(true)} className="h-11 flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                <span className="hidden md:block">Add Lead</span>
                            </Button>
                            <div className="relative inline-block">
                                <Button className="h-11 flex items-center gap-2" variant="outline" onClick={handleSendMail} disabled={selectedRows.length === 0}>
                                    <Send className="h-4 w-4" />
                                    <span className="hidden md:block">Send Mail</span>
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
                                placeholder="Filter by company name..."
                                value={titleFilter}
                                onChange={(event) => handleFilterChange(event.target.value)}
                                className="w-full h-11 sm:max-w-sm"
                            />
                            <Button onClick={handleDownload} variant="outline" className="h-11 gap-2">
                                <DownloadIcon className="w-4 h-4" />
                                <span className="hidden md:block">Export</span>
                            </Button>
                        </div>
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
                                            <span className="text-muted-foreground">Loading leads...</span>
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
                                        No leads found.
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
                                    pageIndex: 0
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


            <LeadModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setInitialValues(null) }}
                initialValues={initialValues}
                handleAdd={addLead}
                handleEdit={updateLead as any}
            />

            <LeadViewModal
                isOpen={!!viewLead}
                lead={viewLead}
                onClose={() => setViewLead(null)}
            />
        </>
    );
}


export default Lead