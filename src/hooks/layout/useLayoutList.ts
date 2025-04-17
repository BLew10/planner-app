import { useQuery } from "@tanstack/react-query";

interface Layout {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LayoutListResponse {
  layouts: Layout[];
  totalPages: number;
  totalItems: number;
}

interface UseLayoutListParams {
  search?: string;
  page?: number;
}

export function useLayoutList({ search = "", page = 1 }: UseLayoutListParams = {}) {
  const { data, isLoading } = useQuery<LayoutListResponse>({
    queryKey: ["layouts", { search, page }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        search,
        page: page.toString(),
      });
      const response = await fetch(`/api/layouts?${searchParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch layouts");
      }
      return response.json();
    },
  });

  return {
    layouts: data?.layouts,
    totalPages: data?.totalPages || 1,
    isLoading,
  };
}
