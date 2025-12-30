package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
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
public class ReportSummaryDTO {
  private long totalTransaction;
  private long totalProductSold;
  private BigDecimal totalRevenue;

  private Long totalRefundTransaction;
  private Long totalRefundProduct;
  private BigDecimal totalRefund;

  private BigDecimal totalNetRevenue;
  private BigDecimal totalDiscount;

  private BigDecimal totalTax;
  private BigDecimal totalExpenses;

  private List<PaymentMethodStat> paymentMethods;
  private List<CommissionStat> commissions;

  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class PaymentMethodStat {
    private String paymentMethod;
    private BigDecimal totalAmount;
  }

  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class CommissionStat {
    private String cashierName;
    private BigDecimal totalCommission;
  }
}
