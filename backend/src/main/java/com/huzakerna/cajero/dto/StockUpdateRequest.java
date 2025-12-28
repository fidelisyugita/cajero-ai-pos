package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockUpdateRequest {

  @NotNull(message = "ID is required")
  private UUID id;

  @NotNull(message = "Type is required (PRODUCT or INGREDIENT)")
  private String type;

  @NotNull(message = "New Stock value is required")
  @DecimalMin(value = "0.0", message = "Stock cannot be negative")
  private BigDecimal newStock;

  private String reason;
}
