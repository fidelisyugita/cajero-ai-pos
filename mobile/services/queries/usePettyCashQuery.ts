import { useQuery } from "@tanstack/react-query";
import { getPettyCash } from "../endpoints/getPettyCash";

export const usePettyCashQuery = (params: { startDate?: string; endDate?: string; page?: number; size?: number; sortBy?: string; sortDir?: string; keyword?: string } = {}) =>
    useQuery({
        queryKey: ["petty-cash", params],
        queryFn: async () => {
            const data = await getPettyCash(params);
            return data;
        },
    });
