package com.huzakerna.cajero.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.huzakerna.cajero.dto.ProductIngredientRequest;
import com.huzakerna.cajero.dto.ProductIngredientResponse;
import com.huzakerna.cajero.dto.ProductRequest;
import com.huzakerna.cajero.dto.ProductResponse;
import com.huzakerna.cajero.model.MeasureUnit;
import com.huzakerna.cajero.model.Product;
import com.huzakerna.cajero.model.ProductIngredient;
import com.huzakerna.cajero.model.ProductIngredientId;
import com.huzakerna.cajero.repository.ProductRepository;
import com.huzakerna.cajero.repository.MeasureUnitRepository;
import com.huzakerna.cajero.repository.ProductIngredientRepository;
import com.huzakerna.cajero.repository.StoreRepository;

import com.huzakerna.cajero.util.ChangeTracker;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Lombok will auto-inject the dependency
public class ProductService {

  private final StoreRepository sRepo;
  private final ProductRepository repo;
  private final ProductIngredientRepository piRepo;
  private final MeasureUnitRepository muRepo;
  private final LogService logService;

  public ProductResponse addProduct(UUID storeId, ProductRequest request) {
    // Validate store exists
    if (!sRepo.existsById(storeId)) {
      throw new IllegalArgumentException("Store not found");
    }
    MeasureUnit measureUnit = muRepo.findById(request.getMeasureUnitCode())
        .orElseThrow(
            () -> new EntityNotFoundException("Measure Unit not found"));

    Product product = repo.save(
        Product.builder()
            .name(request.getName())
            .storeId(storeId)
            .description(request.getDescription())
            .buyingPrice(request.getBuyingPrice())
            .sellingPrice(request.getSellingPrice())
            .stock(request.getStock())
            .categoryCode(request.getCategoryCode())
            .measureUnit(measureUnit)
            .imageUrl(request.getImageUrl())
            .barcode(request.getBarcode())
            .commission(request.getCommission())
            .discount(request.getDiscount())
            .tax(request.getTax())
            .build());

    // Add product ingredients if any
    if (request.getIngredients() != null) {
      for (ProductIngredientRequest ingredient : request.getIngredients()) {
        addIngredientToProduct(product.getId(),
            ingredient.getIngredientId(),
            ingredient.getQuantityNeeded());
      }
    }

    return mapToResponse(product);
  }

  public void addIngredientToProduct(UUID productId, UUID ingredientId,
      BigDecimal quantityNeeded) {

    ProductIngredient productIngredient = new ProductIngredient();
    productIngredient.setId(new ProductIngredientId(productId, ingredientId));
    productIngredient.setQuantityNeeded(quantityNeeded);

    piRepo.save(productIngredient);
  }

  public void removeIngredientFromProduct(UUID productId, UUID ingredientId) {
    ProductIngredient productIngredient = new ProductIngredient();
    productIngredient.setId(new ProductIngredientId(productId, ingredientId));

    piRepo.delete(productIngredient);
  }

  public void removeIngredientFromProduct(UUID productId, List<UUID> ingredientIds) {
    List<ProductIngredientId> productIngredients = ingredientIds.stream()
        .map(ingredientId -> new ProductIngredientId(productId, ingredientId))
        .toList();

    piRepo.deleteAllByIdInBatch(productIngredients);
  }

  public ProductResponse getProductById(UUID id) {
    Product product = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Product not found"));
    return mapToResponse(product);
  }

  public Page<ProductResponse> getProducts(UUID storeId,
      int page,
      int size,
      String sortBy,
      String sortDir,
      String keyword,
      String categoryCode,
      LocalDate startDate,
      LocalDate endDate) {
    Pageable pageable = PageRequest.of(page, size,
        sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending()
            : Sort.by(sortBy).ascending());

    // fallback to 1970 and now if null
    LocalDateTime start = startDate != null ? startDate.atStartOfDay()
        : LocalDate.of(1970, 1, 1).atStartOfDay();
    LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.now();

    Page<Product> productPage = repo.findFiltered(
        storeId, categoryCode, keyword, start, end, pageable);

    return productPage.map(this::mapToResponse);
  }

  public List<ProductResponse> getAllProducts() {
    return repo.findAll().stream()
        .map(this::mapToResponse)
        .toList();
  }

