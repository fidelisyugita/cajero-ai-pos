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

@Service
@RequiredArgsConstructor
@Slf4j
public class StockMovementService {

  private final StoreRepository sRepo;
  private final StockMovementRepository repo;
  private final IngredientRepository ingredientRepo;
  private final ProductRepository productRepo;

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
