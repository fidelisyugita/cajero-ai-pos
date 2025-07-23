package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.fasterxml.jackson.databind.JsonNode;
import com.huzakerna.cajero.model.Product;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
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
    private UUID storeId;
    private String name;
    private String description;
    private boolean isRequired;
    private boolean isMultiple;
    private JsonNode options;

    // itself
    private Integer stockQuantity;
    private BigDecimal priceAdjustment;

}
