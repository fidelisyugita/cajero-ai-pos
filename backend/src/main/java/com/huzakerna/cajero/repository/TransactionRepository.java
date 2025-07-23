package com.huzakerna.cajero.repository;

import java.time.LocalDateTime;
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

}
