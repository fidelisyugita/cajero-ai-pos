package com.huzakerna.cajero.repository;

import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.huzakerna.cajero.model.Product;

import org.springframework.data.jpa.repository.EntityGraph;

public interface ProductRepository extends JpaRepository<Product, UUID> {

        @EntityGraph(attributePaths = { "createdBy", "updatedBy" })
        @Query("""
                            SELECT p FROM Product p
                            WHERE p.storeId = :storeId
                              AND (:categoryCode IS NULL OR p.categoryCode = :categoryCode)
                              AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
                              AND (:includeDeleted = true OR p.deletedAt IS NULL)
                              AND p.createdAt BETWEEN :start AND :end
                        """)
        Page<Product> findFiltered(
                        @Param("storeId") UUID storeId,
                        @Param("categoryCode") String categoryCode,
                        @Param("keyword") String keyword,
                        @Param("includeDeleted") boolean includeDeleted,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end,
                        Pageable pageable);

}
