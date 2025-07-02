package com.huzakerna.cajero.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.huzakerna.cajero.model.ProductCategory;
import com.huzakerna.cajero.repository.ProductCategoryRepository;

@Service
public class ProductCategoryService {

    @Autowired
    private ProductCategoryRepository repo;

    public ProductCategory addProductCategory(ProductCategory productCategory) {
        return repo.save(productCategory);
    }

    public ProductCategory getProductCategoryById(UUID id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product category not found"));
    }
}
