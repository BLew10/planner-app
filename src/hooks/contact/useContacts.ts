import { useState, useEffect, useCallback } from "react";
import { ContactTableData, getContactsByAddressBook, deleteManyContacts } from "@/lib/data/contact";
import deleteContact from "@/actions/contact/deleteContact";
import { useToast } from "@/hooks/shadcn/use-toast";

interface UseContactsProps {
  itemsPerPage: number;
  addressBookId: string;
}

export const useContacts = ({ itemsPerPage, addressBookId }: UseContactsProps) => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Partial<ContactTableData>[] | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchContacts = useCallback(async (addressBookId: string, page: number, query: string) => {
    setIsLoading(true);
    const result = await getContactsByAddressBook(addressBookId, page, itemsPerPage, query);
    setContacts(result.contacts);
    setTotalItems(result.total);
    setIsLoading(false);
  }, [itemsPerPage]);

  useEffect(() => {
    fetchContacts(addressBookId, currentPage, searchQuery);
  }, [addressBookId, currentPage, itemsPerPage, fetchContacts, searchQuery]);

  const deleteSelectedContacts = async () => {
    const deleted = await deleteManyContacts(selectedRows);
    await fetchContacts(addressBookId, currentPage, searchQuery);
    if (deleted) {
      toast({
        title: "Successfully Deleted",
        variant: "default",
      });
      setSelectedRows([]);
    } else {
      toast({
        title: "Something went wrong. Deletion failed",
        variant: "destructive",
      });
    }
  };

  const onContactDelete = async (contactId: string) => {
    const deleted = await deleteContact(contactId);
    await fetchContacts(addressBookId, currentPage, searchQuery);
    if (deleted) {
      toast({
        title: "Successfully Deleted",
        variant: "default",
      });
    } else {
      toast({
        title: "Something went wrong. Deletion failed",
        variant: "destructive",
      });
    }
  };

  return {
    contacts,
    selectedRows,
    setSelectedRows,
    currentPage,
    setCurrentPage,
    totalItems,
    setSearchQuery,
    isLoading,
    deleteSelectedContacts,
    onContactDelete,
  };
};