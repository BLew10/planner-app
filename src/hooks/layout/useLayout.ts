import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Layout {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  adPlacements: AdPlacement[];
}

interface AdPlacement {
  id: string;
  layoutId: string;
  advertisementId: string;
  position: string;
  x: number;
  y: number;
  width: number;
  height: number;
  advertisement: {
    id: string;
    name: string;
  };
}

interface LayoutInput {
  name: string;
  description?: string;
  savedAreas: {
    adTypeId: string;
    position: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}

export function useLayout(layoutId?: string) {
  const queryClient = useQueryClient();

  const { data: layout, isLoading } = useQuery<Layout>({
    queryKey: ["layout", layoutId],
    queryFn: async () => {
      if (!layoutId) return null;
      const response = await fetch(`/api/layouts/${layoutId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch layout");
      }
      return response.json();
    },
    enabled: !!layoutId,
  });

  const createLayout = useMutation({
    mutationFn: async (data: LayoutInput) => {
      console.log(data);
      try {
        const response = await fetch("/api/layouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error("Failed to create layout");
        }
        return response.json();
      } catch (error) {
        console.error("Failed to create layout", error);
        throw new Error("Failed to create layout");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["layouts"] });
      toast.success("Layout created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateLayout = useMutation({
    mutationFn: async (data: LayoutInput) => {
      if (!layoutId) throw new Error("Layout ID is required");
      const response = await fetch(`/api/layouts/${layoutId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update layout");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["layout", layoutId] });
      queryClient.invalidateQueries({ queryKey: ["layouts"] });
      toast.success("Layout updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteLayout = useMutation({
    mutationFn: async (layoutId: string) => {
      const response = await fetch(`/api/layouts/${layoutId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete layout");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["layouts"] });
      toast.success("Layout deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    layout,
    isLoading,
    createLayout,
    updateLayout,
    deleteLayout,
  };
} 