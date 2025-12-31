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
import com.huzakerna.cajero.repository.VariantOptionRepository;

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
import com.huzakerna.cajero.dto.StockMovementResponse;
import com.huzakerna.cajero.model.StockMovementType;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockMovementService {

  private final StoreRepository sRepo;
  private final StockMovementRepository repo;
  private final IngredientRepository ingredientRepo;
  private final ProductRepository productRepo;
  private final VariantOptionRepository variantOptionRepo;

  public Page<StockMovementResponse> getStockMovements(
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

    return repo.findAll(spec, pageable).map(this::mapToResponse);
  }

  private StockMovementResponse mapToResponse(StockMovement sm) {
    String transactionDesc = null;

    if (sm.getTransaction() != null) {
      transactionDesc = sm.getTransaction().getDescription();
      // Since we don't have direct customer object in Transaction (only ID),
      // we might not get customer name easily unless we link Customer to Transaction
      // too.
      // For now, let's just use description.
      // Update: Transaction model DOES have customerId only. We'd need to fetch
      // customer or join in Transaction.
      // Let's stick to description for now and CreatedBy.
    }

    return StockMovementResponse.builder()
        .id(sm.getId())
        .storeId(sm.getStoreId())
        .ingredientId(sm.getIngredientId())
        .productId(sm.getProductId())
        .variantId(sm.getVariantId())
        .transactionId(sm.getTransactionId())
        .type(sm.getType())
        .quantity(sm.getQuantity())
        .createdAt(sm.getCreatedAt())
        .updatedAt(sm.getUpdatedAt())
        .createdByName(sm.getCreatedByName())
        .transactionDescription(transactionDesc)
        // .customerName(customerName) // Todo: Link Customer to Transaction if needed
        .build();
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
    } else if (request.getVariantId() != null) {
      updateVariantStock(request);
    } else if (request.getProductId() != null) {
      updateProductStock(request);
      // return request; // Comment if product update not affect stock movement
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

    if (ingredient.getStock() != null) {
      ingredient.setStock(ingredient.getStock().add(quantity)); // quantity will be - or + base on params
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

    if (product.getStock() != null) {
      product.setStock(product.getStock().add(quantity)); // quantity will be - or + base on params
    }

    log.info("Stock updated for Product {} ({}): {} {}", product.getId(), product.getName(), movement.getType(),
        quantity);
    productRepo.save(product);
  }

  private void updateVariantStock(StockMovement movement) {
    var option = variantOptionRepo.findById(movement.getVariantId())
        .orElseThrow(() -> new RuntimeException("Variant Option not found"));

    BigDecimal quantity = movement.getQuantity();
    if (quantity == null)
      return;

    if (option.getStock() != null) {
      option.setStock(option.getStock().add(quantity)); // quantity will be - or + base on params
    }

    log.info("Stock updated for Variant Option {} ({}): {} {}", option.getId(), option.getName(), movement.getType(),
        quantity);
    variantOptionRepo.save(option);
  }

  @Transactional
  public void adjustStock(UUID storeId, com.huzakerna.cajero.dto.StockUpdateRequest request) {
    if (request.getType().equalsIgnoreCase("INGREDIENT")) {
      var ingredient = ingredientRepo.findById(request.getId())
          .orElseThrow(() -> new RuntimeException("Ingredient not found"));

      BigDecimal currentStock = ingredient.getStock() != null ? ingredient.getStock() : BigDecimal.ZERO;
      BigDecimal difference = request.getNewStock().subtract(currentStock);

      if (difference.compareTo(BigDecimal.ZERO) == 0) {
        return; // No change
      }

      StockMovement movement = new StockMovement();
      movement.setStoreId(storeId);
      movement.setIngredientId(request.getId());
      movement.setQuantity(difference.abs());
      movement.setType(StockMovementType.ADJUSTMENT);
      addStockMovement(storeId, movement);

    } else if (request.getType().equalsIgnoreCase("PRODUCT")) {
      var product = productRepo.findById(request.getId())
          .orElseThrow(() -> new RuntimeException("Product not found"));

      BigDecimal currentStock = product.getStock() != null ? product.getStock() : BigDecimal.ZERO;
      BigDecimal difference = request.getNewStock().subtract(currentStock);

      if (difference.compareTo(BigDecimal.ZERO) == 0) {
        return;
      }

      StockMovement movement = new StockMovement();
      movement.setStoreId(storeId);
      movement.setProductId(request.getId());
      movement.setQuantity(difference.abs());
      movement.setType(StockMovementType.ADJUSTMENT);

      addStockMovement(storeId, movement);
    } else {
      throw new IllegalArgumentException("Invalid type: " + request.getType());
    }
  }
}
