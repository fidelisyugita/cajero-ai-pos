import { useQuery } from "@tanstack/react-query";
import { getReports, GetReportsParams } from "../endpoints/getReports";

export const useReportsQuery = (params: GetReportsParams) =>
    useQuery({
        queryKey: ["reports", params],
        queryFn: () => getReports(params),
        enabled: !!params.startDate && !!params.endDate,
    });
