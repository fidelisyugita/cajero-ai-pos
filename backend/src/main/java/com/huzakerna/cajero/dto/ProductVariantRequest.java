package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
import java.util.UUID;
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
public class ProductVariantRequest {

    @NotNull(message = "Variant Id is required")
    private UUID variantId;

    @NotNull(message = "Stock Quantity is required")
    @Min(value = 0, message = "Stock Quantity cannot be negative")
    private Integer stockQuantity;

    @NotNull(message = "Price Adjustment is required")
    @DecimalMin(value = "0.0", message = "Stock cannot be negative")
    private BigDecimal priceAdjustment;

}
