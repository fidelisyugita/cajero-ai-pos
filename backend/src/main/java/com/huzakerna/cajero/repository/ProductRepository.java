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

    @org.springframework.data.jpa.repository.Modifying
    @Query("""
            UPDATE Product p SET
            p.name = :name,
            p.description = :description,
            p.buyingPrice = :buyingPrice,
            p.sellingPrice = :sellingPrice,
            p.stock = :stock,
            p.categoryCode = :categoryCode,
            p.measureUnit = :measureUnit,
            p.imageUrl = :imageUrl,
            p.barcode = :barcode,
            p.commission = :commission,
            p.discount = :discount,
            p.tax = :tax
            WHERE p.id = :id AND p.storeId = :storeId
            """)
    void updateProductDetails(
            @Param("id") UUID id,
            @Param("storeId") UUID storeId,
            @Param("name") String name,
            @Param("description") String description,
            @Param("buyingPrice") java.math.BigDecimal buyingPrice,
            @Param("sellingPrice") java.math.BigDecimal sellingPrice,
            @Param("stock") java.math.BigDecimal stock,
            @Param("categoryCode") String categoryCode,
            @Param("measureUnit") com.huzakerna.cajero.model.MeasureUnit measureUnit,
            @Param("imageUrl") String imageUrl,
            @Param("barcode") String barcode,
            @Param("commission") java.math.BigDecimal commission,
            @Param("discount") java.math.BigDecimal discount,
            @Param("tax") java.math.BigDecimal tax);
}
