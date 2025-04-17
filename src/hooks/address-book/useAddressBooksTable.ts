import { useState, useCallback, useEffect } from "react";
import { toast } from "@/hooks/shadcn/use-toast";
import { getAllAddressBooks } from "@/lib/data/addressBook";
import { AddressBook } from "@prisma/client";
import deleteAddressBook from "@/actions/address-book/deleteAddressBook";

export const useAddressBooksTable = ({
  itemsPerPage = 10,
}: { itemsPerPage?: number } = {}) => {
  const [addressBooks, setAddressBooks] = useState<
    Partial<AddressBook>[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchAddressBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      // Assuming getAllAddressBooks will be updated to support pagination and search
      const result = await getAllAddressBooks(page, itemsPerPage, search);
      setAddressBooks(result?.data || []);
      setTotalItems(result?.totalItems || 0);
      setSelectedRows([]);
    } catch (error) {
      toast({
        title: "Error fetching address books",
        description: "There was a problem loading the address books.",
        variant: "destructive",
      });
      setAddressBooks(null);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage, page, search]);

  useEffect(() => {
    fetchAddressBooks();
  }, [fetchAddressBooks]);

  const handleDelete = async (id: string) => {
    try {
      const deleted = await deleteAddressBook(id);
      if (deleted) {
        toast({
          title: "Address book deleted",
          description: "The address book has been successfully deleted.",
        });
        fetchAddressBooks();
        return true;
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast({
        title: "Error deleting address book",
        description: "There was a problem deleting the address book.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const results = await Promise.all(
        selectedRows.map((id) => deleteAddressBook(id))
      );

      if (results.every(Boolean)) {
        toast({
          title: "Address books deleted",
          description: "The selected address books have been deleted.",
        });
        setSelectedRows([]);
        fetchAddressBooks();
        return true;
      } else {
        throw new Error("Some deletions failed");
      }
    } catch (error) {
      toast({
        title: "Error deleting address books",
        description: "There was a problem deleting some address books.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    addressBooks,
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
  };
};
