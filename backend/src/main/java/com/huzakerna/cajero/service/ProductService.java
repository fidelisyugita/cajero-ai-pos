package com.huzakerna.cajero.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.huzakerna.cajero.dto.ProductRequest;
import com.huzakerna.cajero.model.MeasureUnit;
import com.huzakerna.cajero.model.Product;
import com.huzakerna.cajero.model.ProductCategory;
import com.huzakerna.cajero.model.Store;
import com.huzakerna.cajero.repository.MeasureUnitRepository;
import com.huzakerna.cajero.repository.ProductCategoryRepository;
import com.huzakerna.cajero.repository.ProductRepository;
import com.huzakerna.cajero.repository.StoreRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Lombok will auto-inject the dependency
public class ProductService {

        private final StoreRepository sRepo;
        private final ProductRepository repo;
        private final ProductCategoryRepository cRepo;
        private final MeasureUnitRepository muRepo;

        public Product addProduct(ProductRequest request) {
                // return repo.save(request);


                Store store = sRepo.findById(request.getStoreId())
                        .orElseThrow(
                                () -> new EntityNotFoundException("Store not found"));

                ProductCategory category = cRepo.findById(request.getCategoryCode())
                        .orElseThrow(
                                () -> new EntityNotFoundException("Product Category not found"));

                MeasureUnit measureUnit = muRepo.findById(request.getMeasureUnitCode())
                        .orElseThrow(() -> new EntityNotFoundException("Measure Unit not found"));

                return repo.save(
                        Product.builder()
                                .name(request.getName())
                                .store(store)
                                .description(request.getDescription())
                                .buyingPrice(request.getBuyingPrice())
                                .sellingPrice(request.getSellingPrice())
                                .stock(request.getStock())
                                .category(category)
                                .measureUnit(measureUnit)
                                // Set other fields
                                .build());

        }

        public Product getProductById(UUID id) {
                return repo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Product not found"));
        }
}
