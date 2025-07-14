package com.huzakerna.cajero.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.huzakerna.cajero.model.TransactionStatus;

public interface TransactionStatusRepository extends JpaRepository<TransactionStatus, String> {

}
