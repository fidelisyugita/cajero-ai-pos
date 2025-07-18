package com.huzakerna.cajero.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
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
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/product-category")
@RequiredArgsConstructor // Lombok generates constructor with required args
public class ProductCategoryController {

    private ProductCategoryRepository repo;
    private ProductCategoryService service;

    @GetMapping
    public List<ProductCategory> getAll() {
        return repo.findAll();
    }

    @PostMapping
    public ProductCategory add(@RequestBody ProductCategory productCategory) {
        return service.addProductCategory(productCategory);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<ProductCategory>> getById(
        @PathVariable String id) {
        return ResponseEntity.ok(repo.findById(id));
    }

    @GetMapping("/store/{id}")
    public ResponseEntity<List<ProductCategory>> getAllByStoreId(@PathVariable UUID id) {
        return ResponseEntity.ok(repo.findByStoreId(id));
    }
}
