package com.huzakerna.cajero.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import com.huzakerna.cajero.model.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    List<Transaction> findByTransactionTypeCode(String transactionTypeCode);

    List<Transaction> findByStoreId(UUID storeId);
}
