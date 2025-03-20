"use client";

import { useRouter } from "next/navigation";
import { Advertisement } from "@prisma/client";
import { useAdTypes } from "@/hooks/advertisment-type/useAdTypes";
import { AdvertisementTypesTable } from "./AdvertismentTypesTable";

const ITEMS_PER_PAGE = 10;

const AdvertisementsPage = () => {
  const router = useRouter();
  const {
    adTypes,
    isLoading,
    selectedRows,
    setSelectedRows,
    totalItems,
    page,
    setPage,
    search,
    setSearch,
    handleDelete,
    handleDeleteSelected,
  } = useAdTypes({ itemsPerPage: ITEMS_PER_PAGE });

  const onRowClick = (row: Partial<Advertisement>) => {
    router.push(`/dashboard/advertisement-types/${row.id}`);
  };

  return (
    <section className="container mx-auto px-4 w-full mt-10">
      <AdvertisementTypesTable
        adTypes={adTypes}
        isLoading={isLoading}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        onDelete={handleDelete}
        onDeleteSelected={handleDeleteSelected}
        onSearch={setSearch}
        onPageChange={setPage}
        totalItems={totalItems}
        currentPage={page}
        onAdd={() => router.push("/dashboard/advertisement-types/add")}
        onRowClick={onRowClick}
      />
    </section>
  );
};

export default AdvertisementsPage;
