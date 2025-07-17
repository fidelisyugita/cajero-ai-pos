package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import com.huzakerna.cajero.model.ProductVariant;
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

    @NotNull(message = "Store Id is required")
    private UUID storeId;

    @Builder.Default
    private Set<ProductVariant> productVariants = new HashSet<>();

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    @NotNull(message = "Stock Quantity is required")
    @Min(value = 0, message = "Stock Quantity cannot be negative")
    private Integer stockQuantity;

    @NotNull(message = "Category Code is required")
    private String categoryCode;

    @NotBlank
    @Size(max = 10)
    private String measureUnitCode; // Stores the measure unit code

    // Optional fields with validation
    @Size(max = 255, message = "Image URL too long")
    private String imageUrl;

    @DecimalMin(value = "0.0", message = "Buying price cannot be negative")
    private BigDecimal buyingPrice;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.1", message = "Stock cannot be negative")
    private BigDecimal sellingPrice;

    @Min(value = 0, message = "Stock cannot be negative")
    private Integer commissionByPercent;

    @DecimalMin(value = "0.0", message = "Commission cannot be negative")
    private BigDecimal commission;
}
