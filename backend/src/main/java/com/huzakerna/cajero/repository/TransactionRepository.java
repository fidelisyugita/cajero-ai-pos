package com.huzakerna.cajero.repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.huzakerna.cajero.model.Transaction;

import org.springframework.data.jpa.repository.EntityGraph;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

  @EntityGraph(attributePaths = { "createdBy", "updatedBy" })
  @Query("""
          SELECT DISTINCT t FROM Transaction t
          LEFT JOIN t.transactionProducts tp
          WHERE t.storeId = :storeId
            AND (:statusCode IS NULL OR t.statusCode = :statusCode)
            AND (:transactionTypeCode IS NULL OR t.transactionTypeCode = :transactionTypeCode)
            AND (:paymentMethodCode IS NULL OR t.paymentMethodCode = :paymentMethodCode)
            AND (:productId IS NULL OR tp.product.id = :productId)
            AND t.deletedAt IS NULL
            AND t.createdAt BETWEEN :start AND :end
      """)
  Page<Transaction> findFiltered(
      @Param("storeId") UUID storeId,
      @Param("statusCode") String statusCode,
      @Param("transactionTypeCode") String transactionTypeCode,
      @Param("paymentMethodCode") String paymentMethodCode,
      @Param("productId") UUID productId,
      @Param("start") Instant start,
      @Param("end") Instant end,
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
      @Param("start") Instant start,
      @Param("end") Instant end);

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
      @Param("start") Instant start,
      @Param("end") Instant end);

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
      @Param("start") Instant start,
      @Param("end") Instant end);

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
      @Param("start") Instant start,
      @Param("end") Instant end);

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
      @Param("start") Instant start,
      @Param("end") Instant end);

  @Query("""
      SELECT
        u.name,
        SUM(t.totalCommission)
      FROM Transaction t
      JOIN t.createdBy u
      WHERE t.storeId = :storeId
        AND t.statusCode = 'COMPLETED'
        AND t.createdAt BETWEEN :start AND :end
        AND t.deletedAt IS NULL
      GROUP BY u.name
      """)
  List<Object[]> findCommissionStats(
      @Param("storeId") UUID storeId,
      @Param("start") Instant start,
      @Param("end") Instant end);

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
      @Param("start") Instant start,
      @Param("end") Instant end);

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
      @Param("start") Instant start,
      @Param("end") Instant end);

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
      @Param("start") Instant start,
      @Param("end") Instant end);

  @Query("""
      SELECT
        CAST(t.createdAt AS LocalDate) as date,
        u.name,
        SUM(t.totalCommission)
      FROM Transaction t
      JOIN t.createdBy u
      WHERE t.storeId = :storeId
        AND t.statusCode = 'COMPLETED'
        AND t.createdAt BETWEEN :start AND :end
        AND t.deletedAt IS NULL
      GROUP BY CAST(t.createdAt AS LocalDate), u.name
      """)
  List<Object[]> findCommissionStatsDaily(
      @Param("storeId") UUID storeId,
      @Param("start") Instant start,
      @Param("end") Instant end);

  // AI-Specific Helpers

  @Query("""
      SELECT new map(
        p.name as name,
        SUM(tp.quantity) as quantity,
        SUM(tp.quantity * tp.sellingPrice) as totalSales
      )
      FROM TransactionProduct tp
      JOIN tp.product p
      JOIN tp.transaction t
      WHERE t.storeId = :storeId
        AND t.statusCode = 'COMPLETED'
        AND t.createdAt BETWEEN :start AND :end
        AND t.deletedAt IS NULL
      GROUP BY p.id, p.name
      ORDER BY SUM(tp.quantity) DESC
      """)
  List<Object> findTopSellingProducts(
      @Param("storeId") UUID storeId,
      @Param("start") Instant start,
      @Param("end") Instant end,
      Pageable pageable);

  @Query("""
      SELECT new map(
        COUNT(t) as count,
        COALESCE(SUM(t.totalPrice), 0) as totalRevenue
      )
      FROM Transaction t
      WHERE t.storeId = :storeId
        AND t.statusCode = 'COMPLETED'
        AND t.createdAt BETWEEN :start AND :end
        AND t.deletedAt IS NULL
      """)
  Object findSalesSummary(
      @Param("storeId") UUID storeId,
      @Param("start") Instant start,
      @Param("end") Instant end);

  @Query("""
      SELECT new map(
        t.description as name,
        COUNT(t) as count,
        SUM(t.totalPrice) as totalSpent
      )
      FROM Transaction t
      WHERE t.storeId = :storeId
        AND t.statusCode = 'COMPLETED'
        AND t.createdAt BETWEEN :start AND :end
        AND t.deletedAt IS NULL
        AND t.description IS NOT NULL
        AND t.description <> ''
      GROUP BY t.description
      ORDER BY COUNT(t) DESC
      """)
  List<Object> findFrequentDescriptions(
      @Param("storeId") UUID storeId,
      @Param("start") Instant start,
      @Param("end") Instant end,
      Pageable pageable);

  @Query(value = """
      SELECT
        CAST(EXTRACT(HOUR FROM created_at) AS INTEGER) as hour,
        COUNT(*) as count
      FROM transactions
      WHERE store_id = :storeId
        AND status_code = 'COMPLETED'
        AND created_at BETWEEN :start AND :end
        AND deleted_at IS NULL
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY count DESC
      """, nativeQuery = true)
  List<Object[]> findPeakHours(
      @Param("storeId") UUID storeId,
      @Param("start") Instant start,
      @Param("end") Instant end);

  @Query(value = """
      SELECT
        CAST(EXTRACT(ISODOW FROM created_at) AS INTEGER) as dayOfWeek,
        COUNT(*) as count
      FROM transactions
      WHERE store_id = :storeId
        AND status_code = 'COMPLETED'
        AND created_at BETWEEN :start AND :end
        AND deleted_at IS NULL
      GROUP BY EXTRACT(ISODOW FROM created_at)
      ORDER BY count DESC
      """, nativeQuery = true)
  List<Object[]> findBusyDays(
      @Param("storeId") UUID storeId,
      @Param("start") Instant start,
      @Param("end") Instant end);

}
