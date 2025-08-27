package com.huzakerna.cajero.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

import com.huzakerna.cajero.model.StockMovement;

public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {

  List<StockMovement> findByStoreId(UUID storeId);
}
