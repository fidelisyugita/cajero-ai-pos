export interface PaymentMethodStat {
    paymentMethod: string;
    totalAmount: number;
}

export interface CommissionStat {
    cashierName: string;
    totalCommission: number;
}

export interface ReportSummary {
    totalTransaction: number;
    totalProductSold: number;
    totalRevenue: number;
    totalRefundTransaction: number;
    totalRefundProduct: number;
    totalRefund: number;
    totalNetRevenue: number;
    totalDiscount: number;
    totalTax: number;
    totalExpenses: number;
    paymentMethods: PaymentMethodStat[];
    commissions: CommissionStat[];
}

export interface DailyReport {
    date: string;
    totalTransaction: number;
    totalProductSold: number;
    totalRevenue: number;
    totalRefundTransaction: number;
    totalRefundProduct: number;
    totalRefund: number;
    totalNetRevenue: number;
    totalDiscount: number;
    totalTax: number;
    totalExpenses: number;
    paymentMethods: PaymentMethodStat[];
    commissions: CommissionStat[];
}

export interface ReportResponse {
    summary: ReportSummary;
    dailyReports: DailyReport[];
}
