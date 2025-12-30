package com.huzakerna.cajero.model;

import java.io.Serializable;
import java.util.UUID;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@lombok.EqualsAndHashCode
public class TransactionProductId implements Serializable {
    @Column(name = "transaction_id")
    private UUID transactionId;
    @Column(name = "product_id")
    private UUID productId;

}
