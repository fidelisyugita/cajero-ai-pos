package com.huzakerna.cajero.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

import com.huzakerna.cajero.model.Ingredient;

public interface IngredientRepository extends JpaRepository<Ingredient, UUID> {

  List<Ingredient> findByStoreId(UUID storeId);
}
