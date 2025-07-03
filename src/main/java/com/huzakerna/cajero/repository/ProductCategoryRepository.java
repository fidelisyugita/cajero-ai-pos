package com.huzakerna.cajero.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.huzakerna.cajero.model.ProductCategory;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, String> {
    // Inherits CRUD methods like save(), findAll(), etc.

}
