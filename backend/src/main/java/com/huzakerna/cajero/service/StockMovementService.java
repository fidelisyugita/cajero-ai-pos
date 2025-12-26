package com.huzakerna.cajero.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import com.huzakerna.cajero.repository.IngredientRepository;
import com.huzakerna.cajero.repository.ProductRepository;
import org.springframework.transaction.annotation.Transactional;
import com.huzakerna.cajero.model.StockMovement;
import com.huzakerna.cajero.repository.StockMovementRepository;
import com.huzakerna.cajero.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.huzakerna.cajero.model.StockMovementType;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockMovementService {

  private final StoreRepository sRepo;
  private final StockMovementRepository repo;
  private final IngredientRepository ingredientRepo;
  private final ProductRepository productRepo;

  public Page<StockMovement> getStockMovements(
      UUID storeId, int page, int size, String sortBy, String sortDir,
      LocalDate startDate, LocalDate endDate, UUID ingredientId, UUID productId, String typeCode) {

    Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
        : Sort.by(sortBy).descending();
    Pageable pageable = PageRequest.of(page, size, sort);

    Specification<StockMovement> spec = (root, query, cb) -> {
      List<Predicate> predicates = new ArrayList<>();
      predicates.add(cb.equal(root.get("storeId"), storeId));
      predicates.add(cb.isNull(root.get("deletedAt")));

      if (ingredientId != null) {
        predicates.add(cb.equal(root.get("ingredientId"), ingredientId));
      }
      if (productId != null) {
        predicates.add(cb.equal(root.get("productId"), productId));
      }
      if (startDate != null) {
        predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate.atStartOfDay()));
      }
      if (endDate != null) {
        predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate.atTime(23, 59, 59)));
      }
      if (typeCode != null && !typeCode.isEmpty()) {
        try {
          StockMovementType type = StockMovementType.valueOf(typeCode);
          predicates.add(cb.equal(root.get("type"), type));
        } catch (IllegalArgumentException e) {
          // Ignore invalid type
        }
      }

      return cb.and(predicates.toArray(new Predicate[0]));
    };

    return repo.findAll(spec, pageable);
  }

  @Transactional
  public StockMovement addStockMovement(UUID storeId, StockMovement request) {
    // Validate store exists
    if (!sRepo.existsById(storeId)) {
      throw new IllegalArgumentException("Store not found");
    }

    // Update Stock Logic
    if (request.getIngredientId() != null) {
      updateIngredientStock(request);
    } else if (request.getProductId() != null) {
      updateProductStock(request);
      return request; // Currently product update not affect stock movement
                      // since tracked in transaction
    }

    // Ensure storeId is set
    request.setStoreId(storeId);

    return repo.save(request);
  }

  private void updateIngredientStock(StockMovement movement) {
    var ingredient = ingredientRepo.findById(movement.getIngredientId())
        .orElseThrow(() -> new RuntimeException("Ingredient not found"));

    BigDecimal quantity = movement.getQuantity();
    if (quantity == null)
      return;

    switch (movement.getType()) {
      case SALE:
      case WASTE:
        ingredient.setStock(ingredient.getStock().subtract(quantity));
        break;
      case PURCHASE:
      case REFUND:
      case ADJUSTMENT:
        ingredient.setStock(ingredient.getStock().add(quantity));
        break;
    }
    log.info("Stock updated for Ingredient {} ({}): {} {}", ingredient.getId(), ingredient.getName(),
        movement.getType(), quantity);
    ingredientRepo.save(ingredient);
  }

  private void updateProductStock(StockMovement movement) {
    var product = productRepo.findById(movement.getProductId())
        .orElseThrow(() -> new RuntimeException("Product not found"));

    BigDecimal quantity = movement.getQuantity();
    if (quantity == null)
      return;

    switch (movement.getType()) {
      case SALE:
      case WASTE:
        // For products, usually SALE reduces stock
        if (product.getStock() != null) {
          product.setStock(product.getStock().subtract(quantity));
        }
        break;
      case PURCHASE:
      case REFUND:
      case ADJUSTMENT:
        if (product.getStock() != null) {
          product.setStock(product.getStock().add(quantity));
        }
        break;
    }
    log.info("Stock updated for Product {} ({}): {} {}", product.getId(), product.getName(), movement.getType(),
        quantity);
    productRepo.save(product);
  }
}
