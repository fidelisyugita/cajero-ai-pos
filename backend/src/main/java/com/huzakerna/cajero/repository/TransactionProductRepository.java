package com.huzakerna.cajero.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.huzakerna.cajero.model.TransactionProduct;
import com.huzakerna.cajero.model.TransactionProductId;

public interface TransactionProductRepository
    extends JpaRepository<TransactionProduct, TransactionProductId> {

    List<TransactionProduct> findByTransactionId(UUID transactionId);

    List<TransactionProduct> findByProductId(UUID productId);

}
