import { useState, useCallback, useEffect } from "react";
import { toast } from "@/hooks/shadcn/use-toast";
import { getAllAdvertisementTypes } from "@/lib/data/advertisementType";
import { Advertisement } from "@prisma/client";
import  deleteAdvertisementType from "@/actions/advertisement-types/deleteAdvertisementType";

export const useAdTypes = ({
  itemsPerPage = 10,
}: { itemsPerPage?: number } = {}) => {
  const [adTypes, setAdTypes] = useState<Partial<Advertisement>[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  console.log(selectedRows);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchAdTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, totalItems: total } = await getAllAdvertisementTypes(
        page,
        itemsPerPage,
        search
      );
      setAdTypes(data);
      setTotalItems(total);
      setSelectedRows([]);
    } catch (error) {
      toast({
        title: "Error fetching advertisement types",
        description: "There was a problem loading the advertisement types.",
        variant: "destructive",
      });
      setAdTypes(null);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage, page, search]);

  useEffect(() => {
    fetchAdTypes();
  }, [fetchAdTypes]);

  const handleDelete = async (id: string) => {
    try {
      const deleted = await deleteAdvertisementType(id);
      if (deleted) {
        toast({
          title: "Advertisement type deleted",
          description: "The advertisement type has been successfully deleted.",
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchAdTypes();
        return true;
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast({
        title: "Error deleting advertisement type",
        description: "There was a problem deleting the advertisement type.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const results = [];
      for (const id of selectedRows) {
        console.log(id);
        try {
          const result = await deleteAdvertisementType(id);
          results.push(result);
        } catch (error) {
          console.error(`Failed to delete ${id}:`, error);
          results.push(false);
        }
      }

      if (results.every(Boolean)) { 
        toast({
          title: "Advertisement types deleted",
          description: "The selected advertisement types have been deleted.",
        });
        setSelectedRows([]);
        await fetchAdTypes();
        return true;
      } else {
        throw new Error("Some deletions failed");
      }
    } catch (error) {
      toast({
        title: "Error deleting advertisement types",
        description: "There was a problem deleting some advertisement types.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
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
  };
};
