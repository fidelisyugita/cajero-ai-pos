package com.huzakerna.cajero.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.huzakerna.cajero.model.Variant;

import org.springframework.data.jpa.repository.EntityGraph;

public interface VariantRepository extends JpaRepository<Variant, UUID> {

  @EntityGraph(attributePaths = { "createdBy", "updatedBy" })
  List<Variant> findByStoreId(UUID storeId);

  @EntityGraph(attributePaths = { "createdBy", "updatedBy" })
  List<Variant> findByStoreIdAndDeletedAtIsNull(UUID storeId);
}
