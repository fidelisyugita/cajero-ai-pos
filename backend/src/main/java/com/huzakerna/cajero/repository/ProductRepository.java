package com.huzakerna.cajero.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import com.huzakerna.cajero.model.Product;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    List<Product> findByCategoryCode(String categoryCode);

    List<Product> findByStoreId(UUID storeId);
}
