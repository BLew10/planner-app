"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { ChevronDown, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DataTableProps<TData> {
  isLoading: boolean;
  columns: ColumnDef<TData, any>[];
  data: TData[];
  title?: string;
  filterOptions?: { value: string; label: string }[];
  defaultFilterValue?: string;
  secondFilterOptions?: { value: string; label: string }[];
  defaultSecondFilterValue?: string;
  filterPlaceholder?: string;
  secondFilterPlaceholder?: string;
  onFilterChange?: (value: string) => void;
  onSecondFilterChange?: (value: string) => void;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onAdd?: () => void;
  addButtonLabel?: string;
  selectedRows?: string[];
  onSelectedRowsChange?: (rows: string[]) => void;
  onDeleteSelected?: () => void;
  itemsPerPage?: number;
  totalItems?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: TData) => void;
  searchDebounceMs?: number;
  searchQuery?: string;
  noPagination?: boolean;
  onDeleteRow?: (row: TData) => void;
}

export function DataTable<TData extends { id?: string }>({
  isLoading,
  columns,
  data,
  title = "Data",
  filterOptions,
  secondFilterOptions,
  defaultFilterValue,
  defaultSecondFilterValue,
  filterPlaceholder = "Filter...",
  secondFilterPlaceholder = "Filter...",
  onFilterChange,
  onSecondFilterChange,
  searchPlaceholder = "Search...",
  onSearch,
  onAdd,
  addButtonLabel = "Add New",
  selectedRows = [],
  onSelectedRowsChange,
  onDeleteSelected,
  itemsPerPage = 10,
  totalItems = 0,
  currentPage = 1,
  onPageChange,
  onRowClick,
  searchDebounceMs = 500,
  searchQuery: externalSearchQuery,
  noPagination = false,
  onDeleteRow,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [internalSearchQuery, setInternalSearchQuery] = React.useState("");
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deleteMode, setDeleteMode] = React.useState<'single' | 'multiple'>('single');
  const [rowToDelete, setRowToDelete] = React.useState<TData | null>(null);

  // Sync internal search state with external search query if provided
  React.useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setInternalSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // Reset row selection when data changes
  React.useEffect(() => {
    setRowSelection({});
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: noPagination
        ? undefined
        : {
            pageIndex: currentPage - 1,
            pageSize: itemsPerPage,
          },
    },
    pageCount: Math.ceil(totalItems / itemsPerPage),
    manualPagination: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const totalPages = noPagination ? 1 : Math.ceil(totalItems / itemsPerPage);

  // Handle debounced search
  const handleSearchChange = (value: string) => {
    setInternalSearchQuery(value);
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      onSearch?.(value);
    }, searchDebounceMs);
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Reset search
  const handleReset = () => {
    setInternalSearchQuery("");
    onSearch?.("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(internalSearchQuery);
  };

  const handleDeleteClick = (mode: 'single' | 'multiple', row?: TData) => {
    setDeleteMode(mode);
    if (mode === 'single' && row) {
      setRowToDelete(row);
    }
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (deleteMode === 'single' && rowToDelete && onDeleteRow) {
      onDeleteRow(rowToDelete);
    } else if (deleteMode === 'multiple' && onDeleteSelected) {
      onDeleteSelected();
    }
    setShowDeleteDialog(false);
    setRowToDelete(null);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold mb-4">
              {title}
              <p className="text-sm text-muted-foreground font-normal">
                {totalItems} items
              </p>
            </CardTitle>
            {onAdd && (
              <Button onClick={onAdd} className="ml-auto">
                <Plus className="mr-2 h-4 w-4" />
                {addButtonLabel}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-sm">
                <Input
                  placeholder={searchPlaceholder}
                  value={externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pr-8"
                />
                {(externalSearchQuery || internalSearchQuery) && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={handleReset}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button type="submit">Search</Button>
            </form>
            {filterOptions && (
              <Select onValueChange={onFilterChange} defaultValue={defaultFilterValue}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={filterPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {secondFilterOptions && (
              <Select onValueChange={onSecondFilterChange} defaultValue={defaultSecondFilterValue}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={secondFilterPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {secondFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {onSelectedRowsChange && (
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value) => {
                          const currentPageIds = table
                            .getRowModel()
                            .rows.map((row) => row.original.id!);
                          const newSelectedRows = value
                            ? Array.from(
                                new Set([...selectedRows, ...currentPageIds])
                              )
                            : selectedRows.filter(
                                (id) => !currentPageIds.includes(id)
                              );
                          onSelectedRowsChange(newSelectedRows);
                          table.toggleAllPageRowsSelected(!!value);
                        }}
                        aria-label="Select all"
                      />
                    </TableHead>
                  )}
                  {table.getHeaderGroups().map((headerGroup) => (
                    <React.Fragment key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading state
                  Array.from({ length: itemsPerPage }).map((_, index) => (
                    <TableRow key={index}>
                      {onSelectedRowsChange && (
                        <TableCell className="w-[70px]">
                          <Skeleton className="h-4 w-4" />
                        </TableCell>
                      )}
                      {columns.map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  // Existing content rendering
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="cursor-pointer transition-all duration-200"
                      onClick={(e) => {
                        if (
                          (e.target as HTMLElement).closest("button") ||
                          (e.target as HTMLElement).closest("a") ||
                          (e.target as HTMLElement).closest('[role="checkbox"]')
                        ) {
                          return;
                        }
                        
                        if (onSelectedRowsChange) {
                          const rowId = row.original.id!;
                          const isSelected = selectedRows.includes(rowId);
                          const newSelectedRows = isSelected
                            ? selectedRows.filter(id => id !== rowId)
                            : [...selectedRows, rowId];
                          onSelectedRowsChange(newSelectedRows);
                          // Update the table's internal selection state
                          row.toggleSelected(!isSelected);
                        }
                      }}
                    >
                      {onSelectedRowsChange && (
                        <TableCell className="w-[70px]">
                          <Checkbox
                            checked={selectedRows.includes(row.original.id!)}
                            onCheckedChange={(value) => {
                              const rowId = row.original.id!;
                              const newSelectedRows = value
                                ? [...selectedRows, rowId]
                                : selectedRows.filter(id => id !== rowId);
                              onSelectedRowsChange(newSelectedRows);
                              // Update the table's internal selection state
                              row.toggleSelected(!!value);
                            }}
                            aria-label="Select row"
                          />
                        </TableCell>
                      )}
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  // No results state
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + (onSelectedRowsChange ? 1 : 0)}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-center justify-between">
            {onDeleteSelected && (
              <Button
                variant="destructive"
                onClick={() => handleDeleteClick('multiple')}
                disabled={!selectedRows.length}
              >
                Delete Selected ({selectedRows.length})
              </Button>
            )}
            {!noPagination && (
              <div className="ml-auto">
                <Pagination>
                  <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        currentPage > 1 && onPageChange?.(currentPage - 1)
                      }
                      aria-disabled={currentPage === 1}
                    />
                  </PaginationItem>

                  {/* First Page */}
                  {currentPage > 2 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => onPageChange?.(1)}>
                        1
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {/* Left Ellipsis */}
                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {/* Current Page and Surrounding Pages */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => Math.abs(page - currentPage) <= 1)
                    .map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => onPageChange?.(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                  {/* Right Ellipsis */}
                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {/* Last Page */}
                  {currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => onPageChange?.(totalPages)}>
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        currentPage < totalPages &&
                        onPageChange?.(currentPage + 1)
                      }
                      aria-disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteMode === 'single'
                ? "This action cannot be undone. This item will be permanently deleted."
                : `This action cannot be undone. ${selectedRows.length} items will be permanently deleted.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
