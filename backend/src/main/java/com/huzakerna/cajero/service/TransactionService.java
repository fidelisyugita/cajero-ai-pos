package com.huzakerna.cajero.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import lombok.extern.slf4j.Slf4j;
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
import com.huzakerna.cajero.model.StockMovementType;
import com.huzakerna.cajero.model.Transaction;
import com.huzakerna.cajero.model.TransactionProduct;
import com.huzakerna.cajero.model.TransactionProductId;
import com.huzakerna.cajero.repository.ProductRepository;
import com.huzakerna.cajero.repository.StoreRepository;
import com.huzakerna.cajero.repository.TransactionProductRepository;
import com.huzakerna.cajero.repository.TransactionRepository;
import com.huzakerna.cajero.util.ChangeTracker;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

  private final StoreRepository sRepo;
  private final TransactionRepository repo;
  private final TransactionProductRepository tpRepo;
  private final ProductRepository pRepo;
  private final StockMovementService stockMovementService;
  private final LogService logService;
  private final CustomerService customerService;

  @Transactional
  public TransactionResponse addTransaction(UUID storeId, TransactionRequest request) {
    log.info("Adding transaction for store: {}", storeId);
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
    // Add transaction products if any
    BigDecimal calculatedTotalDiscount = BigDecimal.ZERO;
    BigDecimal calculatedTotalTax = BigDecimal.ZERO;
    BigDecimal calculatedTotalCommission = BigDecimal.ZERO;
    BigDecimal calculatedTotalPrice = BigDecimal.ZERO;

    if (request.getTransactionProducts() != null) {
      for (TransactionProductRequest product : request
          .getTransactionProducts()) {
        TransactionProduct tp = addProductToTransaction(transaction,
            product.getProductId(),
            product.getBuyingPrice(),
            product.getSellingPrice(),
            product.getNote(),
            product.getQuantity(),
            product.getSelectedVariants(),
            product.getCommission(),
            product.getDiscount(),
            product.getTax());

        calculatedTotalDiscount = calculatedTotalDiscount.add(tp.getDiscount());
        calculatedTotalTax = calculatedTotalTax.add(tp.getTax());
        calculatedTotalCommission = calculatedTotalCommission.add(tp.getCommission());

        // Price Calculation: (Selling Price * Quantity) - Discount + Tax
        // Note: Assuming Selling Price is Pre-Tax and Pre-Discount base unit price.
        BigDecimal lineTotal = tp.getSellingPrice().multiply(tp.getQuantity())
            .subtract(tp.getDiscount())
            .add(tp.getTax());
        calculatedTotalPrice = calculatedTotalPrice.add(lineTotal);
      }
    }

    // Update transaction totals with calculated values
    transaction.setTotalDiscount(calculatedTotalDiscount);
    transaction.setTotalTax(calculatedTotalTax);
    transaction.setTotalCommission(calculatedTotalCommission);
    transaction.setTotalPrice(calculatedTotalPrice);

    repo.save(transaction);

    if (request.getCustomerId() != null) {
      customerService.updateCustomer(storeId, request.getCustomerId(),
          BigDecimal.valueOf(transaction.getTotalPrice().doubleValue() / 1000));
    }

    log.info("Transaction added successfully: {}", transaction.getId());
    return mapToResponse(transaction);
  }

  public TransactionProduct addProductToTransaction(Transaction transaction, UUID productId,
      BigDecimal buyingPrice, BigDecimal sellingPrice, String note, BigDecimal quantity,
      JsonNode selectedVariants,
      BigDecimal commission, BigDecimal discount, BigDecimal tax) {
    log.info("Adding product {} to transaction {}", productId, transaction.getId());

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

    // Calculate/Set Tax, Commission, Discount
    // Priority: Request > Product Default > 0
    if (commission != null) {
      transactionProduct.setCommission(commission);
    } else {
      transactionProduct.setCommission(
          product.getCommission() != null ? product.getCommission().multiply(quantity) : BigDecimal.ZERO);
    }

    if (discount != null) {
      transactionProduct.setDiscount(discount);
    } else {
      transactionProduct.setDiscount(
          product.getDiscount() != null ? product.getDiscount().multiply(quantity) : BigDecimal.ZERO);
    }

    if (tax != null) {
      transactionProduct.setTax(tax);
    } else {
      transactionProduct.setTax(
          product.getTax() != null ? product.getTax().multiply(quantity) : BigDecimal.ZERO);
    }

    tpRepo.save(transactionProduct);

    // Deduct stock for ingredients
    handleStockMovement(transaction, product, quantity, StockMovementType.SALE);

    // Deduct stock for product (Standardized via StockMovementService)
    if (product.getStock() != null) {
      stockMovementService.addStockMovement(transaction.getStoreId(),
          StockMovement.builder()
              .productId(product.getId())
              .transactionId(transaction.getId())
              .type(StockMovementType.SALE)
              .quantity(quantity)
              .build());
    }

    return transactionProduct;
  }

  public void removeProductFromTransaction(UUID transactionId, UUID productId) {
    log.info("Removing product {} from transaction {}", productId, transactionId);
    TransactionProduct transactionProduct = new TransactionProduct();
    transactionProduct.setId(new TransactionProductId(transactionId, productId));

    tpRepo.delete(transactionProduct);
  }

  public void removeProductFromTransaction(UUID transactionId, List<UUID> productIds) {
    log.info("Removing products {} from transaction {}", productIds, transactionId);
    List<TransactionProductId> transactionProducts = productIds.stream()
        .map(productId -> new TransactionProductId(transactionId, productId))
        .toList();

    tpRepo.deleteAllByIdInBatch(transactionProducts);
  }

  // Helper to handle stock movement
  private void handleStockMovement(Transaction transaction, Product product, BigDecimal quantity,
      StockMovementType type) {
    if (product.getIngredients() != null) {
      for (ProductIngredient pi : product.getIngredients()) {
        Ingredient ingredient = pi.getIngredient();
        BigDecimal totalNeeded = pi.getQuantityNeeded().multiply(quantity);

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
    log.info("Updating transaction: {}", id);
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
              product.getSelectedVariants(),
              product.getCommission(),
              product.getDiscount(),
              product.getTax());
        }
      }
    }

    // Recalculate totals for the ENTIRE transaction (existing + new)
    // We need to fetch the fresh list of transaction products from DB or assume the
    // session cache is updated
    // Since we called addProductToTransaction (which saves), let's re-fetch the
    // transaction products
    List<TransactionProduct> allProducts = tpRepo.findByTransactionId(transaction.getId());

    BigDecimal calculatedTotalDiscount = BigDecimal.ZERO;
    BigDecimal calculatedTotalTax = BigDecimal.ZERO;
    BigDecimal calculatedTotalCommission = BigDecimal.ZERO;
    BigDecimal calculatedTotalPrice = BigDecimal.ZERO;

    for (TransactionProduct tp : allProducts) {
      calculatedTotalDiscount = calculatedTotalDiscount
          .add(tp.getDiscount() != null ? tp.getDiscount() : BigDecimal.ZERO);
      calculatedTotalTax = calculatedTotalTax.add(tp.getTax() != null ? tp.getTax() : BigDecimal.ZERO);
      calculatedTotalCommission = calculatedTotalCommission
          .add(tp.getCommission() != null ? tp.getCommission() : BigDecimal.ZERO);

      BigDecimal lineTotal = tp.getSellingPrice().multiply(tp.getQuantity())
          .subtract(tp.getDiscount() != null ? tp.getDiscount() : BigDecimal.ZERO)
          .add(tp.getTax() != null ? tp.getTax() : BigDecimal.ZERO);
      calculatedTotalPrice = calculatedTotalPrice.add(lineTotal);
    }

    transaction.setTotalDiscount(calculatedTotalDiscount);
    transaction.setTotalTax(calculatedTotalTax);
    transaction.setTotalCommission(calculatedTotalCommission);
    transaction.setTotalPrice(calculatedTotalPrice);

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
    log.info("Removing transaction: {}", id);
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
