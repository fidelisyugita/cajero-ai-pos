package com.huzakerna.cajero.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.huzakerna.cajero.dto.DailyReportDTO;
import com.huzakerna.cajero.dto.ReportResponse;
import com.huzakerna.cajero.dto.ReportSummaryDTO;
import com.huzakerna.cajero.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportService {

  private final TransactionRepository transactionRepository;
  private final com.huzakerna.cajero.repository.PettyCashRepository pettyCashRepository;

  public ReportResponse getDailyReport(UUID storeId, LocalDate startDate, LocalDate endDate) {
    Instant startDateTime = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
    Instant endDateTime = endDate.atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant();

    // Global Stats for Summary (Reliability)
    List<Object[]> transactions = transactionRepository.findTransactionDailyStats(storeId, startDateTime, endDateTime);
    List<Object[]> products = transactionRepository.findProductDailyStats(storeId, startDateTime, endDateTime);
    List<Object[]> refundStats = transactionRepository.findRefundStats(storeId, startDateTime, endDateTime);
    List<Object[]> paymentStats = transactionRepository.findPaymentMethodStats(storeId, startDateTime, endDateTime);
    List<Object[]> commissionStats = transactionRepository.findCommissionStats(storeId, startDateTime, endDateTime);

    // Daily Detailed Stats
    List<Object[]> refundStatsDaily = transactionRepository.findRefundStatsDaily(storeId, startDateTime, endDateTime);
    List<Object[]> taxStatsDaily = transactionRepository.findTotalTaxDaily(storeId, startDateTime, endDateTime);
    List<Object[]> paymentStatsDaily = transactionRepository.findPaymentMethodStatsDaily(storeId, startDateTime,
        endDateTime);
    List<Object[]> commissionStatsDaily = transactionRepository.findCommissionStatsDaily(storeId, startDateTime,
        endDateTime);
    List<Object[]> expenseStatsDaily = pettyCashRepository.findExpensesDaily(storeId, startDateTime, endDateTime);

    Map<LocalDate, DailyReportDTO.DailyReportDTOBuilder> builderMap = new HashMap<>();
    Map<LocalDate, List<ReportSummaryDTO.PaymentMethodStat>> paymentMethodsMap = new HashMap<>();
    Map<LocalDate, List<ReportSummaryDTO.CommissionStat>> commissionsMap = new HashMap<>();

    // Process Transactions (Basic)
    for (Object[] row : transactions) {
      LocalDate date = (LocalDate) row[0];
      Long count = (Long) row[1];
      BigDecimal revenue = (BigDecimal) row[2];
      BigDecimal refund = (BigDecimal) row[3];
      BigDecimal discount = (BigDecimal) row[4];

      if (revenue == null)
        revenue = BigDecimal.ZERO;
      if (refund == null)
        refund = BigDecimal.ZERO;
      if (discount == null)
        discount = BigDecimal.ZERO;

      builderMap.computeIfAbsent(date, k -> DailyReportDTO.builder().date(k))
          .totalTransaction(count)
          .totalRevenue(revenue)
          .totalRefund(refund)
          .totalDiscount(discount)
          .totalNetRevenue(revenue.subtract(refund));
    }

    // Process Products
    for (Object[] row : products) {
      LocalDate date = (LocalDate) row[0];
      BigDecimal productSold = (BigDecimal) row[1];
      if (productSold == null)
        productSold = BigDecimal.ZERO;

      builderMap.computeIfAbsent(date, k -> DailyReportDTO.builder().date(k))
          .totalProductSold(productSold.longValue());
    }

    // Process Daily Refund Stats
    for (Object[] row : refundStatsDaily) {
      LocalDate date = (LocalDate) row[0];
      Long count = (Long) row[1];
      BigDecimal productCount = (BigDecimal) row[3];

      builderMap.computeIfAbsent(date, k -> DailyReportDTO.builder().date(k))
          .totalRefundTransaction(count != null ? count : 0L)
          .totalRefundProduct(productCount != null ? productCount.longValue() : 0L);
    }

    // Process Daily Tax
    for (Object[] row : taxStatsDaily) {
      LocalDate date = (LocalDate) row[0];
      BigDecimal totalTax = (BigDecimal) row[1];
      builderMap.computeIfAbsent(date, k -> DailyReportDTO.builder().date(k))
          .totalTax(totalTax != null ? totalTax : BigDecimal.ZERO);
    }

    // Process Daily Expenses
    for (Object[] row : expenseStatsDaily) {
      LocalDate date = (LocalDate) row[0];
      BigDecimal totalExpenses = (BigDecimal) row[1];
      builderMap.computeIfAbsent(date, k -> DailyReportDTO.builder().date(k))
          .totalExpenses(totalExpenses != null ? totalExpenses : BigDecimal.ZERO);
    }

    // Process Daily Payment Methods
    for (Object[] row : paymentStatsDaily) {
      LocalDate date = (LocalDate) row[0];
      String method = (String) row[1];
      BigDecimal amount = (BigDecimal) row[2];
      paymentMethodsMap.computeIfAbsent(date, k -> new ArrayList<>())
          .add(new ReportSummaryDTO.PaymentMethodStat(method, amount));
    }

    // Process Daily Commissions
    for (Object[] row : commissionStatsDaily) {
      LocalDate date = (LocalDate) row[0];
      String cashier = (String) row[1];
      BigDecimal amount = (BigDecimal) row[2];
      commissionsMap.computeIfAbsent(date, k -> new ArrayList<>())
          .add(new ReportSummaryDTO.CommissionStat(cashier, amount));
    }

    // Build Daily List
    List<DailyReportDTO> dailyReports = builderMap.values().stream()
        .map(builder -> {
          LocalDate date = builder.build().getDate();
          return builder.paymentMethods(paymentMethodsMap.getOrDefault(date, new ArrayList<>()))
              .commissions(commissionsMap.getOrDefault(date, new ArrayList<>()))
              .build();
        })
        .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
        .collect(Collectors.toList());

    // Calculate Summary Aggregates from Daily Reports
    long totalTransaction = 0;
    long totalProductSold = 0;
    BigDecimal totalRevenue = BigDecimal.ZERO;
    BigDecimal totalRefund = BigDecimal.ZERO;
    BigDecimal totalDiscount = BigDecimal.ZERO;
    BigDecimal totalNetRevenue = BigDecimal.ZERO;
    Long totalRefundTransaction = 0L;
    Long totalRefundProduct = 0L;
    BigDecimal totalTax = BigDecimal.ZERO;
    BigDecimal totalExpenses = BigDecimal.ZERO;

    for (DailyReportDTO day : dailyReports) {
      totalTransaction += day.getTotalTransaction();
      totalProductSold += day.getTotalProductSold();
      totalRevenue = totalRevenue.add(day.getTotalRevenue() != null ? day.getTotalRevenue() : BigDecimal.ZERO);
      totalRefund = totalRefund.add(day.getTotalRefund() != null ? day.getTotalRefund() : BigDecimal.ZERO);
      totalNetRevenue = totalNetRevenue
          .add(day.getTotalNetRevenue() != null ? day.getTotalNetRevenue() : BigDecimal.ZERO);
      totalDiscount = totalDiscount
          .add(day.getTotalDiscount() != null ? day.getTotalDiscount() : BigDecimal.ZERO);

      if (day.getTotalRefundTransaction() != null)
        totalRefundTransaction += day.getTotalRefundTransaction();
      if (day.getTotalRefundProduct() != null)
        totalRefundProduct += day.getTotalRefundProduct();
      if (day.getTotalTax() != null)
        totalTax = totalTax.add(day.getTotalTax());
      if (day.getTotalExpenses() != null)
        totalExpenses = totalExpenses.add(day.getTotalExpenses());
    }

    // Process Global Refund Stats for Amount (Summary)
    BigDecimal totalRefundAmount = BigDecimal.ZERO;
    for (Object[] row : refundStats) {
      BigDecimal amount = (BigDecimal) row[1];
      if (amount != null)
        totalRefundAmount = totalRefundAmount.add(amount);
    }
    // Note: totalRefund above from daily sum (sum of day.totalRefund) should match
    // totalRefundAmount.
    // day.totalRefund comes from transactions list (revenue/refund columns from
    // main stats).
    // Let's use the one from the loop for consistency.

    // Payment Methods Summary
    List<ReportSummaryDTO.PaymentMethodStat> paymentMethodStats = new ArrayList<>();
    for (Object[] row : paymentStats) {
      String method = (String) row[0];
      BigDecimal amount = (BigDecimal) row[1];
      paymentMethodStats.add(new ReportSummaryDTO.PaymentMethodStat(method, amount));
    }

    // Commissions Summary
    List<ReportSummaryDTO.CommissionStat> commissionStatList = new ArrayList<>();
    for (Object[] row : commissionStats) {
      String cashier = (String) row[0];
      BigDecimal amount = (BigDecimal) row[1];
      commissionStatList.add(new ReportSummaryDTO.CommissionStat(cashier, amount));
    }

    ReportSummaryDTO summary = ReportSummaryDTO.builder()
        .totalTransaction(totalTransaction)
        .totalProductSold(totalProductSold)
        .totalRevenue(totalRevenue)
        .totalRefund(totalRefund) // Use summed value
        .totalNetRevenue(totalNetRevenue)
        .totalDiscount(totalDiscount)
        .totalRefundTransaction(totalRefundTransaction)
        .totalRefundProduct(totalRefundProduct)
        .totalTax(totalTax)
        .totalExpenses(totalExpenses)
        .paymentMethods(paymentMethodStats)
        .commissions(commissionStatList)
        .build();

    return ReportResponse.builder()
        .summary(summary)
        .dailyReports(dailyReports)
        .build();
  }
}
