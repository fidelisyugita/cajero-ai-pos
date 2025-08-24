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
public class TransactionProductResponse {

    // from Product
    private UUID productId;
    private String categoryCode;
    private String measureUnitCode;
    private String name;
    private String description;
    private Integer stock;
    private Integer rejectCount;
    private Integer soldCount;
    private String imageUrl;

    // itself
    private JsonNode selectedVariants;
    private String note;
    private Integer quantity;
    private BigDecimal buyingPrice;
    private BigDecimal sellingPrice;
    private BigDecimal commission;
    private boolean isCommissionByPercent;

}
