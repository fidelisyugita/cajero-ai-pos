package com.huzakerna.cajero.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.huzakerna.cajero.model.ProductIngredient;
import com.huzakerna.cajero.model.ProductIngredientId;

public interface ProductIngredientRepository extends JpaRepository<ProductIngredient, ProductIngredientId> {

    List<ProductIngredient> findByProductId(UUID productId);

    List<ProductIngredient> findByIngredientId(UUID ingredientId);

    void deleteByProductId(UUID productId);
}
