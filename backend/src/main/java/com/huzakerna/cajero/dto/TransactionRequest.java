package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class TransactionRequest {

    @DecimalMin(value = "0.0", message = "Total Tax cannot be negative")
    private BigDecimal totalTax;
    @DecimalMin(value = "0.0", message = "Total Commission cannot be negative")
    private BigDecimal totalCommission;
    @DecimalMin(value = "0.0", message = "Total Discount cannot be negative")
    private BigDecimal totalDiscount;
    @NotNull(message = "Total Price is required")
    @DecimalMin(value = "0.0", message = "Total Price cannot be negative")
    private BigDecimal totalPrice;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    @NotNull(message = "Status Code is required")
    private String statusCode;
    @NotNull(message = "Transaction Type Code is required")
    private String transactionTypeCode;
    @NotNull(message = "Payment Method Code is required")
    private String paymentMethodCode;

    private List<TransactionProductRequest> transactionProducts;

    private boolean isIn;

    private UUID customerId;

    private LocalDateTime createdAt; // Optional: Client provided creation time

    private UUID createdBy;
    private UUID updatedBy;

}
