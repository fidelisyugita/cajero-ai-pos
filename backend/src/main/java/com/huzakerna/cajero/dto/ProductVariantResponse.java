package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
import java.util.UUID;
import com.fasterxml.jackson.databind.JsonNode;
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
public class ProductVariantResponse {

    // from Product
    private UUID variantId;
    private String name;
    private String description;
    private boolean isRequired;
    private boolean isMultiple;
    private JsonNode options;

    // itself
    private Integer stock;
    private BigDecimal priceAdjustment;

}
