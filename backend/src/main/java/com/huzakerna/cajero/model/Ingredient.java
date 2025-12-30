package com.huzakerna.cajero.model;

import java.math.BigDecimal;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "ingredients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Ingredient extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String name; // e.g., "Sugar", "Coffee"

    private String description;
    private BigDecimal stock;

    // @Column(name = "measure_unit_code")
    // private String measureUnitCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "measure_unit_code")
    private MeasureUnit measureUnit;

}
