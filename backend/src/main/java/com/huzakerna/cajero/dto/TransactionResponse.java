package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class TransactionResponse extends BaseResponse {

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

    private UUID customerId;

}
