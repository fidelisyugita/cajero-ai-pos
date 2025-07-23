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

        public TransactionResponse addTransaction(TransactionRequest request) {
                // Validate store exists
                if (!sRepo.existsById(request.getStoreId())) {
                        throw new IllegalArgumentException("Store not found");
                } ;

                Transaction transaction = repo.save(
                        Transaction.builder()
                                .storeId(request.getStoreId())
                                .statusCode(request.getStatusCode())
                                .paymentMethodCode(request.getPaymentMethodCode())
                                .transactionTypeCode(request.getTransactionTypeCode())
                                .description(request.getDescription())
                                .isIn(request.isIn())
                                .totalDiscount(request.getTotalDiscount())
                                .totalPrice(request.getTotalPrice())
                                .totalTax(request.getTotalTax())
                                .build());

                // Add transaction items if any
                if (request.getTransactionProductRequests() != null) {
                        for (TransactionProductRequest product : request
                                .getTransactionProductRequests()) {
                                addProductToTransaction(transaction.getId(),
                                        product.getProductId(),
                                        product.getBuyingPrice(), product.getSellingPrice(),
                                        product.getNote(),
                                        product.getQuantity(), product.getSelectedVariants());

                        }
                }

                return mapToResponse(transaction);
        }

        public void addProductToTransaction(UUID transactionId, UUID productId,
                BigDecimal buyingPrice, BigDecimal sellingPrice, String note, Integer quantity,
                JsonNode selectedVariants) {

                TransactionProduct transactionVariant = new TransactionProduct();
                transactionVariant.setId(new TransactionProductId(transactionId, productId));
                transactionVariant.setBuyingPrice(buyingPrice);
                transactionVariant.setSellingPrice(sellingPrice);
                transactionVariant.setNote(note);
                transactionVariant.setQuantity(quantity);
                transactionVariant.setSelectedVariants(selectedVariants);

                tpRepo.save(transactionVariant);
        }

        public void removeVariantToTransaction(UUID transactionId, UUID productId) {
                TransactionProduct transactionVariant = new TransactionProduct();
                transactionVariant.setId(new TransactionProductId(transactionId, productId));

                tpRepo.delete(transactionVariant);
        }

        public TransactionResponse getTransactionById(UUID id) {
                Transaction transaction = repo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Transaction not found"));

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
                LocalDateTime end =
                        endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.now();

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
                        .totalDiscount(transaction.getTotalDiscount())
                        .totalPrice(transaction.getTotalPrice())
                        .totalTax(transaction.getTotalTax())
                        .createdAt(transaction.getCreatedAt())
                        .updatedAt(transaction.getUpdatedAt())
                        .transactionProduct(transaction.getTransactionProducts().stream()
                                .map(tp -> TransactionProductResponse.builder()
                                        .productId(tp.getProduct().getId())
                                        .categoryCode(tp.getProduct().getCategoryCode())
                                        .measureUnitCode(tp.getProduct().getMeasureUnitCode())
                                        .name(tp.getProduct().getName())
                                        .description(tp.getProduct().getDescription())
                                        .stockQuantity(tp.getProduct().getStockQuantity())
                                        .rejectCount(tp.getProduct().getRejectCount())
                                        .soldCount(tp.getProduct().getSoldCount())
                                        .imageUrl(tp.getProduct().getImageUrl())

                                        .selectedVariants(tp.getSelectedVariants())
                                        .note(tp.getNote())
                                        .quantity(tp.getQuantity())
                                        .buyingPrice(tp.getBuyingPrice())
                                        .sellingPrice(tp.getSellingPrice())
                                        .commission(tp.getCommission())
                                        .isCommissionByPercent(tp.isCommissionByPercent())
                                        .build())
                                .toList())
                        .build();
        }
}
