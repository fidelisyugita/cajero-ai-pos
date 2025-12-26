package com.huzakerna.cajero.model;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Product extends BaseEntity {

    @Column(name = "category_code")
    private String categoryCode;

    // @Column(name = "measure_unit_code")
    // private String measureUnitCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "measure_unit_code")
    private MeasureUnit measureUnit;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private Set<ProductIngredient> ingredients = new HashSet<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private Set<Variant> variants = new HashSet<>();

    @Column(nullable = false)
    private String name;

    private String description;
    @Column(name = "stock")
    private BigDecimal stock;
    @Column(name = "reject_count")
    private Integer rejectCount;
    @Column(name = "sold_count")
    private Integer soldCount;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "buying_price")
    private BigDecimal buyingPrice;
    @Column(name = "selling_price")
    private BigDecimal sellingPrice;

    private String barcode;
    private BigDecimal commission;
    private BigDecimal discount;
    private BigDecimal tax;

}
