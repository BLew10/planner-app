"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import { AddressBooksTable } from "./AddressBooksTable";
import { useAddressBooksTable } from "@/hooks/address-book/useAddressBooksTable";

const ITEMS_PER_PAGE = 10;

const AddressBooksPage = () => {
  const router = useRouter();
  const {
    addressBooks,
    isLoading,
    selectedRows,
    setSelectedRows,
    totalItems,
    page,
    setPage,
    setSearch,
    handleDelete,
    handleDeleteSelected,
  } = useAddressBooksTable({ itemsPerPage: ITEMS_PER_PAGE });

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1); // Reset to first page when search changes
  };

  return (
    <section className={styles.container}>
      <AddressBooksTable
        addressBooks={addressBooks}
        isLoading={isLoading}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        onDelete={handleDelete}
        onDeleteSelected={handleDeleteSelected}
        onSearch={handleSearch}
        onPageChange={setPage}
        totalItems={totalItems}
        currentPage={page}
      />
    </section>
  );
};

export default AddressBooksPage;
