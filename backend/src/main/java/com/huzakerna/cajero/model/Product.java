package com.huzakerna.cajero.model;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
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
public class Product extends BaseEntity {

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "store_id")
    // private Store store;
    @Column(name = "store_id")
    private UUID storeId;

    @Column(name = "category_code")
    private String categoryCode;

    @Column(name = "measure_unit_code")
    private String measureUnitCode;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<ProductIngredient> productIngredients = new HashSet<>();

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

    @Column(name = "created_By")
    private UUID createdBy;
    @Column(name = "updated_By")
    private UUID updatedBy;

}
