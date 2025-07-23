package com.huzakerna.cajero.service;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.stereotype.Service;
import com.huzakerna.cajero.dto.TransactionRequest;
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

        public Transaction addTransaction(TransactionRequest request) {
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
                if (request.getTransactionProducts() != null) {
                        for (TransactionProduct product : request.getTransactionProducts()) {
                                addProductToTransaction(transaction.getId(),
                                        product.getId().getProductId(),
                                        product.getBuyingPrice(), product.getSellingPrice(),
                                        product.getNote(),
                                        product.getQuantity(), product.getSelectedVariants());

                        }
                }

                return transaction;
        }

        public void addProductToTransaction(UUID transactionId, UUID productId,
                BigDecimal buyingPrice, BigDecimal sellingPrice, String note, Integer quantity,
                String selectedVariants) {

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

        public Transaction getTransactionById(UUID id) {
                return repo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Transaction not found"));
        }
}
