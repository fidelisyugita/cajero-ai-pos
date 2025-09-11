package com.huzakerna.cajero.model;

import java.math.BigDecimal;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
@Table(name = "variant_options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VariantOption {

    @Id
    @UuidGenerator(style = UuidGenerator.Style.TIME) // Modern UUID generation
    @Column(columnDefinition = "uuid DEFAULT uuid_generate_v4()")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private Variant variant;

    @Column(name = "variant_id", insertable = false, updatable = false)
    private UUID variantId;

    @Column(nullable = false, length = 50)
    private String name; // e.g., "Low", "Normal", "High"

    @Column(name = "price_adjusment")
    private BigDecimal priceAdjusment;

    private BigDecimal stock;
}
