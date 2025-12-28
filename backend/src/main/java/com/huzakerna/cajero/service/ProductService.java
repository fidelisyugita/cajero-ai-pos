package com.huzakerna.cajero.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
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
import com.huzakerna.cajero.repository.IngredientRepository;
import com.huzakerna.cajero.repository.MeasureUnitRepository;
import com.huzakerna.cajero.repository.ProductIngredientRepository;
import com.huzakerna.cajero.model.Ingredient;
import com.huzakerna.cajero.repository.StoreRepository;

import com.huzakerna.cajero.util.ChangeTracker;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Lombok will auto-inject the dependency
@Transactional
public class ProductService {

  private final StoreRepository sRepo;
  private final ProductRepository repo;
  private final ProductIngredientRepository piRepo;
  private final IngredientRepository iRepo;
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

    Product product = repo.findById(productId)
        .orElseThrow(() -> new RuntimeException("Product not found"));

    Ingredient ingredient = iRepo.findById(ingredientId)
        .orElseThrow(() -> new RuntimeException("Ingredient not found"));

    ProductIngredient productIngredient = new ProductIngredient();
    productIngredient.setId(new ProductIngredientId(productId, ingredientId));
    productIngredient.setQuantityNeeded(quantityNeeded);
    productIngredient.setProduct(product);
    productIngredient.setIngredient(ingredient);

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

  public ProductResponse getProductById(UUID storeId, UUID id) {
    Product product = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Product not found"));

    if (!product.getStoreId().equals(storeId)) {
      throw new IllegalArgumentException("Product does not belong to the store");
    }

    return mapToResponse(product);
  }

  public Page<ProductResponse> getProducts(UUID storeId,
      int page,
      int size,
      String sortBy,
      String sortDir,
      String keyword,
      String categoryCode,
      boolean includeDeleted,
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
        storeId, categoryCode, keyword, includeDeleted, start, end, pageable);

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

    List<ProductIngredientRequest> newIngredients = request.getIngredients() != null
        ? new ArrayList<>(request.getIngredients())
        : new ArrayList<>();

    // Create maps for O(1) lookups to efficiently compare old vs new state
    Map<UUID, ProductIngredientRequest> oldMap = product.getIngredients().stream()
        .collect(java.util.stream.Collectors.toMap(
            pi -> pi.getIngredient().getId(),
            pi -> ProductIngredientRequest.builder()
                .ingredientId(pi.getIngredient().getId())
                .quantityNeeded(pi.getQuantityNeeded())
                .build()));

    Map<UUID, ProductIngredientRequest> newMap = newIngredients.stream()
        .collect(java.util.stream.Collectors.toMap(ProductIngredientRequest::getIngredientId, i -> i));

    // 1. Track Modified & Added Ingredients
    for (ProductIngredientRequest newIng : newIngredients) {
      if (oldMap.containsKey(newIng.getIngredientId())) {
        // Ingredient exists in both -> Check if quantity changed
        ProductIngredientRequest oldIng = oldMap.get(newIng.getIngredientId());
        // Custom equals() in DTO handles BigDecimal scale comparison (e.g. 19.00 vs 19)
        if (!oldIng.equals(newIng)) {
          changeTracker.compareAndTrack("ingredient," + newIng.getIngredientId(),
              oldIng.getQuantityNeeded(),
              newIng.getQuantityNeeded());
        }
      } else {
        // Ingredient is new
        changeTracker.compareAndTrack("ingredient," + newIng.getIngredientId(),
            null,
            newIng.getQuantityNeeded());
      }
    }

    // 2. Track Removed Ingredients
    for (UUID oldId : oldMap.keySet()) {
      if (!newMap.containsKey(oldId)) {
        changeTracker.compareAndTrack("ingredient," + oldId,
            oldMap.get(oldId).getQuantityNeeded(),
            null);
      }
    }

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

    // Handle ingredients
    Set<ProductIngredient> newIngredientSet = new HashSet<>();
    if (request.getIngredients() != null) {
      for (ProductIngredientRequest ingReq : request.getIngredients()) {
        Ingredient ingredient = iRepo.findById(ingReq.getIngredientId())
            .orElseThrow(() -> new EntityNotFoundException("Ingredient not found: " + ingReq.getIngredientId()));

        ProductIngredient pi = new ProductIngredient();
        pi.setId(new ProductIngredientId(product.getId(), ingredient.getId()));
        pi.setProduct(product);
        pi.setIngredient(ingredient);
        pi.setQuantityNeeded(ingReq.getQuantityNeeded());
        newIngredientSet.add(pi);
      }
    }

    // Safely update ingredients collection
    product.setIngredients(newIngredientSet);

    // Save product (Hibernate handles changes)
    product = repo.save(product);

    // Only add oldValues and newValues to log details if there were changes
    if (changeTracker.hasChanges()) {
      logService.logAction(storeId, "product", "updated", product.getId(), product.getName(),
          changeTracker.getChanges());
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

    // Log action
    logService.logAction(storeId, "product", "deleted", product.getId(), product.getName(), null);

    return mapToResponse(product);
  }

  public ProductResponse restoreProduct(UUID storeId, UUID id) {
    // Validate store exists
    if (!sRepo.existsById(storeId)) {
      throw new IllegalArgumentException("Store not found");
    }

    // Find existing product including deleted ones
    Product product = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Product not found"));

    // Verify the product belongs to the store
    if (!product.getStoreId().equals(storeId)) {
      throw new IllegalArgumentException("Product does not belong to the store");
    }

    // Update product fields
    product.setDeletedAt(null);

    product = repo.save(product);

    // Create log details
    var logDetails = new HashMap<String, Object>();
    logDetails.put("productId", id);
    logService.logAction(storeId, "product", "restored", product.getId(), product.getName(), null);

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
        .createdBy(product.getCreatedBy() != null ? product.getCreatedBy().getId() : null)
        .createdByName(product.getCreatedBy() != null ? product.getCreatedBy().getName() : null)
        .updatedBy(product.getUpdatedBy() != null ? product.getUpdatedBy().getId() : null)
        .updatedByName(product.getUpdatedBy() != null ? product.getUpdatedBy().getName() : null)
        .createdAt(product.getCreatedAt())
        .updatedAt(product.getUpdatedAt())
        .deletedAt(product.getDeletedAt())
        .ingredients(product.getIngredients() != null ? product.getIngredients().stream()
            .map(pi -> ProductIngredientResponse.builder()
                .ingredientId(pi.getIngredient().getId())
                .name(pi.getIngredient().getName())
                .description(pi.getIngredient().getDescription())
                .stock(pi.getIngredient().getStock())
                .measureUnitCode(pi.getIngredient().getMeasureUnit().getCode())
                .measureUnitName(pi.getIngredient().getMeasureUnit().getName())
                .quantityNeeded(pi.getQuantityNeeded())
                .build())
            .toList() : List.of())
        .build();
  }
}
