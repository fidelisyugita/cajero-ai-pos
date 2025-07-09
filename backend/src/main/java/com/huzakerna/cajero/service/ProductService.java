package com.huzakerna.cajero.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.huzakerna.cajero.dto.ProductRequest;
import com.huzakerna.cajero.model.MeasureUnit;
import com.huzakerna.cajero.model.Product;
import com.huzakerna.cajero.model.ProductCategory;
import com.huzakerna.cajero.repository.MeasureUnitRepository;
import com.huzakerna.cajero.repository.ProductCategoryRepository;
import com.huzakerna.cajero.repository.ProductRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Lombok will auto-inject the dependency
public class ProductService {

    private final ProductRepository repo;
    private final ProductCategoryRepository cRepo;
    private final MeasureUnitRepository muRepo;

    public Product addProduct(ProductRequest product) {
        // return repo.save(product);

        ProductCategory category = cRepo.findById(product.getCategoryCode())
                .orElseThrow(() -> new EntityNotFoundException("Product Category not found"));

        MeasureUnit measureUnit = muRepo.findById(product.getMeasureUnitCode())
                .orElseThrow(() -> new EntityNotFoundException("Measure Unit not found"));

        return repo.save(
                Product.builder()
                        .name(product.getName())
                        .note(product.getNote())
                        .buyingPrice(product.getBuyingPrice())
                        .sellingPrice(product.getSellingPrice())
                        .stock(product.getStock())
                        .category(category)
                        .measureUnit(measureUnit)
                        // Set other fields
                        .build()
        );

    }

    public Product getProductById(UUID id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }
}
