package com.huzakerna.cajero.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.huzakerna.cajero.model.TransactionProduct;

public interface TransactionProductRepository
        extends JpaRepository<TransactionProduct, UUID> {

    List<TransactionProduct> findByTransactionId(UUID transactionId);

    List<TransactionProduct> findByProductId(UUID productId);

    void deleteByTransactionId(UUID transactionId);

    void deleteByTransactionIdAndProductId(UUID transactionId, UUID productId);

}
