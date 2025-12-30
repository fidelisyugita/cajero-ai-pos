package com.huzakerna.cajero.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ProductResponse extends BaseResponse {

    private String name;
    private String imageUrl;
    private String description;
    private BigDecimal stock;
    private Integer rejectCount;
    private Integer soldCount;
    private String categoryCode;
    private String measureUnitCode;
    private String measureUnitName;
    private String barcode;

    private BigDecimal buyingPrice;
    private BigDecimal sellingPrice;

    private BigDecimal commission;
    private BigDecimal discount;
    private BigDecimal tax;

    private List<ProductIngredientResponse> ingredients;

}
