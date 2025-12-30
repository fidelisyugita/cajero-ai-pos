package com.huzakerna.cajero.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

import com.huzakerna.cajero.model.StockMovement;

import org.springframework.data.jpa.repository.EntityGraph;

public interface StockMovementRepository
    extends JpaRepository<StockMovement, UUID>,
    org.springframework.data.jpa.repository.JpaSpecificationExecutor<StockMovement> {

  @EntityGraph(attributePaths = { "createdBy", "updatedBy" })
  List<StockMovement> findByStoreId(UUID storeId);

  @EntityGraph(attributePaths = { "createdBy", "updatedBy" })
  List<StockMovement> findByStoreIdAndDeletedAtIsNull(UUID storeId);
}
