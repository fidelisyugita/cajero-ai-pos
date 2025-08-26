package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
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
public class TransactionProductRequest {

    @NotNull(message = "Product Id is required")
    private UUID productId;

    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode selectedVariants;

    private String note;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "1.0", message = "Quantity cannot be negative")
    private BigDecimal quantity;

    @DecimalMin(value = "0.0", message = "Stock cannot be negative")
    private BigDecimal buyingPrice;

    @NotNull(message = "Selling Price is required")
    @DecimalMin(value = "0.0", message = "Stock cannot be negative")
    private BigDecimal sellingPrice;

    @DecimalMin(value = "0.0", message = "Commission cannot be negative")
    private BigDecimal commission;

    @DecimalMin(value = "0.0", message = "Discount cannot be negative")
    private BigDecimal discount;

    @DecimalMin(value = "0.0", message = "Tax cannot be negative")
    private BigDecimal tax;

}
