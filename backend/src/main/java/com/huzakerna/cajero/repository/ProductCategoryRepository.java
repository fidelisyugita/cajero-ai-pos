package com.huzakerna.cajero.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.huzakerna.cajero.model.ProductCategory;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, String> {

    List<ProductCategory> findByStoreId(UUID storeId);

    List<ProductCategory> findByStoreIdAndDeletedAtIsNull(UUID storeId);
}
