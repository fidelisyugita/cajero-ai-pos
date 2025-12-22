package com.huzakerna.cajero.model;

import java.math.BigDecimal;
import java.util.UUID;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "stock_movements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovement extends BaseEntity {

    @Column(name = "store_id")
    private UUID storeId;
    @Column(name = "ingredient_id")
    private UUID ingredientId;
    @Column(name = "product_id")
    private UUID productId;
    @Column(name = "variant_id")
    private UUID variantId;

    @Column(name = "transaction_id")
    private UUID transactionId;

    @Column(name = "type")
    private String type;

    @Column(name = "quantity")
    private BigDecimal quantity;

    @Column(name = "created_By")
    private UUID createdBy;
    @Column(name = "updated_By")
    private UUID updatedBy;

}
