package com.huzakerna.cajero.model;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Transaction extends BaseEntity {

    @Column(name = "status_code")
    private String statusCode;
    @Column(name = "transaction_type_code")
    private String transactionTypeCode;
    @Column(name = "payment_method_code")
    private String paymentMethodCode;

    @Column(name = "is_in")
    private boolean isIn;

    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<TransactionProduct> transactionProducts;

    @Column(name = "total_commission")
    private BigDecimal totalCommission;
    @Column(name = "total_discount")
    private BigDecimal totalDiscount;
    @Column(name = "total_tax")
    private BigDecimal totalTax;

    private String description;

    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;

    @Column(name = "customer_id")
    private UUID customerId;

}
