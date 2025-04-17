import { DataTable } from "@/app/(components)/general/DataTable";
import { ContactTableData } from "@/lib/data/contact";
import { getContactColumns } from "./ContactColumns";

interface ContactsTableProps {
  contacts: Partial<ContactTableData>[];
  isLoading: boolean;
  addressBooks: { label: string; value: string }[];
  onFilterChange: (value: string) => void;
  onSearch: (query: string) => void;
  onContactDelete: (id: string) => void;
  onSelectedRowsChange: (rows: string[]) => void;
  selectedRows: string[];
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
  onContactDelete,
  onSelectedRowsChange,
  selectedRows,
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
      onAdd={onAdd}
      addButtonLabel="Add Contact"
      onSelectedRowsChange={onSelectedRowsChange}
      selectedRows={selectedRows}
      onDeleteSelected={onDeleteSelected}
      itemsPerPage={itemsPerPage}
      totalItems={totalItems}
      currentPage={currentPage}
      onPageChange={onPageChange}
      filterPlaceholder="Filter by address book..."
    />
  );
}