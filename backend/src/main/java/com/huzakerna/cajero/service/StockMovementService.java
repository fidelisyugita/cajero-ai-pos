package com.huzakerna.cajero.service;

import org.springframework.stereotype.Service;

import com.huzakerna.cajero.model.StockMovement;
import com.huzakerna.cajero.repository.StockMovementRepository;
import com.huzakerna.cajero.repository.StoreRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Lombok will auto-inject the dependency
public class StockMovementService {

  private final StoreRepository sRepo;
  private final StockMovementRepository repo;

  public StockMovement addStockMovement(StockMovement request) {
    // Validate store exists
    if (!sRepo.existsById(request.getStoreId())) {
      throw new IllegalArgumentException("Store not found");
    }

    return repo.save(
        StockMovement.builder()
            .storeId(request.getStoreId())
            .ingredientId(request.getIngredientId())
            .productId(request.getProductId())
            .transactionId(request.getTransactionId())

            .type(request.getType())
            .quantity(request.getQuantity())
            .build());

  }

}
