package com.huzakerna.cajero.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.huzakerna.cajero.model.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

  @Query("""
          SELECT t FROM Transaction t
          WHERE t.storeId = :storeId
            AND (:statusCode IS NULL OR t.statusCode = :statusCode)
            AND (:transactionTypeCode IS NULL OR t.transactionTypeCode = :transactionTypeCode)
            AND (:paymentMethodCode IS NULL OR t.paymentMethodCode = :paymentMethodCode)
            AND t.deletedAt IS NULL
            AND t.createdAt BETWEEN :start AND :end
      """)
  Page<Transaction> findFiltered(
      @Param("storeId") UUID storeId,
      @Param("statusCode") String statusCode,
      @Param("transactionTypeCode") String transactionTypeCode,
      @Param("paymentMethodCode") String paymentMethodCode,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end,
      Pageable pageable);

  @Query("""
      SELECT
        CAST(t.createdAt AS LocalDate) as date,
        COUNT(t) as count,
        SUM(CASE WHEN t.statusCode = 'COMPLETED' THEN t.totalPrice ELSE 0 END) as revenue,
        SUM(CASE WHEN t.statusCode = 'REFUND' THEN t.totalPrice ELSE 0 END) as refund,
        SUM(CASE WHEN t.statusCode = 'COMPLETED' THEN t.totalDiscount ELSE 0 END) as discount
      FROM Transaction t
      WHERE t.storeId = :storeId
        AND t.createdAt BETWEEN :start AND :end
        AND t.deletedAt IS NULL
      GROUP BY CAST(t.createdAt AS LocalDate)
      """)
  List<Object[]> findTransactionDailyStats(
      @Param("storeId") UUID storeId,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);

  @Query("""
      SELECT
        CAST(t.createdAt AS LocalDate) as date,
        SUM(tp.quantity) as productSold
      FROM Transaction t
      JOIN t.transactionProducts tp
      WHERE t.storeId = :storeId
        AND t.createdAt BETWEEN :start AND :end
        AND t.deletedAt IS NULL
      GROUP BY CAST(t.createdAt AS LocalDate)
      """)
  List<Object[]> findProductDailyStats(
      @Param("storeId") UUID storeId,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);

  @Query("""
      SELECT
        COUNT(t),
        SUM(t.totalPrice),
        (SELECT SUM(tp.quantity)
         FROM TransactionProduct tp
         WHERE tp.transaction.id = t.id)
      FROM Transaction t
      WHERE t.storeId = :storeId
        AND t.statusCode = 'REFUND'
        AND t.createdAt BETWEEN :start AND :end
        AND t.deletedAt IS NULL
      GROUP BY t.id
      """)
  List<Object[]> findRefundStats(
      @Param("storeId") UUID storeId,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);

  @Query("""
      SELECT SUM(t.totalTax)
      FROM Transaction t
      WHERE t.storeId = :storeId
        AND t.statusCode = 'COMPLETED'
        AND t.createdAt BETWEEN :start AND :end
        AND t.deletedAt IS NULL
      """)
  BigDecimal findTotalTax(
      @Param("storeId") UUID storeId,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);

  @Query("""
      SELECT
        t.paymentMethodCode,
        SUM(t.totalPrice)
      FROM Transaction t
      WHERE t.storeId = :storeId
        AND t.statusCode = 'COMPLETED'
        AND t.createdAt BETWEEN :start AND :end
        AND t.deletedAt IS NULL
      GROUP BY t.paymentMethodCode
      """)
  List<Object[]> findPaymentMethodStats(
      @Param("storeId") UUID storeId,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);

  @Query("""
      SELECT
        u.name,
        SUM(t.totalCommission)
      FROM Transaction t
      JOIN User u ON t.createdBy = u.id
      WHERE t.storeId = :storeId
        AND t.statusCode = 'COMPLETED'
        AND t.createdAt BETWEEN :start AND :end
        AND t.deletedAt IS NULL
      GROUP BY u.name
      """)
  List<Object[]> findCommissionStats(
      @Param("storeId") UUID storeId,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);

  // Daily Detailed Stats

  @Query("""
      SELECT
        CAST(t.createdAt AS LocalDate) as date,
        COUNT(t),
        SUM(t.totalPrice),
        (SELECT SUM(tp.quantity)
         FROM TransactionProduct tp
         WHERE tp.transaction.id = t.id)
      FROM Transaction t
      WHERE t.storeId = :storeId
        AND t.statusCode = 'REFUND'
        AND t.createdAt BETWEEN :start AND :end
        AND t.deletedAt IS NULL
      GROUP BY CAST(t.createdAt AS LocalDate), t.id
      """)
  List<Object[]> findRefundStatsDaily(
      @Param("storeId") UUID storeId,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);

  @Query("""
      SELECT
        CAST(t.createdAt AS LocalDate) as date,
        SUM(t.totalTax)
      FROM Transaction t
      WHERE t.storeId = :storeId
        AND t.statusCode = 'COMPLETED'
        AND t.createdAt BETWEEN :start AND :end
        AND t.deletedAt IS NULL
      GROUP BY CAST(t.createdAt AS LocalDate)
      """)
  List<Object[]> findTotalTaxDaily(
      @Param("storeId") UUID storeId,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);

  @Query("""
      SELECT
        CAST(t.createdAt AS LocalDate) as date,
        t.paymentMethodCode,
        SUM(t.totalPrice)
      FROM Transaction t
      WHERE t.storeId = :storeId
        AND t.statusCode = 'COMPLETED'
        AND t.createdAt BETWEEN :start AND :end
        AND t.deletedAt IS NULL
      GROUP BY CAST(t.createdAt AS LocalDate), t.paymentMethodCode
      """)
  List<Object[]> findPaymentMethodStatsDaily(
      @Param("storeId") UUID storeId,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);

  @Query("""
      SELECT
        CAST(t.createdAt AS LocalDate) as date,
        u.name,
        SUM(t.totalCommission)
      FROM Transaction t
      JOIN User u ON t.createdBy = u.id
      WHERE t.storeId = :storeId
        AND t.statusCode = 'COMPLETED'
        AND t.createdAt BETWEEN :start AND :end
        AND t.deletedAt IS NULL
      GROUP BY CAST(t.createdAt AS LocalDate), u.name
      """)
  List<Object[]> findCommissionStatsDaily(
      @Param("storeId") UUID storeId,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);

}
