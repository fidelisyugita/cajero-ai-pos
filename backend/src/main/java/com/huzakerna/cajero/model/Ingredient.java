package com.huzakerna.cajero.model;

import java.math.BigDecimal;
import java.util.UUID;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ingredients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ingredient extends BaseEntity {

    @Column(name = "store_id")
    private UUID storeId;

    @Column(nullable = false, length = 50)
    private String name; // e.g., "Sugar", "Coffee"

    private String description;
    private BigDecimal stock;

    // @Column(name = "measure_unit_code")
    // private String measureUnitCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "measure_unit_code")
    private MeasureUnit measureUnit;

    @Column(name = "created_By")
    private UUID createdBy;
    @Column(name = "updated_By")
    private UUID updatedBy;

}
