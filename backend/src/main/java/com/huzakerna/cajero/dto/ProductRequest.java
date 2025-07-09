package com.huzakerna.cajero.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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
public class ProductRequest {

    // If @NotBlank is unavailable, use @NotEmpty + @NotNull
    @NotNull(message = "Product name is required")
    @NotEmpty(message = "Product name cannot be empty")
    private String name;

    @Size(max = 500, message = "Note must be less than 500 characters")
    private String note;

    @NotNull(message = "Stock is required")
    @Min(value = 0, message = "Stock cannot be negative")
    private Integer stock;

    @NotNull(message = "Category Code is required")
    private String categoryCode;

    @NotBlank
    @Size(max = 10)
    private String measureUnitCode;  // Stores the measure unit code

    // Optional fields with validation
    @Size(max = 255, message = "Image URL too long")
    private String imageUrl;

    @DecimalMin(value = "0.0", message = "Buying price cannot be negative")
    private BigDecimal buyingPrice;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.01", message = "Selling price must be greater than 0")
    private BigDecimal sellingPrice;

    private Boolean commissionByPercent;

    @DecimalMin(value = "0.0", message = "Commission cannot be negative")
    private BigDecimal commission;
}
