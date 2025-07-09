package com.huzakerna.cajero.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.huzakerna.cajero.dto.ProductRequest;
import com.huzakerna.cajero.model.Product;
import com.huzakerna.cajero.repository.ProductRepository;
import com.huzakerna.cajero.service.ProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor // Lombok generates constructor with required args
public class ProductController {

    private final ProductRepository repo;
    private final ProductService service; // Must be final for Lombok

    @GetMapping
    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getProductById(id));
    }

    @PostMapping
    public Product addProduct(@Valid @RequestBody ProductRequest product) {
        return service.addProduct(product);
    }
}
