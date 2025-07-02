package com.huzakerna.cajero.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.huzakerna.cajero.model.ProductCategory;
import com.huzakerna.cajero.repository.ProductCategoryRepository;
import com.huzakerna.cajero.service.ProductCategoryService;

@RestController
@RequestMapping("/api/product-category")
public class ProductCategoryController {

    @Autowired
    private ProductCategoryRepository repo;
    private ProductCategoryService service;

    @GetMapping
    public List<ProductCategory> getAllProductCategories() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductCategory> getProductCategoryById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getProductCategoryById(id));
    }

    @PostMapping
    public ProductCategory addProductCategory(@RequestBody ProductCategory productCategory) {
        return repo.save(productCategory);
    }
}
