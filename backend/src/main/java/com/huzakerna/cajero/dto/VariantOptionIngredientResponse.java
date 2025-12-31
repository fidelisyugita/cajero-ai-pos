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
public class VariantOptionIngredientResponse {

  private UUID ingredientId;
  private String name;
  private BigDecimal quantityNeeded;
  private String measureUnit;
}
