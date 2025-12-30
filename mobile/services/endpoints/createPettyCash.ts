import api from "@/lib/axios";
import type { PettyCash } from "../types/PettyCash";

export interface CreatePettyCashRequest {
    amount: number;
    isIncome: boolean;
    imageUrl?: string;
    description: string;
}

export const createPettyCash = async (
    data: CreatePettyCashRequest
): Promise<PettyCash> => {
    const response = await api.post<PettyCash>("/petty-cash", data);
    return response.data;
};
