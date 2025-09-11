package com.huzakerna.cajero.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.huzakerna.cajero.model.ProductCategory;
import com.huzakerna.cajero.repository.ProductCategoryRepository;
import com.huzakerna.cajero.repository.StoreRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductCategoryService {

  private final StoreRepository sRepo;
  private final ProductCategoryRepository repo;
  private final LogService logService;

  public ProductCategory addProductCategory(UUID storeId, ProductCategory request) {
    if (!sRepo.existsById(storeId)) {
      throw new IllegalArgumentException("Store not found");
    }

    return repo.save(
        ProductCategory.builder()
            .code(request.getCode())
            .storeId(storeId)
            .name(request.getName())
            .description(request.getDescription())
            .build());

  }

  public ProductCategory updateProductCategory(UUID storeId, String code, ProductCategory request) {
    // Validate store exists
    if (!sRepo.existsById(storeId)) {
      throw new IllegalArgumentException("Store not found");
    }

    // Find existing productCategory
    ProductCategory productCategory = repo.findById(code)
        .orElseThrow(() -> new RuntimeException("ProductCategory not found"));

    // Verify the productCategory belongs to the store
    if (!productCategory.getStoreId().equals(storeId)) {
      throw new IllegalArgumentException("ProductCategory does not belong to the store");
    }

    // Create log details
    var logDetails = new java.util.HashMap<String, Object>();
    logDetails.put("productCategoryCode", code);
    logDetails.put("oldValues", (productCategory));

    // Update productCategory fields
    productCategory.setName(request.getName());
    productCategory.setDescription(request.getDescription());

    productCategory = repo.save(productCategory);

    // Add new values to log details and create log
    logDetails.put("newValues", (productCategory));
    logService.logAction(storeId, "productCategory", "updated", logDetails);

    return (productCategory);
  }

  // soft delete
  public ProductCategory removeProductCategory(UUID storeId, String code) {
    // Validate store exists
    if (!sRepo.existsById(storeId)) {
      throw new IllegalArgumentException("Store not found");
    }

    // Find existing productCategory
    ProductCategory productCategory = repo.findById(code)
        .orElseThrow(() -> new RuntimeException("ProductCategory not found"));

    // Verify the productCategory belongs to the store
    if (!productCategory.getStoreId().equals(storeId)) {
      throw new IllegalArgumentException("ProductCategory does not belong to the store");
    }

    // Update productCategory fields
    productCategory.setDeletedAt(LocalDateTime.now());

    productCategory = repo.save(productCategory);

    // Create log details
    var logDetails = new java.util.HashMap<String, Object>();
    logDetails.put("productCategoryCode", code);
    logService.logAction(storeId, "productCategory", "deleted", logDetails);

    return (productCategory);
  }

}
