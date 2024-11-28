import { DataTable } from "@/app/(components)/general/DataTable";
import { ContactTableData } from "@/lib/data/contact";
import { getContactColumns } from "./ContactColumns";

interface ContactsTableProps {
  contacts: Partial<ContactTableData>[];
  isLoading: boolean;
  addressBooks: { label: string; value: string }[];
  onFilterChange: (value: string) => void;
  onSearch: (query: string) => void;
  onRowClick: (row: Partial<ContactTableData>) => void;
  onContactDelete: (id: string) => void;
  onSelectedRowsChange: (rows: string[]) => void;
  onDeleteSelected: () => void;
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onAdd: () => void;
}

export function ContactsTable({
  contacts,
  isLoading,
  addressBooks,
  onFilterChange,
  onSearch,
  onRowClick,
  onContactDelete,
  onSelectedRowsChange,
  onDeleteSelected,
  itemsPerPage,
  totalItems,
  currentPage,
  onPageChange,
  onAdd,
}: ContactsTableProps) {
  const columns = getContactColumns(onContactDelete);

  return (
    <DataTable
      isLoading={isLoading}
      columns={columns}
      data={contacts || []}
      title="Contacts"
      filterOptions={addressBooks}
      onFilterChange={onFilterChange}
      searchPlaceholder="Search contacts..."
      onSearch={onSearch}
      onRowClick={onRowClick}
      onAdd={onAdd}
      addButtonLabel="Add Contact"
      onSelectedRowsChange={onSelectedRowsChange}
      onDeleteSelected={onDeleteSelected}
      itemsPerPage={itemsPerPage}
      totalItems={totalItems}
      currentPage={currentPage}
      onPageChange={onPageChange}
      filterPlaceholder="Filter by address book..."
    />
  );
}