package com.huzakerna.cajero.dto;

import java.math.BigDecimal;

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
public class IngredientResponse extends BaseResponse {

    private String name;
    private BigDecimal stock;
    private String measureUnitCode;
    private String measureUnitName;
    private String description;

}
