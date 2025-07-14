package com.huzakerna.cajero.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.huzakerna.cajero.model.TransactionType;

public interface TransactionTypeRepository extends JpaRepository<TransactionType, String> {

}
