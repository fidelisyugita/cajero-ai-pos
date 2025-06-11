package com.huzakerna.cajero.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.huzakerna.cajero.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    // Inherits CRUD methods like save(), findAll(), etc.
}
