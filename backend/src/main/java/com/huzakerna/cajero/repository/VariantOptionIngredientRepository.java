package com.huzakerna.cajero.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.huzakerna.cajero.model.VariantOptionIngredient;
import com.huzakerna.cajero.model.VariantOptionIngredientId;

@Repository
public interface VariantOptionIngredientRepository
    extends JpaRepository<VariantOptionIngredient, VariantOptionIngredientId> {

}
