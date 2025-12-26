package com.huzakerna.cajero.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

import com.huzakerna.cajero.model.Ingredient;

import org.springframework.data.jpa.repository.EntityGraph;

public interface IngredientRepository extends JpaRepository<Ingredient, UUID> {

  @EntityGraph(attributePaths = { "createdBy", "updatedBy" })
  List<Ingredient> findByStoreId(UUID storeId);

  @EntityGraph(attributePaths = { "createdBy", "updatedBy" })
  List<Ingredient> findByStoreIdAndDeletedAtIsNull(UUID storeId);
}
