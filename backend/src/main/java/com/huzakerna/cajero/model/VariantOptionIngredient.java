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
@Table(name = "variant_option_ingredients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VariantOptionIngredient {

    @EmbeddedId
    private VariantOptionIngredientId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("ingredientId") // This matches the field name in VariantOptionIngredientId
    @JoinColumn(name = "ingredient_id") // This matches the actual DB column
    private Ingredient ingredient;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("variantOptionId") // Matches field name in VariantOptionIngredientId
    @JoinColumn(name = "variant_option_id") // Matches DB column
    private VariantOption variantOption;

    @Column(name = "quantity_needed")
    private BigDecimal quantityNeeded;
}
