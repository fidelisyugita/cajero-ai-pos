export interface PettyCash {
    id: string;
    storeId: string;
    amount: number;
    isIncome: boolean;
    imageUrl?: string;
    description: string;
    createdBy?: string;
    createdByName?: string;
    createdAt: string;
    updatedAt: string;
}
