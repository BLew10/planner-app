import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/shadcn/use-toast";
import { getCashFlowData } from "@/lib/data/cashFlowReport";
import { DEFAULT_YEAR } from "@/lib/constants";

interface CashFlowEntry {
  name: string;
  representativeName?: string;
  isInactive?: boolean;
  months: {
    [month: string]: {
      projected?: number;
      actual?: number;
    };
  };
  yearTotal: {
    projected: number;
    actual: number;
  };
}

interface UseCashFlowReportOptions {
  initialYear?: string;
  initialCompany?: string;
}

export const useCashFlowReport = (calendarYear: string) => {
  const [cashFlowData, setCashFlowData] = useState<CashFlowEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [companies, setCompanies] = useState<string[]>(["All"]);
  const [reportDate, setReportDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getCashFlowData(calendarYear, selectedCompany);
        setCashFlowData(data);

        const uniqueCompanies = new Set(["All"]);
        data.forEach((entry) => {
          if (entry.name) uniqueCompanies.add(entry.name);
        });
        setCompanies(Array.from(uniqueCompanies));

        setReportDate(new Date().toLocaleDateString());
      } catch (error) {
        console.error("Error fetching cash flow data:", error);
        toast({
          title: "Error fetching cash flow data",
          description: "There was a problem loading the cash flow report.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [calendarYear, selectedCompany]);

  const handleGeneratePDF = useCallback(() => {
    window.open(
      `/api/reports/cash-flow-pdf?year=${calendarYear}&company=${selectedCompany}`,
      "_blank"
    );
  }, [calendarYear, selectedCompany]);

  const refreshData = useCallback(() => {
    // Implement refresh logic
    console.log("Refreshing data...");
  }, []);

  return {
    cashFlowData,
    isLoading,
    selectedCompany,
    setSelectedCompany,
    companies,
    reportDate,
    handleGeneratePDF,
    refreshData,
  };
};
