package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

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
public class IngredientResponse {

    private UUID id;
    private UUID storeId;
    private String name;
    private BigDecimal stock;
    private String measureUnitCode;
    private String measureUnitName;
    private String description;

    private UUID createdBy;
    private UUID updatedBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
