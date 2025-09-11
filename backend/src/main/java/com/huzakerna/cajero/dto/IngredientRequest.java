package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
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
public class IngredientRequest {

    @NotBlank(message = "Ingredient name cannot be empty")
    private String name;

    @DecimalMin(value = "0.0", message = "Stock cannot be negative")
    private BigDecimal stock;

    @NotBlank
    @Size(max = 10)
    private String measureUnitCode; // Stores the measure unit code

    private String description;

}
