package com.huzakerna.cajero.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @PostMapping
    public ProductCategory create(@RequestBody ProductCategory productCategory) {
        return repo.save(productCategory);
    }
}
