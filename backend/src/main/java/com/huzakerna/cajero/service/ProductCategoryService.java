package com.huzakerna.cajero.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.huzakerna.cajero.model.ProductCategory;
import com.huzakerna.cajero.repository.ProductCategoryRepository;
import com.huzakerna.cajero.repository.StoreRepository;
import com.huzakerna.cajero.util.ChangeTracker;

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
    var logDetails = new HashMap<String, Object>();
    logDetails.put("productCategoryCode", code);

    // Create change tracker
    ChangeTracker changeTracker = new ChangeTracker();
    // Compare and store only changed values
    changeTracker.compareAndTrack("name", productCategory.getName(), request.getName());
    changeTracker.compareAndTrack("description", productCategory.getDescription(), request.getDescription());

    // Update productCategory fields
    productCategory.setName(request.getName());
    productCategory.setDescription(request.getDescription());

    productCategory = repo.save(productCategory);

    // Only add oldValues and newValues to log details if there were changes
    if (changeTracker.hasChanges()) {
      logService.logAction(storeId, "productCategory", "updated",
          UUID.nameUUIDFromBytes(productCategory.getCode().getBytes()), productCategory.getName(),
          changeTracker.getChanges());
    }

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

    // Log action
    logService.logAction(storeId, "productCategory", "deleted",
        UUID.nameUUIDFromBytes(productCategory.getCode().getBytes()), productCategory.getName(),
        null);

    return (productCategory);
  }

}
