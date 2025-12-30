import api from "@/lib/axios";
import type { PettyCash } from "../types/PettyCash";
import type { PageResponse } from "../types/Page";

export const getPettyCash = async (params: { startDate?: string, endDate?: string, page?: number, size?: number, sortBy?: string, sortDir?: string, keyword?: string } = {}): Promise<PageResponse<PettyCash>> => {
    const response = await api.get<PageResponse<PettyCash>>("/petty-cash", { params });
    return response.data;
};
