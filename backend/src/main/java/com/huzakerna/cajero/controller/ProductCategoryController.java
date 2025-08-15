package com.huzakerna.cajero.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.huzakerna.cajero.model.ProductCategory;
import com.huzakerna.cajero.repository.ProductCategoryRepository;
import com.huzakerna.cajero.security.UserDetailsImpl;
import com.huzakerna.cajero.service.ProductCategoryService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/product-category")
@RequiredArgsConstructor
public class ProductCategoryController {

    private final ProductCategoryRepository repo;
    private final ProductCategoryService service;

    @GetMapping
    public ResponseEntity<List<ProductCategory>> getAll(
        @AuthenticationPrincipal UserDetailsImpl user) {
        UUID storeId = user.getStoreId();

        return ResponseEntity.ok(repo.findByStoreId(storeId));
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

}
