package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
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
public class TransactionResponse {

    private UUID id;
    private UUID storeId;

    private BigDecimal totalCommission;
    private BigDecimal totalDiscount;
    private BigDecimal totalTax;
    private BigDecimal totalPrice;

    private String description;

    private String statusCode;
    private String transactionTypeCode;
    private String paymentMethodCode;

    private List<TransactionProductResponse> transactionProduct;

    private boolean isIn;

    private UUID createdBy;
    private UUID updatedBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
