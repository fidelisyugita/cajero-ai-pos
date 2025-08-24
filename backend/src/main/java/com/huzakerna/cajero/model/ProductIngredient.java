package com.huzakerna.cajero.model;

import java.math.BigDecimal;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product_ingredients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductIngredient {

    @EmbeddedId
    private ProductIngredientId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId") // This matches the field name in ProductIngredientId
    @JoinColumn(name = "product_id") // This matches the actual DB column
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("ingredientId") // Matches field name in ProductIngredientId
    @JoinColumn(name = "ingredient_id") // Matches DB column
    private Ingredient ingredient;

    @Column(name = "quantity_needed")
    private BigDecimal quantityNeeded;
}
