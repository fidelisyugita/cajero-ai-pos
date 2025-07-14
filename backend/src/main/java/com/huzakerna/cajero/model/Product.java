package com.huzakerna.cajero.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
public class Product extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "store_id")
    private Store store;

    private String description;
    private Integer stock;
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

    @Column(name = "commission_by_percent")
    private boolean commissionByPercent;
    private BigDecimal commission;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "category_code", referencedColumnName = "code")
    private ProductCategory category;

    @ManyToOne
    @JoinColumn(name = "measure_unit_code", referencedColumnName = "code")
    private MeasureUnit measureUnit;

}
