import api from "@/lib/axios";
import type { PageResponse } from "../types/Page";
import type { PettyCash } from "../types/PettyCash";

export const getPettyCash = async (
  params: {
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
    keyword?: string;
  } = {},
): Promise<PageResponse<PettyCash>> => {
  const response = await api.get<PageResponse<PettyCash>>("/petty-cash", { params });
  return response.data;
};
