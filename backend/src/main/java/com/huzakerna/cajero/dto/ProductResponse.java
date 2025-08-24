package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
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
public class ProductResponse {

    private UUID id;
    private UUID storeId;

    private String name;
    private String imageUrl;
    private String description;
    private Integer stock;
    private Integer rejectCount;
    private Integer soldCount;
    private String categoryCode;
    private String measureUnitCode;

    private BigDecimal buyingPrice;
    private BigDecimal sellingPrice;

    private boolean isCommissionByPercent;
    private BigDecimal commission;

    private List<ProductVariantResponse> productVariants;

    private UUID createdBy;
    private UUID updatedBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
