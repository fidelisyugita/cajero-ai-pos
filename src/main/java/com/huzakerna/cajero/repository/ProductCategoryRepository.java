package com.huzakerna.cajero.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.huzakerna.cajero.model.ProductCategory;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, UUID> {
    // Inherits CRUD methods like save(), findAll(), etc.

}
