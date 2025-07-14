package com.huzakerna.cajero.controller;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.huzakerna.cajero.model.MeasureUnit;
import com.huzakerna.cajero.model.ProductCategory;
import com.huzakerna.cajero.repository.ProductCategoryRepository;

@RestController
@RequestMapping("/api/product-category")
public class ProductCategoryController {

    @Autowired
    private ProductCategoryRepository repo;

    @GetMapping
    public List<ProductCategory> getAll() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<ProductCategory>> getProductCategoryById(
        @PathVariable String id) {
        return ResponseEntity.ok(repo.findById(id));
    }

    @PostMapping
    public ProductCategory create(@RequestBody ProductCategory productCategory) {
        return repo.save(productCategory);
    }
}
