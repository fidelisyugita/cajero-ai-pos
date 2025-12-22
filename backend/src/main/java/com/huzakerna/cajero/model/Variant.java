package com.huzakerna.cajero.model;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

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

@Entity
@Table(name = "variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Variant extends BaseEntity {

    @Column(name = "store_id")
    private UUID storeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "product_id", insertable = false, updatable = false)
    private UUID productId;

    @Column(nullable = false, length = 50)
    private String name; // e.g., "Sugar", "Topping", "Ice Level"

    private String description;
    @Column(name = "is_required")
    private boolean isRequired;
    @Column(name = "is_multiple")
    private boolean isMultiple;

    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<VariantOption> options = new HashSet<>();

    @Column(name = "created_By")
    private UUID createdBy;
    @Column(name = "updated_By")
    private UUID updatedBy;

}
