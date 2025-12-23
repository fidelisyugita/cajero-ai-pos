package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyReportDTO {
  private LocalDate date;
  private long totalTransaction;
  private long totalProductSold;
  private BigDecimal totalRevenue;

  private Long totalRefundTransaction;
  private Long totalRefundProduct;
  private BigDecimal totalRefund;

  private BigDecimal totalNetRevenue;

  private BigDecimal totalTax;
  private BigDecimal totalExpenses;

  private List<ReportSummaryDTO.PaymentMethodStat> paymentMethods;
  private List<ReportSummaryDTO.CommissionStat> commissions;
}