  public ProductResponse updateProduct(UUID storeId, UUID id, ProductRequest request) {
    // Validate store exists
    if (!sRepo.existsById(storeId)) {
      throw new IllegalArgumentException("Store not found");
    }

    // Find existing product
    Product product = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Product not found"));

    // Verify the product belongs to the store
    if (!product.getStoreId().equals(storeId)) {
      throw new IllegalArgumentException("Product does not belong to the store");
    }

    MeasureUnit measureUnit = muRepo.findById(request.getMeasureUnitCode())
        .orElseThrow(
            () -> new EntityNotFoundException("Measure Unit not found"));

    // Create log details
    var logDetails = new java.util.HashMap<String, Object>();
    logDetails.put("productId", id);

    // Create change tracker
    ChangeTracker changeTracker = new ChangeTracker();
    // Compare and store only changed values
    changeTracker.compareAndTrack("name", product.getName(), request.getName());
    changeTracker.compareAndTrack("description", product.getDescription(), request.getDescription());
    changeTracker.compareAndTrack("buyingPrice", product.getBuyingPrice(), request.getBuyingPrice());
    changeTracker.compareAndTrack("sellingPrice", product.getSellingPrice(), request.getSellingPrice());
    changeTracker.compareAndTrack("stock", product.getStock(), request.getStock());
    changeTracker.compareAndTrack("categoryCode", product.getCategoryCode(), request.getCategoryCode());
    changeTracker.compareAndTrack("measureUnitCode", product.getMeasureUnit().getCode(), request.getMeasureUnitCode());
    changeTracker.compareAndTrack("imageUrl", product.getImageUrl(), request.getImageUrl());
    changeTracker.compareAndTrack("barcode", product.getBarcode(), request.getBarcode());
    changeTracker.compareAndTrack("commission", product.getCommission(), request.getCommission());
    changeTracker.compareAndTrack("discount", product.getDiscount(), request.getDiscount());
    changeTracker.compareAndTrack("tax", product.getTax(), request.getTax());
    changeTracker.compareAndTrack("ingredients", product.getIngredients(), request.getIngredients());

    // Update product fields
    product.setName(request.getName());
    product.setDescription(request.getDescription());
    product.setBuyingPrice(request.getBuyingPrice());
    product.setSellingPrice(request.getSellingPrice());
    product.setStock(request.getStock());
    product.setCategoryCode(request.getCategoryCode());
    product.setMeasureUnit(measureUnit);
    product.setImageUrl(request.getImageUrl());
    product.setBarcode(request.getBarcode());
    product.setCommission(request.getCommission());
    product.setDiscount(request.getDiscount());
    product.setTax(request.getTax());

    // Remove existing product ingredients
    // piRepo.deleteByProductId(id);
    List<UUID> removedIngredientIds = product.getIngredients().stream()
        .filter(pi -> request.getIngredients() == null || request.getIngredients().stream()
            .noneMatch(ri -> ri.getIngredientId().equals(pi.getIngredient().getId())))
        .map(pi -> pi.getIngredient().getId())
        .toList();

    removeIngredientFromProduct(product.getId(), removedIngredientIds);

    // Add product ingredients if any
    if (request.getIngredients() != null) {
      for (ProductIngredientRequest ingredient : request.getIngredients()) {
        if (product.getIngredients().stream()
            .noneMatch(pi -> pi.getIngredient().getId().equals(ingredient.getIngredientId()))) {
          addIngredientToProduct(product.getId(),
              ingredient.getIngredientId(),
              ingredient.getQuantityNeeded());
        }
      }
    }

    product = repo.save(product);

    // Only add oldValues and newValues to log details if there were changes
    if (changeTracker.hasChanges()) {
      logDetails.put("oldValues", changeTracker.getOldValues());
      logDetails.put("newValues", changeTracker.getNewValues());
      logService.logAction(storeId, "product", "updated", logDetails);
    }

    return mapToResponse(product);
  }

  // soft delete
  public ProductResponse removeProduct(UUID storeId, UUID id) {
    // Validate store exists
    if (!sRepo.existsById(storeId)) {
      throw new IllegalArgumentException("Store not found");
    }

    // Find existing product
    Product product = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Product not found"));

    // Verify the product belongs to the store
    if (!product.getStoreId().equals(storeId)) {
      throw new IllegalArgumentException("Product does not belong to the store");
    }

    // Update product fields
    product.setDeletedAt(LocalDateTime.now());

    product = repo.save(product);

    // Create log details
    var logDetails = new HashMap<String, Object>();
    logDetails.put("productId", id);
    logService.logAction(storeId, "product", "deleted", logDetails);

    return mapToResponse(product);
  }

  private ProductResponse mapToResponse(Product product) {
    return ProductResponse.builder()
        .id(product.getId())
        .storeId(product.getStoreId())
        .name(product.getName())
        .imageUrl(product.getImageUrl())
        .description(product.getDescription())
        .stock(product.getStock())
        .rejectCount(product.getRejectCount())
        .soldCount(product.getSoldCount())
        .categoryCode(product.getCategoryCode())
        .measureUnitCode(product.getMeasureUnit().getCode())
        .measureUnitName(product.getMeasureUnit().getName())
        .buyingPrice(product.getBuyingPrice())
        .sellingPrice(product.getSellingPrice())
        .barcode(product.getBarcode())
        .commission(product.getCommission())
        .discount(product.getDiscount())
        .tax(product.getTax())
        .createdBy(product.getCreatedBy())
        .updatedBy(product.getUpdatedBy())
        .createdAt(product.getCreatedAt())
        .updatedAt(product.getUpdatedAt())
        .ingredients(product.getIngredients().stream()
            .map(pi -> ProductIngredientResponse.builder()
                .ingredientId(pi.getIngredient().getId())
                .name(pi.getIngredient().getName())
                .description(pi.getIngredient().getDescription())
                .stock(pi.getIngredient().getStock())
                .measureUnitCode(pi.getIngredient().getMeasureUnit().getCode())
                .measureUnitName(pi.getIngredient().getMeasureUnit().getName())
                .quantityNeeded(pi.getQuantityNeeded())
                .build())
            .toList())
        .build();
  }
}
