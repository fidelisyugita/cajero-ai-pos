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
public class ProductIngredientRequest {

  @NotNull(message = "Ingredient Id is required")
  private UUID ingredientId;

  @NotNull(message = "Quantity Needed is required")
  @DecimalMin(value = "0.0", message = "Quantity cannot be negative")
  private BigDecimal quantityNeeded;

  @Override
  public boolean equals(Object o) {
    if (this == o)
      return true;
    if (o == null || getClass() != o.getClass())
      return false;
    ProductIngredientRequest that = (ProductIngredientRequest) o;
    return java.util.Objects.equals(ingredientId, that.ingredientId) &&
        (quantityNeeded == null ? that.quantityNeeded == null
            : (that.quantityNeeded != null && quantityNeeded.compareTo(that.quantityNeeded) == 0));
  }

  @Override
  public int hashCode() {
    return java.util.Objects.hash(ingredientId,
        quantityNeeded != null ? quantityNeeded.stripTrailingZeros() : null);
  }
}
