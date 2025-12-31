package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
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
public class VariantOptionIngredientRequest {

  @NotNull(message = "Ingredient Id is required")
  private UUID ingredientId;

  @NotNull(message = "Quantity needed is required")
  @DecimalMin(value = "0.0", inclusive = false, message = "Quantity needed must be greater than 0")
  private BigDecimal quantityNeeded;
}
