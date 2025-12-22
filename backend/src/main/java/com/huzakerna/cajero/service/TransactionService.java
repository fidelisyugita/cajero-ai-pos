package com.huzakerna.cajero.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.huzakerna.cajero.dto.TransactionProductRequest;
import com.huzakerna.cajero.dto.TransactionProductResponse;
import com.huzakerna.cajero.dto.TransactionRequest;
import com.huzakerna.cajero.dto.TransactionResponse;
import com.huzakerna.cajero.model.Ingredient;
import com.huzakerna.cajero.model.Product;
import com.huzakerna.cajero.model.ProductIngredient;
import com.huzakerna.cajero.model.StockMovement;
import com.huzakerna.cajero.model.Transaction;
import com.huzakerna.cajero.model.TransactionProduct;
import com.huzakerna.cajero.model.TransactionProductId;
import com.huzakerna.cajero.repository.IngredientRepository;
import com.huzakerna.cajero.repository.ProductRepository;
import com.huzakerna.cajero.repository.StoreRepository;
import com.huzakerna.cajero.repository.TransactionProductRepository;
import com.huzakerna.cajero.repository.TransactionRepository;
import com.huzakerna.cajero.util.ChangeTracker;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionService {
  private static final Logger logger = LoggerFactory.getLogger(TransactionService.class);

  private final StoreRepository sRepo;
  private final TransactionRepository repo;
  private final TransactionProductRepository tpRepo;
  private final ProductRepository pRepo;
  private final IngredientRepository ingredientRepo;
  private final StockMovementService stockMovementService;
  private final LogService logService;
  private final CustomerService customerService;

  @Transactional
  public TransactionResponse addTransaction(UUID storeId, TransactionRequest request) {
    logger.info("Adding transaction for store: {}", storeId);
    // Validate store exists
    if (!sRepo.existsById(storeId)) {
      throw new IllegalArgumentException("Store not found");
    }

    Transaction transaction = repo.save(
        Transaction.builder()
            .storeId(storeId)
            .statusCode(request.getStatusCode())
            .paymentMethodCode(request.getPaymentMethodCode())
            .transactionTypeCode(request.getTransactionTypeCode())
            .description(request.getDescription())
            .isIn(request.isIn())
            .totalDiscount(request.getTotalDiscount())
            .totalPrice(request.getTotalPrice())
            .totalTax(request.getTotalTax())
            .customerId(request.getCustomerId())
            .build());

    // Add transaction products if any
    if (request.getTransactionProducts() != null) {
      for (TransactionProductRequest product : request
          .getTransactionProducts()) {
        addProductToTransaction(transaction,
            product.getProductId(),
            product.getBuyingPrice(),
            product.getSellingPrice(),
            product.getNote(),
            product.getQuantity(),
            product.getSelectedVariants());
      }
    }

    if (request.getCustomerId() != null) {
      customerService.updateCustomer(storeId, request.getCustomerId(),
          BigDecimal.valueOf(transaction.getTotalPrice().doubleValue() / 1000));
    }

    logger.info("Transaction added successfully: {}", transaction.getId());
    return mapToResponse(transaction);
  }

  public void addProductToTransaction(Transaction transaction, UUID productId,
      BigDecimal buyingPrice, BigDecimal sellingPrice, String note, BigDecimal quantity,
      JsonNode selectedVariants) {
    logger.info("Adding product {} to transaction {}", productId, transaction.getId());

    Product product = pRepo.findById(productId)
        .orElseThrow(() -> new RuntimeException("Product not found"));

    TransactionProduct transactionProduct = new TransactionProduct();
    transactionProduct.setId(new TransactionProductId(transaction.getId(), productId));
    transactionProduct.setBuyingPrice(buyingPrice);
    transactionProduct.setSellingPrice(sellingPrice);
    transactionProduct.setNote(note);
    transactionProduct.setQuantity(quantity);
    transactionProduct.setSelectedVariants(selectedVariants);
    transactionProduct.setProduct(product);
    transactionProduct.setTransaction(transaction);

    tpRepo.save(transactionProduct);

    // Deduct stock for ingredients
    handleStockMovement(transaction, product, quantity, "OUT");

    // Deduct stock for product
    if (product.getStock() != null) {
      product.setStock(product.getStock().subtract(quantity));
      pRepo.save(product);
    }
  }

  public void removeProductFromTransaction(UUID transactionId, UUID productId) {
    logger.info("Removing product {} from transaction {}", productId, transactionId);
    TransactionProduct transactionProduct = new TransactionProduct();
    transactionProduct.setId(new TransactionProductId(transactionId, productId));

    tpRepo.delete(transactionProduct);
  }

  public void removeProductFromTransaction(UUID transactionId, List<UUID> productIds) {
    logger.info("Removing products {} from transaction {}", productIds, transactionId);
    List<TransactionProductId> transactionProducts = productIds.stream()
        .map(productId -> new TransactionProductId(transactionId, productId))
        .toList();

    tpRepo.deleteAllByIdInBatch(transactionProducts);
  }

  // Helper to handle stock movement (OUT = deduct, IN = add)
  private void handleStockMovement(Transaction transaction, Product product, BigDecimal quantity, String type) {
    if (product.getIngredients() != null) {
      for (ProductIngredient pi : product.getIngredients()) {
        Ingredient ingredient = pi.getIngredient();
        BigDecimal totalNeeded = pi.getQuantityNeeded().multiply(quantity);

        logger.info("Adjusting stock for product {} ingredient {}: {} {}", product.getName(), ingredient.getName(),
            type, totalNeeded);

        if ("OUT".equals(type)) {
          ingredient.setStock(ingredient.getStock().subtract(totalNeeded));
        } else if ("IN".equals(type)) {
          ingredient.setStock(ingredient.getStock().add(totalNeeded));
        }

        ingredientRepo.save(ingredient);

        // Log stock movement
        stockMovementService.addStockMovement(transaction.getStoreId(),
            StockMovement.builder()
                .ingredientId(ingredient.getId())
                .productId(product.getId())
                .transactionId(transaction.getId())
                .type(type)
                .quantity(totalNeeded)
                .build());
      }
    }
  }

  public TransactionResponse getTransactionById(UUID id) {
    Transaction transaction = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Transaction not found"));

    return mapToResponse(transaction);
  }

  @Transactional
  public TransactionResponse updateTransaction(UUID storeId, UUID id, TransactionRequest request) {
    logger.info("Updating transaction: {}", id);
    // Validate store exists
    if (!sRepo.existsById(storeId)) {
      throw new IllegalArgumentException("Store not found");
    }

    // Find existing transaction
    Transaction transaction = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Transaction not found"));

    // Verify the transaction belongs to the store
    if (!transaction.getStoreId().equals(storeId)) {
      throw new IllegalArgumentException("Transaction does not belong to the store");
    }

    // Create log details
    var logDetails = new java.util.HashMap<String, Object>();
    logDetails.put("transactionId", id);

    // Create change tracker
    ChangeTracker changeTracker = new ChangeTracker();
    // Compare and store only changed values
    changeTracker.compareAndTrack("statusCode", transaction.getStatusCode(), request.getStatusCode());
    changeTracker.compareAndTrack("paymentMethodCode", transaction.getPaymentMethodCode(),
        request.getPaymentMethodCode());
    changeTracker.compareAndTrack("transactionTypeCode", transaction.getTransactionTypeCode(),
        request.getTransactionTypeCode());
    changeTracker.compareAndTrack("description", transaction.getDescription(), request.getDescription());
    changeTracker.compareAndTrack("transactionProducts", transaction.getTransactionProducts(),
        request.getTransactionProducts());

    // Update transaction fields
    transaction.setStatusCode(request.getStatusCode());
    transaction.setPaymentMethodCode(request.getPaymentMethodCode());
    transaction.setTransactionTypeCode(request.getTransactionTypeCode());
    transaction.setDescription(request.getDescription());
    // transaction.setIn(request.isIn());
    // transaction.setTotalDiscount(request.getTotalDiscount());
    // transaction.setTotalTax(request.getTotalTax());

    // Remove existing transaction products
    // tpRepo.deleteByTransactionId(id);

    List<UUID> removedProductIds = transaction.getTransactionProducts().stream()
        .filter(tp -> request.getTransactionProducts() == null || request.getTransactionProducts().stream()
            .noneMatch(ri -> ri.getProductId().equals(tp.getProduct().getId())))
        .map(tp -> tp.getProduct().getId())
        .toList();

    removeProductFromTransaction(transaction.getId(), removedProductIds);

    // Add new transaction products if any
    if (request.getTransactionProducts() != null) {
      for (TransactionProductRequest product : request.getTransactionProducts()) {
        if (transaction.getTransactionProducts().stream()
            .noneMatch(tp -> tp.getProduct().getId().equals(product.getProductId()))) {
          addProductToTransaction(transaction,
              product.getProductId(),
              product.getBuyingPrice(),
              product.getSellingPrice(),
              product.getNote(),
              product.getQuantity(),
              product.getSelectedVariants());
        }
      }
    }

    transaction = repo.save(transaction);

    // Only add oldValues and newValues to log details if there were changes
    if (changeTracker.hasChanges()) {
      logDetails.put("oldValues", changeTracker.getOldValues());
      logDetails.put("newValues", changeTracker.getNewValues());
      logService.logAction(storeId, "transaction", "updated", logDetails);
    }

    return mapToResponse(transaction);
  }

  // soft delete
  @Transactional
  public TransactionResponse removeTransaction(UUID storeId, UUID id) {
    logger.info("Removing transaction: {}", id);
    // Validate store exists
    if (!sRepo.existsById(storeId)) {
      throw new IllegalArgumentException("Store not found");
    }

    // Find existing transaction
    Transaction transaction = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Transaction not found"));

    // Verify the transaction belongs to the store
    if (!transaction.getStoreId().equals(storeId)) {
      throw new IllegalArgumentException("Transaction does not belong to the store");
    }

    // Update transaction fields
    transaction.setDeletedAt(LocalDateTime.now());

    transaction = repo.save(transaction);

    // Create log details
    var logDetails = new java.util.HashMap<String, Object>();
    logDetails.put("transactionId", id);
    logService.logAction(storeId, "transaction", "deleted", logDetails);

    return mapToResponse(transaction);
  }

  public Page<TransactionResponse> getTransactions(UUID storeId,
      int page,
      int size,
      String sortBy,
      String sortDir,
      String statusCode,
      String transactionTypeCode,
      String paymentMethodCode,
      LocalDate startDate,
      LocalDate endDate) {
    Pageable pageable = PageRequest.of(page, size,
        sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending()
            : Sort.by(sortBy).ascending());

    // fallback to 1970 and now if null
    LocalDateTime start = startDate != null ? startDate.atStartOfDay()
        : LocalDate.of(1970, 1, 1).atStartOfDay();
    LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.now();

    Page<Transaction> transactionPage = repo.findFiltered(
        storeId, statusCode, transactionTypeCode, paymentMethodCode, start,
        end, pageable);

    return transactionPage.map(this::mapToResponse);
  }

  public List<TransactionResponse> getAllTransactions() {
    return repo.findAll().stream()
        .map(this::mapToResponse)
        .toList();
  }

  private TransactionResponse mapToResponse(Transaction transaction) {
    return TransactionResponse.builder()
        .id(transaction.getId())
        .storeId(transaction.getStoreId())
        .statusCode(transaction.getStatusCode())
        .paymentMethodCode(transaction.getPaymentMethodCode())
        .transactionTypeCode(transaction.getTransactionTypeCode())
        .description(transaction.getDescription())
        .isIn(transaction.isIn())
        .totalCommission(transaction.getTotalCommission())
        .totalDiscount(transaction.getTotalDiscount())
        .totalPrice(transaction.getTotalPrice())
        .totalTax(transaction.getTotalTax())
        .customerId(transaction.getCustomerId())
        .createdBy(transaction.getCreatedBy())
        .updatedBy(transaction.getUpdatedBy())
        .createdAt(transaction.getCreatedAt())
        .updatedAt(transaction.getUpdatedAt())
        .transactionProduct(transaction.getTransactionProducts() != null ? transaction.getTransactionProducts().stream()
            .map(tp -> TransactionProductResponse.builder()
                .productId(tp.getProduct().getId())
                .categoryCode(tp.getProduct().getCategoryCode())
                .measureUnitCode(tp.getProduct().getMeasureUnit().getCode())
                .name(tp.getProduct().getName())
                .description(tp.getProduct().getDescription())
                .stock(tp.getProduct().getStock())
                .rejectCount(tp.getProduct().getRejectCount())
                .soldCount(tp.getProduct().getSoldCount())
                .imageUrl(tp.getProduct().getImageUrl())

                .selectedVariants(tp.getSelectedVariants())
                .note(tp.getNote())
                .quantity(tp.getQuantity())
                .buyingPrice(tp.getBuyingPrice())
                .sellingPrice(tp.getSellingPrice())
                .commission(tp.getCommission())
                .discount(tp.getDiscount())
                .tax(tp.getTax())
                .build())
            .toList() : List.of())
        .build();
  }
}
