package com.huzakerna.cajero.model;

import java.math.BigDecimal;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
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
@Table(name = "transaction_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@lombok.EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class TransactionProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "selected_variants", columnDefinition = "jsonb")
    private JsonNode selectedVariants;

    private String note;

    @Column(nullable = false)
    private BigDecimal quantity;

    @Column(name = "buying_price", nullable = false)
    private BigDecimal buyingPrice;

    @Column(name = "selling_price", nullable = false)
    private BigDecimal sellingPrice;

    private BigDecimal commission;
    private BigDecimal discount;
    private BigDecimal tax;

}
