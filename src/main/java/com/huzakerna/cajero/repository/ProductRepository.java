package com.huzakerna.cajero.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.huzakerna.cajero.model.Product;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    // Inherits CRUD methods like save(), findAll(), etc.

    List<Product> findByCategoryId(UUID categoryId);
}
