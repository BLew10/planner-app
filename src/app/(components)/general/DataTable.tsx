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

interface DataTableProps<TData> {
  isLoading: boolean;
  columns: ColumnDef<TData, any>[];
  data: TData[];
  title?: string;
  filterOptions?: { value: string; label: string }[];
  filterPlaceholder?: string;
  onFilterChange?: (value: string) => void;
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
}

export function DataTable<TData extends { id?: string }>({
  isLoading,
  columns,
  data,
  title = "Data",
  filterOptions,
  filterPlaceholder = "Filter...",
  onFilterChange,
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
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchQuery, setSearchQuery] = React.useState("");

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
      pagination: {
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

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => {
                    setSearchQuery("");
                    onSearch?.("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button type="submit">Search</Button>
          </form>
          {filterOptions && (
            <Select onValueChange={onFilterChange}>
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
              onClick={onDeleteSelected}
              disabled={!table.getFilteredSelectedRowModel().rows.length}
            >
              Delete Selected ({table.getFilteredSelectedRowModel().rows.length}
              )
            </Button>
          )}
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
        </div>
      </CardContent>
    </Card>
  );
}
