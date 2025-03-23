import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/shadcn/use-toast";
import { getCashFlowData } from "@/lib/data/cashFlowReport";

interface CashFlowEntry {
  name: string;
  representativeName?: string;
  isInactive?: boolean;
  months: {
    [month: string]: {
      projected?: number;
      actual?: number;
      isCredit?: boolean;
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

export const useCashFlowReport = (options: UseCashFlowReportOptions = {}) => {
  const {
    initialYear = new Date().getFullYear().toString(),
    initialCompany = "All",
  } = options;

  const [cashFlowData, setCashFlowData] = useState<CashFlowEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(initialCompany);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [companies, setCompanies] = useState<string[]>(["All"]);
  const [reportDate, setReportDate] = useState(new Date().toLocaleDateString());

  const fetchCashFlowData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = (await getCashFlowData(
        selectedYear,
        selectedCompany
      )) as CashFlowEntry[];
      if (data) {
        setCashFlowData(data);
        // Get unique company names from data
        const companyNames = [
          "All",
          ...Array.from(
            new Set(data.map((item) => item.name).filter(Boolean))
          ).sort(),
        ];
        setCompanies(companyNames);
      }
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
  }, [selectedYear, selectedCompany]);

  useEffect(() => {
    fetchCashFlowData();
  }, [fetchCashFlowData]);

  const handleGeneratePDF = useCallback(() => {
    window.open(
      `/api/reports/cash-flow-pdf?year=${selectedYear}&company=${selectedCompany}`,
      "_blank"
    );
  }, [selectedYear, selectedCompany]);

  const refreshData = useCallback(() => {
    fetchCashFlowData();
    setReportDate(new Date().toLocaleDateString());
  }, [fetchCashFlowData]);

  return {
    cashFlowData,
    isLoading,
    selectedCompany,
    setSelectedCompany,
    selectedYear,
    setSelectedYear,
    companies,
    reportDate,
    handleGeneratePDF,
    refreshData,
  };
};
