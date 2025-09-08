package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
import java.util.UUID;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
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
public class VariantOptionRequest {

    private UUID id;

    @NotNull(message = "Variant Id is required")
    private UUID variantId;

    @NotBlank(message = "Name cannot be blank")
    private String name;

    @DecimalMin(value = "0.0", message = "Stock cannot be negative")
    private BigDecimal priceAdjusment;

    @DecimalMin(value = "0.0", message = "Stock cannot be negative")
    private BigDecimal stock;

}
