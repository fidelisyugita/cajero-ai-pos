export type PaymentMethodStat = {
  paymentMethod: string;
  totalAmount: number;
};

export type CommissionStat = {
  cashierName: string;
  totalCommission: number;
};

export type ReportSummaryDTO = {
  totalTransaction: number;
  totalProductSold: number;
  totalRevenue: number;
  totalRefundTransaction: number;
  totalRefundProduct: number;
  totalRefund: number;
  totalNetRevenue: number;
  totalTax: number;
  totalExpenses: number;
  paymentMethods: PaymentMethodStat[];
  commissions: CommissionStat[];
};

export type DailyReportDTO = {
  date: string;
  totalTransaction: number;
  totalProductSold: number;
  totalRevenue: number;
  totalRefundTransaction: number;
  totalRefundProduct: number;
  totalRefund: number;
  totalNetRevenue: number;
  totalTax: number;
  totalExpenses: number;
  paymentMethods: PaymentMethodStat[];
  commissions: CommissionStat[];
};

export type ReportResponse = {
  summary: ReportSummaryDTO;
  dailyReports: DailyReportDTO[];
};
