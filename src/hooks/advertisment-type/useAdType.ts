import { useState, useEffect } from "react";
import { getAdvertisementTypeById } from "@/lib/data/advertisementType";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/shadcn/use-toast";
import upsertAdvertisementType from "@/actions/advertisement-types/upsertAdvertismentType";

interface AdvertisementType {
  name: string;
  perMonth: number;
  isDayType: boolean;
}

interface UseAdTypeProps {
  id: string;
}

export function useAdType({ id }: UseAdTypeProps) {
  const [adType, setAdType] = useState<AdvertisementType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAdType() {
      if (!id) return;

      setIsLoading(true);
      try {
        const data = await getAdvertisementTypeById(id);
        if (data) {
          setAdType({
            name: data.name || "",
            isDayType: data.isDayType || false,
            perMonth: data.perMonth || 0,
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch advertisement type",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchAdType();
    }
  }, [id, toast]);

  const saveAdType = async (data: AdvertisementType) => {
    setIsLoading(true);
    try {
      const success = await upsertAdvertisementType(data, id || null);
      if (success) {
        router.push("/dashboard/advertisement-types");
        toast({
          title: "Success",
          description: "Advertisement type saved successfully",
        });
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save advertisement type",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    adType,
    isLoading,
    saveAdType,
  };
}
