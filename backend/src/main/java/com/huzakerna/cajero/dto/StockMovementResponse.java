package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.huzakerna.cajero.model.StockMovementType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementResponse {
  private UUID id;
  private UUID storeId;
  private UUID ingredientId;
  private UUID productId;
  private UUID variantId;
  private UUID transactionId;
  private StockMovementType type;
  private BigDecimal quantity;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  // Enhanced details
  private String createdByName;
  private String transactionDescription;
  private String customerName;
}
