package com.huzakerna.cajero.model;

import java.math.BigDecimal;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @EmbeddedId
    private ProductVariantId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId") // This matches the field name in ProductVariantId
    @JoinColumn(name = "product_id") // This matches the actual DB column
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("variantId") // Matches field name in ProductVariantId
    @JoinColumn(name = "variant_id") // Matches DB column
    private Variant variant;

    @Column(name = "stock")
    private Integer stock;
    @Column(name = "price_adjustment")
    private BigDecimal priceAdjustment;
}
