package com.huzakerna.cajero.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.huzakerna.cajero.model.PettyCash;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.EntityGraph;

@Repository
public interface PettyCashRepository extends JpaRepository<PettyCash, UUID> {

  @EntityGraph(attributePaths = { "createdBy", "updatedBy" })
  List<PettyCash> findByStoreId(UUID storeId);

  @EntityGraph(attributePaths = { "createdBy", "updatedBy" })
  Page<PettyCash> findAllByStoreIdAndCreatedAtBetween(UUID storeId, LocalDateTime start, LocalDateTime end,
      Pageable pageable);

  @Query("""
      SELECT SUM(p.amount)
      FROM PettyCash p
      WHERE p.storeId = :storeId
        AND p.isIncome = false
        AND p.deletedAt IS NULL
        AND p.createdAt BETWEEN :start AND :end
      """)
  BigDecimal findTotalExpenses(
      @Param("storeId") UUID storeId,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);

  @Query("""
      SELECT
        CAST(p.createdAt AS LocalDate) as date,
        SUM(p.amount)
      FROM PettyCash p
      WHERE p.storeId = :storeId
        AND p.isIncome = false
        AND p.deletedAt IS NULL
        AND p.createdAt BETWEEN :start AND :end
      GROUP BY CAST(p.createdAt AS LocalDate)
      """)
  List<Object[]> findExpensesDaily(
      @Param("storeId") UUID storeId,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);
}
