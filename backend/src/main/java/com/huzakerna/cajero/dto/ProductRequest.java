package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
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

    @NotBlank(message = "Product name cannot be empty")
    private String name;

    @Builder.Default
    private Set<ProductIngredientRequest> ingredients = new HashSet<>();

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    @NotNull(message = "Category Code is required")
    private String categoryCode;

    @NotBlank
    @Size(max = 10)
    private String measureUnitCode; // Stores the measure unit code

    // Optional fields with validation
    // @Size(max = 255, message = "Image URL too long")
    private String imageUrl;
    private String barcode;

    @NotNull(message = "Stock is required")
    @Min(value = 0, message = "Stock cannot be negative")
    private BigDecimal stock;

    @DecimalMin(value = "0.0", message = "Buying price cannot be negative")
    private BigDecimal buyingPrice;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.1", message = "Stock cannot be negative")
    private BigDecimal sellingPrice;

    @DecimalMin(value = "0.0", message = "Commission cannot be negative")
    private BigDecimal commission;

    @DecimalMin(value = "0.0", message = "Discount cannot be negative")
    private BigDecimal discount;

    @DecimalMin(value = "0.0", message = "Tax cannot be negative")
    private BigDecimal tax;
}
