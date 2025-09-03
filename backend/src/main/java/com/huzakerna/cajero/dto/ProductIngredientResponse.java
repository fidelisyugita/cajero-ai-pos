package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductIngredientResponse {

    // from Ingredient
    private UUID ingredientId;
    private String name;
    private String description;
    private BigDecimal stock;
    private String measureUnitCode;
    private String measureUnitName;

    // itself
    private BigDecimal quantityNeeded;

}
