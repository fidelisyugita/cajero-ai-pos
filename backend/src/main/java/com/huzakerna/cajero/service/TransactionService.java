package com.huzakerna.cajero.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.huzakerna.cajero.dto.TransactionProductRequest;
import com.huzakerna.cajero.dto.TransactionProductResponse;
import com.huzakerna.cajero.dto.TransactionRequest;
import com.huzakerna.cajero.dto.TransactionResponse;
import com.huzakerna.cajero.model.Transaction;
import com.huzakerna.cajero.model.TransactionProduct;
import com.huzakerna.cajero.model.TransactionProductId;
import com.huzakerna.cajero.repository.TransactionRepository;
import com.huzakerna.cajero.repository.StoreRepository;
import com.huzakerna.cajero.repository.TransactionProductRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionService {

  private final StoreRepository sRepo;
  private final TransactionRepository repo;
  private final TransactionProductRepository tpRepo;
  private final LogService logService;

  public TransactionResponse addTransaction(UUID storeId, TransactionRequest request) {
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
            .build());

    // Add transaction products if any
    if (request.getTransactionProducts() != null) {
      for (TransactionProductRequest product : request
          .getTransactionProducts()) {
        addProductToTransaction(transaction.getId(),
            product.getProductId(),
            product.getBuyingPrice(),
            product.getSellingPrice(),
            product.getNote(),
            product.getQuantity(),
            product.getSelectedVariants());
      }
    }

    return mapToResponse(transaction);
  }

  public void addProductToTransaction(UUID transactionId, UUID productId,
      BigDecimal buyingPrice, BigDecimal sellingPrice, String note, BigDecimal quantity,
      JsonNode selectedVariants) {

    TransactionProduct transactionProduct = new TransactionProduct();
    transactionProduct.setId(new TransactionProductId(transactionId, productId));
    transactionProduct.setBuyingPrice(buyingPrice);
    transactionProduct.setSellingPrice(sellingPrice);
    transactionProduct.setNote(note);
    transactionProduct.setQuantity(quantity);
    transactionProduct.setSelectedVariants(selectedVariants);

    tpRepo.save(transactionProduct);
  }

  public void removeProductFromTransaction(UUID transactionId, UUID productId) {
    TransactionProduct transactionProduct = new TransactionProduct();
    transactionProduct.setId(new TransactionProductId(transactionId, productId));

    tpRepo.delete(transactionProduct);
  }

  public TransactionResponse getTransactionById(UUID id) {
    Transaction transaction = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Transaction not found"));

    return mapToResponse(transaction);
  }

  public TransactionResponse updateTransaction(UUID storeId, UUID id, TransactionRequest request) {
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
    logDetails.put("oldValues", mapToResponse(transaction));

    // Update transaction fields
    transaction.setStatusCode(request.getStatusCode());
    transaction.setPaymentMethodCode(request.getPaymentMethodCode());
    transaction.setTransactionTypeCode(request.getTransactionTypeCode());
    transaction.setDescription(request.getDescription());
    transaction.setIn(request.isIn());
    transaction.setTotalDiscount(request.getTotalDiscount());
    transaction.setTotalTax(request.getTotalTax());

    // Remove existing transaction products
    tpRepo.deleteByTransactionId(id);

    // Add new transaction products if any
    if (request.getTransactionProducts() != null) {
      for (TransactionProductRequest product : request.getTransactionProducts()) {
        addProductToTransaction(transaction.getId(),
            product.getProductId(),
            product.getBuyingPrice(),
            product.getSellingPrice(),
            product.getNote(),
            product.getQuantity(),
            product.getSelectedVariants());
      }
    }

    transaction = repo.save(transaction);

    // Add new values to log details and create log
    logDetails.put("newValues", mapToResponse(transaction));
    logService.logAction(storeId, "transaction", "updated", logDetails);

    return mapToResponse(transaction);
  }

  // soft delete
  public TransactionResponse removeTransaction(UUID storeId, UUID id) {
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
        .createdAt(transaction.getCreatedAt())
        .updatedAt(transaction.getUpdatedAt())
        .transactionProduct(transaction.getTransactionProducts().stream()
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
            .toList())
        .build();
  }
}
