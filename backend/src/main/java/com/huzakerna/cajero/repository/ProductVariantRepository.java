package com.huzakerna.cajero.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.huzakerna.cajero.model.ProductVariant;
import com.huzakerna.cajero.model.ProductVariantId;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, ProductVariantId> {

    List<ProductVariant> findByProductId(UUID productId);

    List<ProductVariant> findByVariantId(UUID variantId);
}
