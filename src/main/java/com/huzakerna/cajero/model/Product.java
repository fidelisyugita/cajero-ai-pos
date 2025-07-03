package com.huzakerna.cajero.model;

import java.math.BigDecimal;
import java.util.UUID;

import org.hibernate.annotations.GenericGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(
            name = "UUID",
            strategy = "org.hibernate.id.UUIDGenerator"
    )
    @Column(columnDefinition = "uuid DEFAULT uuid_generate_v4()")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "category_code", referencedColumnName = "code")
    private ProductCategory category;

    @ManyToOne
    @JoinColumn(name = "measure_unit_code", referencedColumnName = "code")
    private MeasureUnit measureUnit;

    @Column(nullable = false)
    private String name;
    private String description;
    private Integer stock;

    // Other fields from your table
    private String imageUrl;
    @Column(name = "buying_price")
    private BigDecimal buyingPrice;
    @Column(name = "selling_price")
    private BigDecimal sellingPrice;
    @Column(name = "commission_by_percent")
    private Boolean commissionByPercent;
    private BigDecimal commission;

}
